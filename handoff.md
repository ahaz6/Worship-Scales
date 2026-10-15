# Worship Scales — Handoff

## Produktziel

Worship Scales verwandelt Chord-Sheets aus PDF-Dateien, Screenshots oder eingefügtem Text in gut lesbare Nashville-Number-Charts. Musikerinnen und Musiker sollen denselben Chart unabhängig vom Instrument und von einer späteren Transposition nutzen können.

## Kern-Workflow

1. PDF, PNG, JPG oder TXT per Drag-and-drop importieren.
2. Text aus nativen PDFs direkt auslesen; Bilddateien und gescannte PDF-Seiten per OCR erfassen.
3. Akkordzeilen, Abschnittsmarker und Liedtext voneinander unterscheiden.
4. Eine angegebene Tonart (`Key: G`, `Tonart: D`) bevorzugen, ansonsten aus den Akkorden schätzen.
5. Capo-Angaben erkennen und die klingenden Akkorde berücksichtigen.
6. Tonart und Dur/Moll manuell korrigieren können.
7. Akkorde in Nashville-Zahlen umwandeln, inklusive Moll, Septakkorden, Erweiterungen, Vorzeichen und Slash-Bässen. Der Grundtonbuchstabe bestimmt die Stufe; Erweiterungsziffern werden zur Unterscheidung hochgestellt (`E7` in E-Dur → `1⁷`).
8. Chart kopieren oder über den Browser drucken/als PDF sichern.

## Implementierter Umfang

- React-/TypeScript-Single-Page-App ohne Backend
- PDF.js für PDF-Text und Seiten-Rendering
- Tesseract.js mit deutschen und englischen Sprachmodellen für lokale OCR im Browser
- Unicode-Normalisierung für Umlaute und Reparatur typischer PDF-Zeichenfehler
- Nashville-Konvertierung für Dur und natürliches Moll
- Automatische Tonartbewertung für 12 Tonzentren in Dur/Moll
- Erkennung expliziter Key- und Capo-Metadaten
- Akkordzeilen sowie Ultimate-Guitar-artige `[G]Inline-Akkorde`
- Erhalt von `m`, `maj7`, `7`, `sus`, `add`, `dim`, `aug` und Slash-Bässen
- Editierbarer Quelltext für OCR-Korrekturen
- Responsive Stage-/Editor-Ansicht
- Druckansicht und Zwischenablage
- Worship-Keys-Farbsystem aus `ahaz6/worship-keys` (`Design-Art.md`/`app/globals.css`, Referenz-Commit `985cc15`)
- Lokal gebündelte Geist-Sans- und Geist-Mono-Typografie
- Einheitliche Chart-Farben: Lyrics weiß, Nashville-Zahlen violett

## Bewusste Grenzen

- OCR kann bei unscharfen, gedrehten oder stark dekorierten Vorlagen Korrekturen benötigen.
- Ein PDF ohne maschinenlesbaren Text wird seitenweise gerendert und erkannt; große Dokumente dauern entsprechend länger.
- Die Key-Erkennung ist eine musikalische Heuristik. Modulationen und modale Songs brauchen gegebenenfalls eine manuelle Key-Wahl.
- Die App lädt keine Lyrics oder Ultimate-Guitar-Inhalte selbst herunter. Importiert werden ausschließlich Dateien bzw. Texte, die die nutzende Person bereitstellt und verwenden darf.
- Nashville-Konventionen unterscheiden sich bei Molltonarten. Diese Version nummeriert bei gewähltem Mollmodus relativ zur natürlichen Molltonleiter; Akkordqualitäten bleiben sichtbar.

## Lokale Entwicklung

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Qualitätssicherung:

```bash
npm test
npm run build
```

## Nächste sinnvolle Ausbaustufen

1. Mehrseitige Setlists und Songbibliothek in IndexedDB
2. Manuelles Verschieben von Akkorden über einzelne Wörter
3. Live-Stage-Modus mit Fußpedal-/MIDI-Steuerung
4. Akkorddiagramme für Gitarre, Keys und Bass
5. Optionales Cloud-Sync mit sauberem Rechte-/Lizenzmodell
6. Mehrsprachige OCR-Pakete und automatische Seitendrehung

## Übergabehinweise

- Musiklogik: `src/lib/music.ts`
- Dokument-/Chord-Sheet-Parser: `src/lib/parser.ts`
- PDF/OCR-Import: `src/lib/extract.ts`
- Oberfläche: `src/App.tsx`
- Designsystem: `src/styles.css` und `design.md`
- Tests: `src/lib/music.test.ts`, `src/lib/parser.test.ts`
