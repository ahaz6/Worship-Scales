import { describe, expect, it } from 'vitest'
import { chordToNashville, detectCapo, detectKey, noteToPitchClass, parseChord } from './music'

describe('Nashville conversion', () => {
  const gMajor = { root: 'G', pitchClass: 7, mode: 'major' as const }

  it('converts a common worship progression', () => {
    expect(['G', 'D', 'Em', 'C'].map((chord) => chordToNashville(chord, gMajor))).toEqual([
      '1',
      '5',
      '6m',
      '4',
    ])
  })

  it('preserves slash basses and extensions', () => {
    expect(chordToNashville('D/F#', gMajor)).toBe('5/7')
    expect(chordToNashville('Am7', gMajor)).toBe('2m7')
    expect(chordToNashville('Dsus4', gMajor)).toBe('5sus4')
  })

  it('marks borrowed chromatic chords', () => {
    const cMajor = { root: 'C', pitchClass: 0, mode: 'major' as const }
    expect(chordToNashville('Bb', cMajor)).toBe('b7')
    expect(chordToNashville('F#', cMajor)).toBe('#4')
  })

  it('applies capo before calculating the sounding degree', () => {
    const bMajor = { root: 'B', pitchClass: 11, mode: 'major' as const }
    expect(chordToNashville('G', bMajor, 4)).toBe('1')
    expect(chordToNashville('D', bMajor, 4)).toBe('5')
  })
})

describe('chord and key analysis', () => {
  it('parses accidentals and slash chords', () => {
    expect(noteToPitchClass('Bb')).toBe(10)
    expect(parseChord('C#m7/G#')).toMatchObject({ root: 'C#', suffix: 'm7', bass: 'G#' })
  })

  it('prefers an explicit key and detects capo', () => {
    const text = 'Key: B\nCapo 4\nG D Em C'
    expect(detectCapo(text)).toBe(4)
    expect(detectKey(text)).toMatchObject({ root: 'B', mode: 'major', source: 'explicit', capo: 4 })
  })

  it('infers G major from a common progression', () => {
    const detection = detectKey('G D Em C\nG D C')
    expect(detection.root).toBe('G')
    expect(detection.mode).toBe('major')
    expect(detection.chordCount).toBeGreaterThan(3)
  })
})
