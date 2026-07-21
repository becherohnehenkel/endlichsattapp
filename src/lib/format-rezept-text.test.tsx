import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { formatRezeptText } from './format-rezept-text'

describe('formatRezeptText', () => {
  it('rendert **Text** als <strong>', () => {
    const { container } = render(<>{formatRezeptText('**fett**')}</>)
    expect(container.querySelector('strong')?.textContent).toBe('fett')
  })

  it('rendert *Text* als <em>', () => {
    const { container } = render(<>{formatRezeptText('*kursiv*')}</>)
    expect(container.querySelector('em')?.textContent).toBe('kursiv')
  })

  it('rendert __Text__ als <u>', () => {
    const { container } = render(<>{formatRezeptText('__unterstrichen__')}</>)
    expect(container.querySelector('u')?.textContent).toBe('unterstrichen')
  })

  it('lässt Text ohne Marker unverändert als reinen Text', () => {
    const { container } = render(<>{formatRezeptText('Kein Marker hier.')}</>)
    expect(container.textContent).toBe('Kein Marker hier.')
    expect(container.querySelector('strong, em, u')).toBeNull()
  })

  it('kombiniert mehrere Marker im selben Text korrekt', () => {
    const { container } = render(
      <>{formatRezeptText('**Wichtig:** Wasser *langsam* einrühren, __nicht kochen__.')}</>
    )
    expect(container.querySelector('strong')?.textContent).toBe('Wichtig:')
    expect(container.querySelector('em')?.textContent).toBe('langsam')
    expect(container.querySelector('u')?.textContent).toBe('nicht kochen')
    expect(container.textContent).toBe('Wichtig: Wasser langsam einrühren, nicht kochen.')
  })

  it('lässt unpaarige Marker als reinen Text stehen (kein Crash, keine falsche Formatierung)', () => {
    const { container } = render(<>{formatRezeptText('Unpaariges * Sternchen bleibt Text')}</>)
    expect(container.textContent).toBe('Unpaariges * Sternchen bleibt Text')
    expect(container.querySelector('strong, em, u')).toBeNull()
  })

  it('escaped niemals HTML aus dem Textinhalt (kein XSS-Vektor)', () => {
    const { container } = render(<>{formatRezeptText('**<img src=x onerror=alert(1)>**')}</>)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('strong')?.textContent).toBe('<img src=x onerror=alert(1)>')
  })
})
