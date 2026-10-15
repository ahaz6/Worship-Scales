import { useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Copy,
  Download,
  FileImage,
  FileText,
  Gauge,
  Import,
  Info,
  LayoutDashboard,
  Library,
  LoaderCircle,
  LockKeyhole,
  Menu,
  Music2,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  WandSparkles,
  X,
} from 'lucide-react'
import { detectKey, KEY_ROOTS, keyLabel } from './lib/music'
import { buildChart, chartToPlainText } from './lib/parser'
import { normalizeImportedText } from './lib/text'
import type { ImportProgress, KeyDetection, KeyMode } from './types'

const DEMO_TEXT = `Amazing Grace
Artist: Traditional
Key: G

[Verse 1]
G                 C        G
Amazing grace, how sweet the sound
G                         D
That saved a soul like me
G                  C         G
I once was lost, but now am found
Em          D       G
Was blind, but now I see`

function confidenceLabel(detection: KeyDetection) {
  if (detection.source === 'explicit') return 'Im Dokument gefunden'
  if (detection.source === 'fallback') return 'Manuelle Auswahl nötig'
  return `${Math.round(detection.confidence * 100)}% sicher erkannt`
}

function confidenceTone(detection: KeyDetection) {
  if (detection.confidence >= 0.78) return 'success'
  if (detection.confidence >= 0.5) return 'warning'
  return 'danger'
}

function displaySection(value: string) {
  return value.replace(/^\s*\[/, '').replace(/\]\s*:??\s*$/, '')
}

function MixedLine({ value }: { value: string }) {
  const parts = value.split(/(\[[^\]]+\])/g)
  return (
    <>
      {parts.map((part, index) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <span className="inline-number" key={`${part}-${index}`}>{part.slice(1, -1)}</span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  )
}

function Logo() {
  return (
    <div className="logo-mark" aria-hidden="true">
      <span>1</span>
      <i />
      <span>5</span>
    </div>
  )
}

export default function App() {
  const initialDetection = useMemo(() => detectKey(DEMO_TEXT), [])
  const [sourceText, setSourceText] = useState(DEMO_TEXT)
  const [fileName, setFileName] = useState<string>('Amazing Grace · Demo')
  const [detection, setDetection] = useState<KeyDetection>(initialDetection)
  const [root, setRoot] = useState(initialDetection.root)
  const [mode, setMode] = useState<KeyMode>(initialDetection.mode)
  const [capo, setCapo] = useState(initialDetection.capo)
  const [applyCapo, setApplyCapo] = useState(initialDetection.capo > 0)
  const [activeView, setActiveView] = useState<'chart' | 'source'>('chart')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const rootChoice = KEY_ROOTS.find((choice) => choice.root === root) ?? KEY_ROOTS[0]
  const selectedKey = { ...rootChoice, mode }
  const chart = useMemo(
    () => buildChart(sourceText, selectedKey, applyCapo ? capo : 0, fileName),
    [sourceText, selectedKey.root, selectedKey.pitchClass, selectedKey.mode, applyCapo, capo, fileName],
  )

  async function loadFile(file: File) {
    setError(null)
    setIsProcessing(true)
    setFileName(file.name)
    try {
      setProgress({ stage: 'reading', label: 'Importwerkzeuge werden geladen', progress: 0.01 })
      const { extractDocument } = await import('./lib/extract')
      const text = await extractDocument(file, setProgress)
      const nextDetection = detectKey(text)
      setSourceText(text)
      setDetection(nextDetection)
      setRoot(nextDetection.root)
      setMode(nextDetection.mode)
      setCapo(nextDetection.capo)
      setApplyCapo(nextDetection.capo > 0)
      setProgress({ stage: 'done', label: 'Chart ist bereit', progress: 1 })
      setActiveView('chart')
      window.setTimeout(() => setProgress(null), 1800)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Die Datei konnte nicht gelesen werden.')
      setProgress(null)
    } finally {
      setIsProcessing(false)
    }
  }

  function reanalyse() {
    const normalizedText = normalizeImportedText(sourceText)
    const nextDetection = detectKey(normalizedText)
    setSourceText(normalizedText)
    setDetection(nextDetection)
    setRoot(nextDetection.root)
    setMode(nextDetection.mode)
    setCapo(nextDetection.capo)
    setApplyCapo(nextDetection.capo > 0)
    setActiveView('chart')
    setError(null)
  }

  async function copyChart() {
    await navigator.clipboard.writeText(chartToPlainText(chart))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function newChart() {
    setSourceText('')
    setFileName('Unbenannter Song')
    const empty = detectKey('')
    setDetection(empty)
    setRoot('C')
    setMode('major')
    setCapo(0)
    setApplyCapo(false)
    setActiveView('source')
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <Logo />
          <div>
            <strong>Worship</strong>
            <span>Scales</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Navigation schließen">
            <X size={19} />
          </button>
        </div>

        <button className="new-chart-button" onClick={newChart}>
          <Plus size={18} /> Neuer Chart
        </button>

        <nav className="primary-nav" aria-label="Hauptnavigation">
          <p>Workspace</p>
          <button className="active"><LayoutDashboard size={18} /> Chart Studio</button>
          <button disabled><Library size={18} /> Song Library <span className="soon">Soon</span></button>
          <button disabled><Gauge size={18} /> Stage Mode <span className="soon">Soon</span></button>
          <p>Werkzeuge</p>
          <button onClick={() => setActiveView('source')}><Clipboard size={18} /> Text Editor</button>
          <button disabled><SlidersHorizontal size={18} /> Einstellungen</button>
        </nav>

        <div className="sidebar-note">
          <div className="privacy-icon"><LockKeyhole size={16} /></div>
          <div>
            <strong>Bleibt bei dir</strong>
            <span>Dateien werden nur lokal in diesem Browser verarbeitet.</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <CircleHelp size={18} />
          <span>Hilfe & Nashville Guide</span>
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Navigation schließen" />}

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-title">
            <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Navigation öffnen"><Menu size={20} /></button>
            <div>
              <span>Chart Studio</span>
              <strong>{fileName}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="saved-state"><Check size={14} /> Lokal gespeichert</div>
            <button className="icon-button" aria-label="Einstellungen"><Settings2 size={18} /></button>
            <button className="export-button" onClick={() => window.print()}>
              <Download size={17} /> Export PDF
            </button>
          </div>
        </header>

        <div className="workspace-content">
          <section className="intro-row">
            <div>
              <div className="eyebrow"><Sparkles size={14} /> Smart chord conversion</div>
              <h1>Aus Chords werden <em>Numbers.</em></h1>
              <p>Importiere dein Chord-Sheet, prüfe die Tonart und gib deiner ganzen Band einen Chart.</p>
            </div>
            <div className="mini-guide">
              <BookOpen size={18} />
              <div><strong>Nashville kurz erklärt</strong><span>1 = Grundton · 4 = Subdominante · 5 = Dominante</span></div>
            </div>
          </section>

          <section className="control-grid">
            <div
              className={`upload-card ${isDragging ? 'is-dragging' : ''}`}
              onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => { event.preventDefault(); setIsDragging(false) }}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                const file = event.dataTransfer.files[0]
                if (file) void loadFile(file)
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.pro,.chordpro"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void loadFile(file)
                  event.currentTarget.value = ''
                }}
              />
              <div className="upload-icon"><UploadCloud size={24} /></div>
              <div className="upload-copy">
                <strong>{isProcessing ? progress?.label ?? 'Datei wird verarbeitet' : 'Chord-Sheet importieren'}</strong>
                <span>PDF, Screenshot oder Textdatei · Drag & Drop</span>
              </div>
              <button onClick={() => inputRef.current?.click()} disabled={isProcessing}>
                {isProcessing ? <LoaderCircle className="spin" size={18} /> : <Import size={17} />}
                Auswählen
              </button>
              {progress && (
                <div className="progress-track" aria-label={progress.label}>
                  <i style={{ width: `${Math.round(progress.progress * 100)}%` }} />
                </div>
              )}
            </div>

            <div className="key-card">
              <div className="key-card-header">
                <div><WandSparkles size={17} /><span>Tonart & Transposition</span></div>
                <div className={`confidence ${confidenceTone(detection)}`}>
                  <i /> {confidenceLabel(detection)}
                </div>
              </div>
              <div className="key-controls">
                <label>
                  <span>Key</span>
                  <div className="select-wrap">
                    <select value={root} onChange={(event) => setRoot(event.target.value)}>
                      {KEY_ROOTS.map((choice) => <option key={choice.root}>{choice.root}</option>)}
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </label>
                <label>
                  <span>Modus</span>
                  <div className="select-wrap mode-select">
                    <select value={mode} onChange={(event) => setMode(event.target.value as KeyMode)}>
                      <option value="major">Dur</option>
                      <option value="minor">Moll</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </label>
                <label>
                  <span>Capo</span>
                  <div className="capo-control">
                    <button onClick={() => setCapo(Math.max(0, capo - 1))}>−</button>
                    <b>{capo || '—'}</b>
                    <button onClick={() => setCapo(Math.min(11, capo + 1))}>+</button>
                  </div>
                </label>
                <label className="capo-toggle">
                  <span>Klingend</span>
                  <button
                    className={applyCapo ? 'is-on' : ''}
                    onClick={() => setApplyCapo((value) => !value)}
                    aria-pressed={applyCapo}
                  ><i /></button>
                </label>
              </div>
              <div className="analysis-note">
                <Info size={14} />
                <span>
                  {detection.source === 'explicit'
                    ? `Tonart wurde im Dokument gefunden${detection.capo ? `; Capo ${detection.capo} wird ${applyCapo ? '' : 'nicht '}eingerechnet.` : '.'}`
                    : detection.chordCount
                      ? `${detection.chordCount} Akkorde analysiert${detection.shapeKey && detection.shapeKey !== detection.root ? ` · Grifftonart ${detection.shapeKey}` : ''}.`
                      : 'Keine Akkorde erkannt – wähle die Tonart manuell.'}
                </span>
              </div>
            </div>
          </section>

          {error && (
            <div className="error-banner"><Info size={18} /><span>{error}</span><button onClick={() => setError(null)}><X size={16} /></button></div>
          )}

          <section className="chart-panel">
            <div className="chart-toolbar">
              <div className="view-tabs">
                <button className={activeView === 'chart' ? 'active' : ''} onClick={() => setActiveView('chart')}>
                  <Music2 size={16} /> Nashville Chart
                </button>
                <button className={activeView === 'source' ? 'active' : ''} onClick={() => setActiveView('source')}>
                  <FileText size={16} /> Quelltext
                </button>
              </div>
              <div className="chart-actions">
                <button onClick={copyChart}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Kopiert' : 'Kopieren'}</button>
                <button onClick={() => window.print()}><Download size={16} /> Drucken</button>
              </div>
            </div>

            {activeView === 'chart' ? (
              <div className="chart-layout">
                <article className="stage-chart">
                  <header className="song-header">
                    <div>
                      <span className="song-kicker">Nashville number chart</span>
                      <h2>{chart.title}</h2>
                      {chart.artist && <p>{chart.artist}</p>}
                    </div>
                    <div className="key-stamp">
                      <span>Key</span>
                      <strong>{root}</strong>
                      <small>{mode === 'major' ? 'MAJ' : 'MIN'}</small>
                    </div>
                  </header>

                  <div className="chart-lines">
                    {chart.lines.filter((line) => line.kind !== 'meta').map((line) => {
                      if (line.kind === 'blank') return <div className="chart-blank" key={line.id} />
                      if (line.kind === 'section') return <h3 key={line.id}>{displaySection(line.output)}</h3>
                      if (line.kind === 'chords') return <pre className="number-line" key={line.id}>{line.output}</pre>
                      if (line.kind === 'mixed') return <pre className="mixed-line" key={line.id}><MixedLine value={line.output} /></pre>
                      return <pre className="lyric-line" key={line.id}>{line.output}</pre>
                    })}
                    {!sourceText.trim() && (
                      <div className="empty-chart">
                        <FileImage size={34} />
                        <strong>Noch kein Song</strong>
                        <span>Importiere ein PDF oder füge im Quelltext einen Chord-Sheet ein.</span>
                      </div>
                    )}
                  </div>
                </article>

                <aside className="mapping-panel">
                  <div className="mapping-title">
                    <div><Music2 size={16} /><strong>Chord Map</strong></div>
                    <span>{chart.mappings.length} erkannt</span>
                  </div>
                  <p>Originale Akkorde und ihre Zahlen in {keyLabel(selectedKey)}.</p>
                  <div className="mapping-list">
                    {chart.mappings.map((mapping) => (
                      <div className="mapping-row" key={mapping.chord}>
                        <span>{mapping.chord}</span><i>→</i><strong>{mapping.number}</strong>
                      </div>
                    ))}
                    {!chart.mappings.length && <span className="mapping-empty">Noch keine Akkorde erkannt.</span>}
                  </div>
                  <div className="mapping-tip">
                    <Sparkles size={15} />
                    <span><strong>Band-Tipp</strong> Bei E7 bestimmt E die Stufe; ⁷ ist nur der Akkordzusatz.</span>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="source-editor">
                <div className="source-help">
                  <div><FileText size={17} /><span><strong>Erkannten Text korrigieren</strong> · Akkorde über den jeweiligen Lyrics stehen lassen.</span></div>
                  <span>{sourceText.length.toLocaleString('de-DE')} Zeichen</span>
                </div>
                <textarea
                  value={sourceText}
                  onChange={(event) => setSourceText(event.target.value)}
                  placeholder={'Songtitel\nKey: G\n\n[Verse 1]\nG       C\nText ...'}
                  spellCheck={false}
                />
                <div className="source-footer">
                  <span><PanelLeftClose size={15} /> Änderungen werden lokal verarbeitet.</span>
                  <button onClick={reanalyse}><RefreshCw size={16} /> Neu analysieren</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
