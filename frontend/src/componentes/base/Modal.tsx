import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import '../../estilos/componentes/Modal.css'

const SELECTOR_ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface PropiedadesModal {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  /** Botones al pie del diálogo. */
  acciones?: ReactNode
}

/**
 * Diálogo modal accesible.
 *
 * Al abrirse mueve el foco al diálogo, lo mantiene dentro (Tab y Mayús+Tab), se cierra con Escape
 * o al pulsar fuera, y devuelve el foco a quien lo abrió. No decide qué pasa al confirmar.
 */
export function Modal({ abierto, titulo, onCerrar, children, acciones }: PropiedadesModal) {
  const idTitulo = useId()
  const contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) {
      return undefined
    }
    const anterior = document.activeElement as HTMLElement | null
    contenedor.current?.focus()
    return () => anterior?.focus()
  }, [abierto])

  if (!abierto) {
    return null
  }

  function alPulsarTecla(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === 'Escape') {
      evento.stopPropagation()
      onCerrar()
      return
    }
    if (evento.key !== 'Tab' || !contenedor.current) {
      return
    }
    const enfocables = Array.from(contenedor.current.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES))
    if (enfocables.length === 0) {
      evento.preventDefault()
      return
    }
    const primero = enfocables[0]
    const ultimo = enfocables[enfocables.length - 1]
    if (evento.shiftKey && (document.activeElement === primero || document.activeElement === contenedor.current)) {
      evento.preventDefault()
      ultimo.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primero.focus()
    }
  }

  return (
    <div className="modal__fondo" onClick={(evento) => evento.target === evento.currentTarget && onCerrar()}>
      <div
        ref={contenedor}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        onKeyDown={alPulsarTecla}
      >
        <h2 id={idTitulo} className="modal__titulo">
          {titulo}
        </h2>
        <div className="modal__contenido">{children}</div>
        {acciones && <div className="modal__acciones">{acciones}</div>}
      </div>
    </div>
  )
}
