import { describe, expect, it } from 'vitest'
import { detectKey } from './music'
import { buildChart } from './parser'
import { findSuspiciousChordTokens, prepareChordSheetText } from './source'

describe('Ultimate Guitar text import', () => {
  it('uses the supplied original chords and explicit A key for Mein Erlöser Lebt', () => {
    const original = `# Mein Erlöser Lebt Chords
by [**Misc Praise Songs**](https://www.ultimate-guitar.com/artist/misc_praise_songs_888)
Description: Hillsong Worship - mein erloser lebt
Difficulty: intermediate
Tuning: E A D G B E
Key: A
[**svg**](https://tabs.ultimate-guitar.com/)
[Intro]**E7** **A7** **E7** **A7**  [Verse]**E7**             **A7**  Ich weiß, er hat mich befreit**E7**             **A7**  Sein Blut bedeckt meine Schuld
[Pre-chorus]**B7**  Lasst alle hören (oho oh)**A2**             **B**   Mein herr besiegte das Grab
[Chorus]**E** **A** Mein Erlöser lebt!**C#m7** **B** Mein Erlöser lebt!
[Bridge]**D** Du nimmst die Last mir**A** Ich steh auf mit dir**E** **F#m7** Ich laufe dir entgegen Herr
[Outro]**E7** **A7** **E7** **A7**`

    const prepared = prepareChordSheetText(original)
    const key = detectKey(prepared)
    const chart = buildChart(prepared, key)
    const mappings = Object.fromEntries(chart.mappings.map(({ chord, number }) => [chord, number]))

    expect(key).toMatchObject({ root: 'A', mode: 'major', source: 'explicit' })
    expect(chart.title).toBe('Mein Erlöser Lebt')
    expect(chart.artist).toBe('Misc Praise Songs')
    expect(mappings).toMatchObject({
      E7: '5⁷', A7: '1⁷', B7: '2⁷', A2: '1²', B: '2',
      E: '5', A: '1', 'C#m7': '3m⁷', D: '4', 'F#m7': '6m⁷',
    })
    expect(chart.lines.some((line) => line.kind === 'section' && line.output === '[Chorus]')).toBe(true)
    expect(chart.lines.some((line) => line.kind === 'mixed' && line.output.includes('Mein Erlöser lebt!'))).toBe(true)
    expect(chart.lines.every((line) => !line.output.includes('**'))).toBe(true)

    const eMajor = { root: 'E', pitchClass: 4, mode: 'major' as const }
    const eMappings = Object.fromEntries(
      buildChart(prepared, eMajor).mappings.map(({ chord, number }) => [chord, number]),
    )
    expect(eMappings).toMatchObject({ E7: '1⁷', A7: '4⁷', E: '1', A: '4', 'C#m7': '6m⁷', B: '5' })
  })

  it('flags the corrupt chord fragments in the supplied OCR result', () => {
    const ocr = 'Key: A\n[Intro]\nD GD G\n[Verse]\nD 6G\nMein Erléser lebt!\nD 6G DG\n[Bridge]\nCc\nR'
    expect(findSuspiciousChordTokens(ocr)).toEqual(expect.arrayContaining(['GD', '6G', 'DG', 'Cc', 'R']))
    expect(prepareChordSheetText(ocr)).toContain('Mein Erlöser lebt!')
  })
})
