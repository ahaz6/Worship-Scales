import { describe, expect, it } from 'vitest'
import { orderTextColumns, type PositionedLine } from './layout'
import { buildChart } from './parser'

const line = (text: string, x: number, y: number, width = 150): PositionedLine => ({
  text, x, y, width, height: 14,
})

describe('OCR reading order', () => {
  it('reads a two-column song top to bottom within each column', () => {
    const lines = [
      line('[Verse]', 20, 40), line('[Chorus]', 400, 40),
      line('D Bm', 20, 60), line('D G', 400, 60),
      line('Ich weiß, er hat mich befreit', 20, 80, 245),
      line('Mein Erlöser lebt!', 400, 80, 190),
      line('A G', 20, 100), line('Bm A', 400, 100),
      line('Sein Blut bedeckt meine Schuld', 20, 120, 255),
      line('Mein Erlöser lebt!', 400, 120, 190),
    ]

    expect(orderTextColumns(lines).map((item) => item.text)).toEqual([
      '[Verse]', 'D Bm', 'Ich weiß, er hat mich befreit',
      'A G', 'Sein Blut bedeckt meine Schuld',
      '[Chorus]', 'D G', 'Mein Erlöser lebt!', 'Bm A', 'Mein Erlöser lebt!',
    ])
  })

  it('keeps a single-column song in its original order', () => {
    const lines = [
      line('G D Em C', 20, 10, 480),
      line('Mein Erlöser lebt!', 20, 30, 480),
      line('G D Em C', 20, 50, 480),
      line('Mein Erlöser lebt!', 20, 70, 480),
    ]
    expect(orderTextColumns(lines).map((item) => item.y)).toEqual([10, 30, 50, 70])
  })

  it('builds separate Nashville sections from a two-column screenshot', () => {
    const lines = [
      line('[Verse]', 20, 40), line('[Chorus]', 400, 40),
      line('D Bm', 20, 60), line('D G', 400, 60),
      line('Ich weiß, er hat mich befreit', 20, 80, 245),
      line('Mein Erlöser lebt!', 400, 80, 190),
      line('A G', 20, 100), line('Bm A', 400, 100),
      line('Sein Blut bedeckt meine Schuld', 20, 120, 255),
      line('Mein Erlöser lebt!', 400, 120, 190),
    ]
    const source = orderTextColumns(lines).map((item) => item.text).join('\n')
    const aMajor = { root: 'A', pitchClass: 9, mode: 'major' as const }
    const chart = buildChart(source, aMajor, 0, 'Mein Erlöser lebt.png')

    expect(chart.lines.map((item) => item.kind)).toEqual([
      'section', 'chords', 'lyrics', 'chords', 'lyrics',
      'section', 'chords', 'lyrics', 'chords', 'lyrics',
    ])
    expect(chart.lines[1].output).toBe('4 2m')
    expect(chart.lines[6].output).toBe('4 b7')
    expect(chart.lines[7].output).toBe('Mein Erlöser lebt!')
  })
})
