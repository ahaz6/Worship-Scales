# Worship Scales

Eine lokale Web-App, die Chord-Sheets aus PDF-Dateien, Screenshots und Text in Nashville Number Charts umwandelt.

## Funktionen

- PDF-Textextraktion und OCR für Scans/Bilder
- Import kopierter Ultimate-Guitar-Texte mit fett markierten Akkorden wie `**E7**`
- Warnung bei verdächtigen OCR-Akkorden wie `6G` oder `GD`
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

Für zuverlässige Akkorde bei Ultimate Guitar: Den Text des Tabs kopieren, in **Quelltext** einfügen und **Neu analysieren** wählen. Ein Screenshot kann etwa `E7` als `D` fehlinterpretieren; dieser Fehler lässt sich aus dem OCR-Text allein nicht sicher korrigieren. Die angegebene Tonart wird beibehalten.
