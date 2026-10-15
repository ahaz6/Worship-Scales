import type { ChartLine, ChordMapping, KeyChoice, LineKind, SongChart } from '../types'
import { chordToNashville, parseChord } from './music'

const SECTION_PATTERN = /^\s*\[?\s*(verse|vers|strophe|chorus|chor|refrain|pre[- ]?chorus|bridge|brücke|intro|outro|instrumental|interlude|tag|turnaround|ending)(?:\s+\d+)?\s*\]?\s*:??\s*$/i
const META_PATTERN = /^\s*(key|tonart|capo|tuning|stimmung|tempo|bpm|title|titel|artist|interpret|von|description|beschreibung|difficulty|schwierigkeit)\s*[:=\-]/i
const URL_PATTERN = /^\s*https?:\/\/\S+\s*$/i

function tokenIsStructural(token: string): boolean {
  return /^[|:.,/\\]+$/.test(token)
}

function lineKind(source: string): LineKind {
  if (!source.trim()) return 'blank'
  if (SECTION_PATTERN.test(source)) return 'section'
  if (META_PATTERN.test(source)) return 'meta'
  if (URL_PATTERN.test(source)) return 'meta'

  const inlineChords = [...source.matchAll(/\[([^\]]+)\]/g)].filter((match) => parseChord(match[1]))
  if (inlineChords.length) return 'mixed'

  const tokens = source.trim().split(/\s+/).filter(Boolean)
  const meaningfulTokens = tokens.filter((token) => !tokenIsStructural(token))
  if (meaningfulTokens.length && meaningfulTokens.every((token) => parseChord(token))) return 'chords'
  return 'lyrics'
}

function convertChordLine(line: string, key: KeyChoice, capo: number): string {
  return line.replace(/[^\s]+/g, (token) => {
    const leading = token.match(/^[|:,[{]+/)?.[0] ?? ''
    const trailing = token.match(/[|:,;\]}]+$/)?.[0] ?? ''
    const converted = chordToNashville(token, key, capo)
    return converted ? `${leading}${converted}${trailing}` : token
  })
}

function convertMixedLine(line: string, key: KeyChoice, capo: number): string {
  return line.replace(/\[([^\]]+)\]/g, (full, token: string) => {
    const converted = chordToNashville(token, key, capo)
    return converted ? `[${converted}]` : full
  })
}

function extractTitle(text: string, fileName?: string): string {
  const titleMeta = text.match(/^\s*(?:title|titel)\s*[:=\-]\s*(.+)$/im)?.[1]?.trim()
  if (titleMeta) return titleMeta

  const lines = text.split(/\r?\n/)
  const firstSection = lines.findIndex((line) => SECTION_PATTERN.test(line))
  const headingLines = firstSection === -1 ? lines : lines.slice(0, firstSection)
  const firstContent = headingLines
    .map((line) => line.trim())
    .find((line) => line && lineKind(line) === 'lyrics')

  if (firstContent && firstContent.length <= 80) return firstContent.replace(/^#+\s*/, '')
  if (fileName) return fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
  return 'Neuer Song'
}

function extractArtist(text: string): string | undefined {
  return text.match(/^\s*(?:artist|interpret|von)\s*[:=\-]\s*(.+)$/im)?.[1]?.trim()
}

export function buildChart(text: string, key: KeyChoice, capo = 0, fileName?: string): SongChart {
  const mappingMap = new Map<string, string>()
  const title = extractTitle(text, fileName)
  const lines: ChartLine[] = text.split(/\r?\n/).map((source, index) => {
    let kind = lineKind(source)
    if (index < 5 && source.trim().replace(/^#+\s*/, '') === title) kind = 'meta'
    let output = source

    if (kind === 'chords') output = convertChordLine(source, key, capo)
    if (kind === 'mixed') output = convertMixedLine(source, key, capo)

    if (kind === 'chords' || kind === 'mixed') {
      const chordCandidates = kind === 'mixed'
        ? [...source.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1])
        : source.split(/\s+/)

      chordCandidates.forEach((token) => {
        const parsed = parseChord(token)
        const converted = parsed ? chordToNashville(parsed, key, capo) : null
        if (parsed && converted && !mappingMap.has(parsed.original)) mappingMap.set(parsed.original, converted)
      })
    }

    return {
      id: `line-${index}`,
      kind,
      source,
      output,
    }
  })

  const mappings: ChordMapping[] = [...mappingMap.entries()].map(([chord, number]) => ({ chord, number }))

  return {
    title,
    artist: extractArtist(text),
    lines,
    mappings,
  }
}

export function chartToPlainText(chart: SongChart): string {
  return chart.lines
    .filter((line) => line.kind !== 'meta')
    .map((line) => line.output)
    .join('\n')
    .trim()
}

export function getLineKind(line: string): LineKind {
  return lineKind(line)
}
