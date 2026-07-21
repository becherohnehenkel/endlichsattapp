import { Fragment, type ReactNode } from 'react'

/**
 * Wandelt **fett**, *kursiv* und __unterstrichen__ Marker in echte React-Elemente
 * um (<strong>/<em>/<u>). Baut nie rohes HTML zusammen (kein dangerouslySetInnerHTML) —
 * alles außerhalb der drei erkannten Marker bleibt normaler, sicher escapter Text.
 */
export function formatRezeptText(text: string): ReactNode[] {
  const pattern = /\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*/g
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>)
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>)
    } else if (match[2] !== undefined) {
      nodes.push(<u key={key++}>{match[2]}</u>)
    } else {
      nodes.push(<em key={key++}>{match[3]}</em>)
    }
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>)
  }
  return nodes
}
