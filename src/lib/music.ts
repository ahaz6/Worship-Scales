import type { KeyChoice, KeyDetection, KeyMode, ParsedChord } from '../types'

const NOTE_TO_PC: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
  'B#': 0,
}

const DISPLAY_ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10]

const MAJOR_DEGREES = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7']
const MINOR_DEGREES = ['1', 'b2', '2', '3', '#3', '4', '#4', '5', '6', '#6', '7', '#7']

const EXPECTED_MAJOR = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished']
const EXPECTED_MINOR = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major']

export const KEY_ROOTS = DISPLAY_ROOTS.map((root, pitchClass) => ({ root, pitchClass }))

const mod = (value: number, by = 12) => ((value % by) + by) % by

export function normalizeNote(note: string): string {
  const normalized = note
    .trim()
    .replaceAll('♯', '#')
    .replaceAll('♭', 'b')
  if (!normalized) return normalized
  return normalized[0].toUpperCase() + normalized.slice(1)
}

export function noteToPitchClass(note: string): number | undefined {
  const normalized = normalizeNote(note)
  if (normalized in NOTE_TO_PC) return NOTE_TO_PC[normalized]

  const match = normalized.match(/^([A-G])([#b]{1,2})$/)
  if (!match) return undefined
  const natural = NOTE_TO_PC[match[1]]
  const accidental = [...match[2]].reduce((sum, symbol) => sum + (symbol === '#' ? 1 : -1), 0)
  return mod(natural + accidental)
}

export function pitchClassToRoot(pitchClass: number): string {
  return DISPLAY_ROOTS[mod(pitchClass)]
}

function stripTokenWrapper(token: string): string {
  return token
    .trim()
    .replace(/^[|:,[{]+/, '')
    .replace(/[|:,;\]}]+$/, '')
}

export function parseChord(token: string): ParsedChord | null {
  const original = stripTokenWrapper(token)
  if (!original || /^(?:N\.?C\.?|no\s*chord)$/i.test(original)) return null

  const match = original.match(/^([A-Ga-g])([#b♯♭]{0,2})([^/\s]*?)(?:\/([A-Ga-g])([#b♯♭]{0,2}))?$/)
  if (!match) return null

  const suffix = match[3] ?? ''
  const suffixRemainder = suffix.replace(/maj|min|dim|aug|sus|add|no/gi, '')
  if (!/^[mM0-9#b()+\-°øΔ]*$/.test(suffixRemainder)) return null

  const root = normalizeNote(`${match[1]}${match[2]}`)
  const rootPitchClass = noteToPitchClass(root)
  if (rootPitchClass === undefined) return null

  const bass = match[4] ? normalizeNote(`${match[4]}${match[5]}`) : undefined
  const bassPitchClass = bass ? noteToPitchClass(bass) : undefined

  return {
    original,
    root,
    rootPitchClass,
    suffix,
    bass,
    bassPitchClass,
  }
}

export function chordQuality(chord: ParsedChord): 'major' | 'minor' | 'diminished' | 'augmented' {
  const suffix = chord.suffix.toLowerCase()
  if (/^(?:dim|o|°|ø)/.test(suffix)) return 'diminished'
  if (/^(?:aug|\+)/.test(suffix)) return 'augmented'
  if (/^(?:m(?!aj)|min|-)/.test(suffix)) return 'minor'
  return 'major'
}

function normalizeSuffix(suffix: string): string {
  if (!suffix) return ''
  return suffix
    .replace(/^minor/i, 'm')
    .replace(/^min/i, 'm')
    .replace(/^dim/i, '°')
    .replace(/^o(?=\d|$)/i, '°')
    .replace(/^aug/i, '+')
    .replace(/^-/, 'm')
}

export function intervalToDegree(interval: number, mode: KeyMode): string {
  return (mode === 'major' ? MAJOR_DEGREES : MINOR_DEGREES)[mod(interval)]
}

export function chordToNashville(
  chordOrToken: ParsedChord | string,
  key: KeyChoice,
  capo = 0,
): string | null {
  const chord = typeof chordOrToken === 'string' ? parseChord(chordOrToken) : chordOrToken
  if (!chord) return null

  const soundingRoot = mod(chord.rootPitchClass + capo)
  const rootDegree = intervalToDegree(soundingRoot - key.pitchClass, key.mode)
  const suffix = normalizeSuffix(chord.suffix)

  if (chord.bassPitchClass === undefined) return `${rootDegree}${suffix}`

  const soundingBass = mod(chord.bassPitchClass + capo)
  const bassDegree = intervalToDegree(soundingBass - key.pitchClass, key.mode)
  return `${rootDegree}${suffix}/${bassDegree}`
}

function chordTokensFromText(text: string): ParsedChord[] {
  const chords: ParsedChord[] = []

  for (const bracket of text.matchAll(/\[([^\]]+)\]/g)) {
    const chord = parseChord(bracket[1])
    if (chord) chords.push(chord)
  }

  for (const line of text.split(/\r?\n/)) {
    if (/\[[^\]]+\]/.test(line)) continue
    const candidates = line.trim().split(/\s+/).filter(Boolean)
    if (!candidates.length) continue
    const parsed = candidates.map(parseChord).filter((chord): chord is ParsedChord => chord !== null)
    const structural = candidates.filter((token) => /^[|:.,]+$/.test(token)).length
    const meaningfulCount = Math.max(1, candidates.length - structural)
    if (parsed.length >= 2 || (parsed.length === 1 && meaningfulCount <= 2)) chords.push(...parsed)
  }

  return chords
}

function parseExplicitKey(text: string): { pitchClass: number; mode: KeyMode; root: string } | null {
  const match = text.match(/(?:^|\b)(?:key|tonart)\s*[:=\-]?\s*([A-Ga-g](?:#|b|♯|♭)?)(?:\s*(m(?!aj)|min(?:or)?|moll|major|dur))?/im)
  if (!match) return null

  const root = normalizeNote(match[1])
  const pitchClass = noteToPitchClass(root)
  if (pitchClass === undefined) return null
  const modeToken = (match[2] ?? '').toLowerCase()
  const mode: KeyMode = /^(?:m|min|moll)/.test(modeToken) ? 'minor' : 'major'
  return { root: pitchClassToRoot(pitchClass), pitchClass, mode }
}

export function detectCapo(text: string): number {
  const match = text.match(/(?:^|\b)capo\s*(?::|=|-)?\s*(\d{1,2})/im)
  const capo = match ? Number(match[1]) : 0
  return Number.isFinite(capo) && capo >= 0 && capo <= 11 ? capo : 0
}

function scoreCandidate(chords: ParsedChord[], pitchClass: number, mode: KeyMode): number {
  const intervals = mode === 'major' ? MAJOR_INTERVALS : MINOR_INTERVALS
  const expected = mode === 'major' ? EXPECTED_MAJOR : EXPECTED_MINOR
  let score = 0

  chords.forEach((chord, index) => {
    const interval = mod(chord.rootPitchClass - pitchClass)
    const degree = intervals.indexOf(interval)
    if (degree === -1) {
      score -= 1.1
      return
    }

    score += 2.2
    const quality = chordQuality(chord)
    if (quality === expected[degree]) score += 1.25
    else if (mode === 'minor' && degree === 4 && quality === 'major') score += 0.85
    else if (quality !== 'augmented') score -= 0.35

    if (degree === 0) score += 0.7
    if ((index === 0 || index === chords.length - 1) && degree === 0) score += 1.35
    if (degree === 4) score += 0.25
  })

  return score
}

export function detectKey(text: string): KeyDetection {
  const capo = detectCapo(text)
  const chords = chordTokensFromText(text)
  const explicit = parseExplicitKey(text)

  const candidates = KEY_ROOTS.flatMap(({ root, pitchClass }) =>
    (['major', 'minor'] as KeyMode[]).map((mode) => ({
      root,
      pitchClass,
      mode,
      score: scoreCandidate(chords, pitchClass, mode),
    })),
  ).sort((a, b) => b.score - a.score)

  const bestShape = candidates[0]
  if (explicit) {
    return {
      ...explicit,
      confidence: chords.length ? 0.99 : 0.96,
      source: 'explicit',
      capo,
      chordCount: chords.length,
      shapeKey: bestShape?.root,
    }
  }

  if (!chords.length || !bestShape) {
    return {
      root: 'C',
      pitchClass: 0,
      mode: 'major',
      confidence: 0,
      source: 'fallback',
      capo,
      chordCount: 0,
    }
  }

  const runnerUp = candidates[1]
  const separation = bestShape.score - (runnerUp?.score ?? 0)
  const confidence = Math.min(0.94, Math.max(0.42, 0.5 + separation / Math.max(8, chords.length * 4)))
  const soundingPitchClass = mod(bestShape.pitchClass + capo)

  return {
    root: pitchClassToRoot(soundingPitchClass),
    pitchClass: soundingPitchClass,
    mode: bestShape.mode,
    confidence,
    source: 'inferred',
    capo,
    chordCount: chords.length,
    shapeKey: bestShape.root,
  }
}

export function keyLabel(key: KeyChoice): string {
  return `${key.root} ${key.mode === 'major' ? 'Dur' : 'Moll'}`
}
