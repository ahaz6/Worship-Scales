import { describe, expect, it } from 'vitest'
import { buildChart, getLineKind } from './parser'

const gMajor = { root: 'G', pitchClass: 7, mode: 'major' as const }

describe('chord sheet parser', () => {
  it('recognises sections, chord lines and lyrics', () => {
    expect(getLineKind('[Verse 1]')).toBe('section')
    expect(getLineKind('G     D/F#   Em  C')).toBe('chords')
    expect(getLineKind('Amazing grace, how sweet the sound')).toBe('lyrics')
  })

  it('converts inline Ultimate Guitar style chords', () => {
    const chart = buildChart('[Verse 1]\n[G]Amazing [C]grace', gMajor)
    expect(chart.lines[1].output).toBe('[1]Amazing [4]grace')
  })

  it('keeps unique chord mappings', () => {
    const chart = buildChart('G D Em C\nG D C', gMajor)
    expect(chart.mappings).toEqual([
      { chord: 'G', number: '1' },
      { chord: 'D', number: '5' },
      { chord: 'Em', number: '6m' },
      { chord: 'C', number: '4' },
    ])
  })

  it('converts the seventh chords in Mein Erlöser lebt from their root letters', () => {
    const eMajor = { root: 'E', pitchClass: 4, mode: 'major' as const }
    const source = 'Mein Erlöser lebt\nKey: E\n\nE7 A7 E7 A7\nC#m7 B7 A E'
    const chart = buildChart(source, eMajor)

    expect(chart.lines[3].output).toBe('1⁷ 4⁷ 1⁷ 4⁷')
    expect(chart.lines[4].output).toBe('6m⁷ 5⁷ 4 1')
    expect(chart.mappings).toContainEqual({ chord: 'E7', number: '1⁷' })
  })

  it('uses header metadata without repeating it in the chart body', () => {
    const chart = buildChart('Amazing Grace\nArtist: Traditional\nKey: G\n\nG C', gMajor)
    expect(chart.title).toBe('Amazing Grace')
    expect(chart.artist).toBe('Traditional')
    expect(chart.lines.slice(0, 3).every((line) => line.kind === 'meta')).toBe(true)
  })
})
