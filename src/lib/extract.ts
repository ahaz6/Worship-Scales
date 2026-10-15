import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { createWorker } from 'tesseract.js'
import type { ImportProgress } from '../types'
import { orderTextColumns } from './layout'
import { prepareChordSheetText } from './source'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

type ProgressCallback = (progress: ImportProgress) => void

type PositionedText = {
  text: string
  x: number
  y: number
  width: number
}

function emit(
  callback: ProgressCallback | undefined,
  stage: ImportProgress['stage'],
  label: string,
  progress: number,
) {
  callback?.({ stage, label, progress: Math.max(0, Math.min(1, progress)) })
}

function rebuildLines(items: PositionedText[]): string {
  if (!items.length) return ''
  const rows: PositionedText[][] = []

  for (const item of [...items].sort((a, b) => b.y - a.y || a.x - b.x)) {
    const row = rows.find((candidate) => Math.abs(candidate[0].y - item.y) <= 3)
    if (row) row.push(item)
    else rows.push([item])
  }

  return rows
    .sort((a, b) => b[0].y - a[0].y)
    .map((row) => {
      const sorted = row.sort((a, b) => a.x - b.x)
      const averageCharacterWidth = sorted.reduce((sum, item) => {
        return sum + item.width / Math.max(1, item.text.length)
      }, 0) / sorted.length

      let line = ''
      let previousEnd = sorted[0].x
      for (const item of sorted) {
        const gap = item.x - previousEnd
        const spaces = line
          ? Math.max(1, Math.min(24, Math.round(gap / Math.max(2.5, averageCharacterWidth))))
          : 0
        line += `${' '.repeat(spaces)}${item.text}`
        previousEnd = item.x + item.width
      }
      return line.trimEnd()
    })
    .join('\n')
}

async function recognizeImage(
  image: string | HTMLCanvasElement,
  onProgress?: ProgressCallback,
  pageIndex = 0,
  pageCount = 1,
): Promise<string> {
  const worker = await createWorker(['deu', 'eng'], undefined, {
    logger: (message) => {
      if (message.status !== 'recognizing text') return
      const pageProgress = (pageIndex + message.progress) / pageCount
      emit(onProgress, 'ocr', `OCR · Seite ${pageIndex + 1} von ${pageCount}`, pageProgress)
    },
  })

  try {
    await worker.setParameters({
      preserve_interword_spaces: '1',
      user_defined_dpi: '220',
    })
    const result = await worker.recognize(image, {}, { blocks: true })
    const lines = result.data.blocks?.flatMap((block) =>
      block.paragraphs.flatMap((paragraph) =>
        paragraph.lines.map((line) => ({
          text: line.text.trim(),
          x: line.bbox.x0,
          y: line.bbox.y0,
          width: line.bbox.x1 - line.bbox.x0,
          height: line.bbox.y1 - line.bbox.y0,
        })),
      ),
    ) ?? []

    return lines.length
      ? orderTextColumns(lines).map((line) => line.text).join('\n')
      : result.data.text
  } finally {
    await worker.terminate()
  }
}

async function extractPdf(file: File, onProgress?: ProgressCallback): Promise<string> {
  emit(onProgress, 'reading', 'PDF wird geöffnet', 0.04)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const loadingTask = getDocument({ data: bytes })
  const pdf = await loadingTask.promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    emit(
      onProgress,
      'extracting',
      `Text wird gelesen · Seite ${pageNumber} von ${pdf.numPages}`,
      (pageNumber - 1) / pdf.numPages,
    )
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const positioned: PositionedText[] = []

    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue
      positioned.push({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
      })
    }

    let pageText = rebuildLines(positioned)
    if (pageText.replace(/\s/g, '').length < 16) {
      emit(onProgress, 'ocr', `Scan erkannt · Seite ${pageNumber} von ${pdf.numPages}`, (pageNumber - 1) / pdf.numPages)
      const viewport = page.getViewport({ scale: 2.1 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      await page.render({ canvas, viewport }).promise
      pageText = await recognizeImage(canvas, onProgress, pageNumber - 1, pdf.numPages)
    }

    pages.push(pageText.trim())
    page.cleanup()
  }

  await loadingTask.destroy()
  return pages.filter(Boolean).join('\n\n')
}

async function extractImage(file: File, onProgress?: ProgressCallback): Promise<string> {
  emit(onProgress, 'ocr', 'OCR wird vorbereitet', 0.03)
  const objectUrl = URL.createObjectURL(file)
  try {
    return await recognizeImage(objectUrl, onProgress)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function extractDocument(file: File, onProgress?: ProgressCallback): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const isPdf = file.type === 'application/pdf' || extension === 'pdf'
  const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(extension ?? '')
  const isText = file.type.startsWith('text/') || ['txt', 'pro', 'chordpro', 'md'].includes(extension ?? '')

  let text: string
  if (isPdf) text = await extractPdf(file, onProgress)
  else if (isImage) text = await extractImage(file, onProgress)
  else if (isText) {
    emit(onProgress, 'reading', 'Textdatei wird gelesen', 0.35)
    text = await file.text()
  } else {
    throw new Error('Dieses Dateiformat wird noch nicht unterstützt. Nutze PDF, PNG, JPG, WEBP oder TXT.')
  }

  if (!text.trim()) {
    throw new Error('Es konnte kein Text erkannt werden. Prüfe die Datei oder füge den Inhalt als Text ein.')
  }

  emit(onProgress, 'analysing', 'Akkorde und Tonart werden analysiert', 0.96)
  return prepareChordSheetText(text)
}
