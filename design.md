# Worship Scales Design System

## Quelle und Ziel

Diese Oberfläche übernimmt die gemeinsame visuelle DNA aus `ahaz6/worship-keys`, geprüft auf Commit `985cc15` anhand von `Design-Art.md` und `app/globals.css`.

Die Leitidee lautet:

> A calm, premium, black-led worship workspace with restrained violet and blue light.

Worship Scales bleibt funktional eine eigenständige App. Übernommen werden Farbhierarchie, Flächenlogik, Kontrast, Bewegung und Markenatmosphäre – nicht das konkrete Layout von Worship Keys.

## Verbindliche Farben

```css
:root {
  --ws-bg-deep: #09090c;
  --ws-bg: #0d0d12;
  --ws-panel: #121216;
  --ws-panel-raised: #17171e;
  --ws-panel-active: #20202a;

  --ws-text: #efeff4;
  --ws-text-soft: #b5b3c1;
  --ws-text-muted: #85858f;
  --ws-text-faint: #62626c;

  --ws-line: #292931;
  --ws-line-strong: #353541;

  --ws-violet: #7668b7;
  --ws-violet-bright: #9d8cff;
  --ws-indigo: #4e5fc6;
  --ws-blue: #5d7fe6;
  --ws-cyan-muted: #5b929d;
  --ws-success: #67a89e;
  --ws-warning: #c89b61;
  --ws-danger: #c76f7b;
}
```

## Farbverwendung

- Schwarz und dunkle neutrale Panels tragen die gesamte Oberfläche.
- Violett kennzeichnet Primäraktionen, Fokus, gewählte Tonart und Nashville-Zahlen.
- Indigo und Blau markieren sekundäre musikalische Informationen und vorbereitete Zustände.
- Gedämpftes Cyan kennzeichnet eine erfolgreiche Analyse.
- Orange bleibt Warnungen vorbehalten.
- Rot erscheint nur bei Fehlern oder destruktiven Aktionen.
- Haupttext ist kühles Fast-Weiß; Violett ersetzt niemals normalen Fließtext.

## Hintergrund

```css
background:
  radial-gradient(ellipse at 52% 0%, #282348 0, transparent 28%),
  radial-gradient(ellipse at 78% 45%, #151b2d 0, transparent 30%),
  linear-gradient(145deg, #090a0d 0%, #111116 52%, #0a0a0e 100%);
```

Die Lichtfelder bleiben leise. Eine statische Sterntextur darf mit maximal sechs Prozent Deckkraft erscheinen und nie mit Chart-Inhalten konkurrieren.

## Primäraktion

Primäre Buttons verwenden den Worship-Keys-Verlauf:

```css
background:
  radial-gradient(circle at 24% 0%, #7a6fdd 0, transparent 44%),
  linear-gradient(110deg, #1e1a4e, #3d2c96 58%, #22337f);
```

- Border: `#5b52a8`
- Text: `#f6f5ff`
- Hover: nur leicht heller und maximal 1 px angehoben
- Fokus: `#9d8cff`

## Typografie

- UI und Fließtext: Geist Sans bzw. system-ui als lokaler Fallback
- Nashville-Zahlen und technische Werte: Geist Mono bzw. ui-monospace
- Labels: 10–12 px, uppercase, großzügiges Tracking
- Chart-Zahlen müssen aus Bühnenentfernung klarer als dekorative Elemente wirken.

## Geometrie und Bewegung

- Controls: 9 px Radius
- Cards: 14 px Radius
- Große Flächen: 20 px Radius
- Standardbewegung: 170 ms mit `cubic-bezier(0.32, 0.72, 0.35, 1)`
- Touch-Ziele: mindestens 44 × 44 px
- `prefers-reduced-motion` deaktiviert dekorative Animationen.

## Komponenten

- `Dropzone`: dunkles Panel, gestrichelte neutrale Border, violetter Fokus.
- `Key Control`: gewählte Tonart in hellem Violett, Modus neutral.
- `Confidence Badge`: Cyan bei hoher, Orange bei mittlerer und Rot bei niedriger Sicherheit.
- `Chord Map`: Original neutral, Nashville-Zahl violett.
- `Stage Chart`: Lyrics fast weiß, Zahlen hellviolett, Abschnittsnamen gedämpftes Cyan.
- `Source Editor`: tiefschwarze Mono-Fläche mit violettem Caret und Fokus.

## Kontrastregeln

- `#efeff4` auf `#0d0d12`: 16,91:1
- `#b5b3c1` auf `#121216`: 9,06:1
- `#85858f` auf `#121216`: 5,12:1
- `#9d8cff` auf `#0d0d12`: 7,04:1
- `#62626c` ist nur für nichtkritische Metadaten geeignet.
- `#7668b7` nicht als kleinen Fließtext verwenden; dafür `#9d8cff` nutzen.
