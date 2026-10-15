const GERMAN_MOJIBAKE: Record<string, string> = {
  '\u00c3\u00a4': 'ä',
  '\u00c3\u00b6': 'ö',
  '\u00c3\u00bc': 'ü',
  '\u00c3\u0084': 'Ä',
  '\u00c3\u201e': 'Ä',
  '\u00c3\u0096': 'Ö',
  '\u00c3\u2013': 'Ö',
  '\u00c3\u009c': 'Ü',
  '\u00c3\u0153': 'Ü',
  '\u00c3\u009f': 'ß',
}

export function normalizeImportedText(text: string): string {
  const repaired = Object.entries(GERMAN_MOJIBAKE).reduce(
    (value, [broken, replacement]) => value.replaceAll(broken, replacement),
    text,
  )

  return repaired
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000\uFEFF]/g, '')
    .replace(/\u00ad/g, '')
    .replace(/\u00a0/g, ' ')
    .normalize('NFC')
    .trim()
}
