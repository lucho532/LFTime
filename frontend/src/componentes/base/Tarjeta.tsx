import type { ReactNode } from 'react'
import '../../estilos/componentes/Tarjeta.css'

interface PropiedadesTarjeta {
  titulo?: string
  /** Contenido alineado a la derecha del título (por ejemplo, un enlace «Ver todas»). */
  acciones?: ReactNode
  children: ReactNode
}

/**
 * Contenedor con borde y título opcional, base de los indicadores y bloques del panel.
 * Solo agrupa contenido; no conoce su significado.
 */
export function Tarjeta({ titulo, acciones, children }: PropiedadesTarjeta) {
  return (
    <section className="tarjeta">
      {(titulo || acciones) && (
        <header className="tarjeta__encabezado">
          {titulo && <h2 className="tarjeta__titulo">{titulo}</h2>}
          {acciones}
        </header>
      )}
      {children}
    </section>
  )
}
