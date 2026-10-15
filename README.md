# Worship Scales

Eine lokale Web-App, die Chord-Sheets aus PDF-Dateien, Screenshots und Text in Nashville Number Charts umwandelt.

## Funktionen

- PDF-Textextraktion und OCR für Scans/Bilder
- automatische Tonart- und Capo-Erkennung
- manuelle Auswahl von Key und Dur/Moll
- Nashville-Zahlen inklusive Vorzeichen, Akkordqualität und Slash-Bass
- editierbarer Quelltext, Chord Map und druckbares Stage Chart
- Verarbeitung im Browser ohne Upload zu einem eigenen Server

## Entwicklung

```bash
npm install
npm run dev
```

Tests und Produktions-Build:

```bash
npm test
npm run build
```

Weitere Details stehen in [handoff.md](handoff.md), [BUILD_PLAN.md](BUILD_PLAN.md) und [design.md](design.md).
