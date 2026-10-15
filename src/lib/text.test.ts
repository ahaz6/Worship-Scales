import { describe, expect, it } from 'vitest'
import { normalizeImportedText } from './text'

describe('imported text normalization', () => {
  it('preserves composed German lyrics', () => {
    const lyrics = 'Mein Erlöser lebt für Äonen · Öl · über · groß'
    expect(normalizeImportedText(lyrics)).toBe(lyrics)
  })

  it('composes decomposed umlauts from PDF text layers', () => {
    expect(normalizeImportedText('Erlo\u0308ser, Tu\u0308r, A\u0308hre')).toBe('Erlöser, Tür, Ähre')
  })

  it('repairs common UTF-8 mojibake and invisible PDF characters', () => {
    const imported = '\uFEFFDu bist gro\u00c3\u009f\u00a0und herrlich\u00ad\r\nJ\u00c3\u00bcnger'
    expect(normalizeImportedText(imported)).toBe('Du bist groß und herrlich\nJünger')
  })

  it('normalizes the accented OCR variant from Mein Erlöser Lebt', () => {
    expect(normalizeImportedText('Mein Erléser lebt!')).toBe('Mein Erlöser lebt!')
    expect(normalizeImportedText('Description: mein erloser lebt')).toBe('Description: mein erlöser lebt')
  })
})
