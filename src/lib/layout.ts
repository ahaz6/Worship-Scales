export interface PositionedLine {
  text: string
  x: number
  y: number
  width: number
  height: number
}

function byReadingPosition(a: PositionedLine, b: PositionedLine): number {
  return a.y - b.y || a.x - b.x
}

function verticalOverlap(left: PositionedLine, right: PositionedLine): boolean {
  const centerLeft = left.y + left.height / 2
  const centerRight = right.y + right.height / 2
  return Math.abs(centerLeft - centerRight) <= Math.max(left.height, right.height) * 0.7
}

export function orderTextColumns(lines: PositionedLine[]): PositionedLine[] {
  const content = lines.filter((line) => line.text.trim())
  if (content.length < 8) return [...content].sort(byReadingPosition)

  const minX = Math.min(...content.map((line) => line.x))
  const maxX = Math.max(...content.map((line) => line.x + line.width))
  const span = maxX - minX
  if (span <= 0) return [...content].sort(byReadingPosition)

  let best: { left: PositionedLine[]; right: PositionedLine[]; shared: PositionedLine[]; score: number } | null = null

  for (let step = 35; step <= 65; step += 2) {
    const split = minX + span * step / 100
    const gutter = span * 0.018
    const left = content.filter((line) => line.x + line.width <= split - gutter)
    const right = content.filter((line) => line.x >= split + gutter)
    const shared = content.filter((line) => !left.includes(line) && !right.includes(line))
    if (left.length < 4 || right.length < 4 || shared.length > content.length * 0.3) continue

    const pairedRows = left.filter((line) => right.some((other) => verticalOverlap(line, other))).length
    if (pairedRows < 3) continue

    const score = pairedRows * 3 + Math.min(left.length, right.length) - shared.length * 2
    if (!best || score > best.score) best = { left, right, shared, score }
  }

  if (!best) return [...content].sort(byReadingPosition)

  const firstColumnY = Math.min(
    ...best.left.map((line) => line.y),
    ...best.right.map((line) => line.y),
  )
  const header = best.shared.filter((line) => line.y < firstColumnY)
  const remaining = best.shared.filter((line) => line.y >= firstColumnY)

  return [
    ...header.sort(byReadingPosition),
    ...[...best.left, ...remaining.filter((line) => line.x < minX + span / 2)].sort(byReadingPosition),
    ...[...best.right, ...remaining.filter((line) => line.x >= minX + span / 2)].sort(byReadingPosition),
  ]
}
