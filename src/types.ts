export type KeyMode = 'major' | 'minor'

export type LineKind = 'blank' | 'section' | 'chords' | 'lyrics' | 'mixed' | 'meta'

export interface KeyChoice {
  root: string
  pitchClass: number
  mode: KeyMode
}

export interface KeyDetection extends KeyChoice {
  confidence: number
  source: 'explicit' | 'inferred' | 'fallback'
  capo: number
  chordCount: number
  shapeKey?: string
}

export interface ParsedChord {
  original: string
  root: string
  rootPitchClass: number
  suffix: string
  bass?: string
  bassPitchClass?: number
}

export interface ChartLine {
  id: string
  kind: LineKind
  source: string
  output: string
}

export interface ChordMapping {
  chord: string
  number: string
}

export interface SongChart {
  title: string
  artist?: string
  lines: ChartLine[]
  mappings: ChordMapping[]
}

export interface ImportProgress {
  stage: 'reading' | 'extracting' | 'ocr' | 'analysing' | 'done'
  label: string
  progress: number
}
