# Build Plan

## 1. Recherche und Regeln

- Nashville-Zahlen bilden die Stufen einer gewählten Tonleiter ab.
- Akkordqualität bleibt relevant: `2m`, `5(7)`, `7°` und `5/7` transportieren mehr Information als eine nackte Ziffer.
- Nicht-diatonische Akkorde benötigen Vorzeichen, beispielsweise `b7` oder `#4`.
- Ultimate-Guitar-Exporte nutzen überwiegend Akkorde über dem Text oder Akkorde in eckigen Klammern.
- Eine Capo-Angabe verändert die klingende Tonart; die gedruckten Griff-Akkorde müssen vor der Stufenberechnung transponiert werden.

Als technische Referenz wurde das öffentliche Open-Source-Projekt `sgoudie/nashville` geprüft. Dessen dokumentierte Beispiele bestätigen Unterstützung für Stufen, Vorzeichen, Erweiterungen und Slash-Chords. Die Implementierung in diesem Projekt ist eigenständig und erweitert den umgekehrten Weg Akkord → Nashville-Zahl.

Die öffentliche Worship-Keys-Website war in der Cloud-Netzwerkumgebung nicht abrufbar. Als verbindliche, vom Nutzer bereitgestellte Referenz wurde deshalb das öffentliche Repository `ahaz6/worship-keys` auf Commit `985cc15` analysiert. `Design-Art.md` und `app/globals.css` liefern die exakten Black-first-, Violett-/Indigo-, Text- und Statusfarben. Worship Scales übernimmt diese Designsprache, behält aber eine eigene, auf Chord-Sheet-Konvertierung zugeschnittene Informationsarchitektur.

## 2. Datenfluss

```text
Datei / Texteingabe
        ↓
PDF-Text oder OCR
        ↓
Zeilen- und Akkorderkennung
        ↓
Key-/Capo-Analyse ↔ manuelle Korrektur
        ↓
Nashville-Konvertierung
        ↓
Stage Chart / Copy / Print-to-PDF
```

## 3. Abnahmekriterien

- Text-PDF lässt sich ohne Server verarbeiten.
- Bild oder Scan löst OCR mit sichtbarem Fortschritt aus.
- `G D Em C` wird in G-Dur zu `1 5 6m 4`.
- `D/F#` wird in G-Dur zu `5/7`.
- `Bb` wird in C-Dur zu `b7`.
- Akkorde in `[G]Amazing [C]grace` bleiben über ihren Textpositionen nachvollziehbar.
- Explizite Key-Angabe schlägt die Heuristik.
- Key, Modus und Capo sind manuell editierbar.
- Quelltext kann korrigiert und neu analysiert werden.
- Produktion-Build und Musiklogik-Tests laufen erfolgreich.
- Mobile und Desktop sind nutzbar; Druck blendet Bedienelemente aus.

## 4. Ausführungsreihenfolge

- [x] Produktumfang und Grenzen definieren
- [x] Designsystem festlegen
- [x] Projektgerüst und Abhängigkeiten
- [x] Musiktheorie-Engine
- [x] Parser und Tonarterkennung
- [x] PDF-/OCR-Import
- [x] UI und responsive Stage-Ansicht
- [x] Unit-Tests
- [x] Build und Browser-Smoke-Test
- [x] Cloud-Setup-/Startanweisungen speichern
