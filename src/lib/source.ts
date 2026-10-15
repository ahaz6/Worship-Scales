import { parseChord } from './music'
import { normalizeImportedText } from './text'

const SECTION = /\[(verse|vers|strophe|chorus|chor|refrain|pre[- ]?chorus|bridge|brücke|intro|outro|instrumental|interlude|tag|turnaround|ending)(?:\s+\d+)?\]/gi

export function prepareChordSheetText(input: string): string {
  let text = normalizeImportedText(input)
  if (!/\*\*[^*\n]+\*\*/.test(text)) return text

  text = text
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1')
    .replace(/^\s*#+\s*(.+?)\s+Chords\s*$/im, 'Title: $1')
    .replace(/^\s*by\s+\*\*(.+?)\*\*\s*$/im, 'Artist: $1')
    .replace(/^\s*by\s+(.+?)\s*$/im, 'Artist: $1')
    .replace(/^\s*\*\*svg\*\*\s*$/gim, '')
    .replace(/\*\*([^*\n]+)\*\*/g, (full, rawChord: string, offset: number, source: string) => {
      const chord = rawChord.trim()
      if (!parseChord(chord)) return chord
      const previous = source[offset - 1] ?? ''
      const newLine = /[\p{L}\p{N}!?.,]/u.test(previous) ? '\n' : ''
      return `${newLine}[${chord}]`
    })
    .replace(SECTION, (section) => `\n${section}\n`)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

export function findSuspiciousChordTokens(text: string): string[] {
  const suspicious = new Set<string>()

  for (const line of text.split(/\r?\n/)) {
    const tokens = line.trim().split(/\s+/).filter(Boolean)
    if (!tokens.length) continue
    const hasChord = tokens.some((token) => parseChord(token))
    if (!hasChord && tokens.length > 3) continue

    for (const token of tokens) {
      const cleaned = token.replace(/^[|:,[{]+|[|:,;\]}]+$/g, '')
      if (/^\d+[A-G]$|^[A-G]{2,3}$|^Cc$|^R$/.test(cleaned) && !parseChord(cleaned)) {
        suspicious.add(cleaned)
      }
    }
  }

  return [...suspicious]
}
