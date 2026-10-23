import type { ReactNode } from 'react'
import '../../estilos/componentes/EstadoVacio.css'

interface PropiedadesEstadoVacio {
  titulo: string
  descripcion?: string
  /** Acción sugerida, por ejemplo un botón para crear el primer elemento. */
  accion?: ReactNode
}

/**
 * Bloque que explica que no hay datos que mostrar y, si procede, qué hacer.
 * No sabe por qué está vacío: lo explica quien lo usa.
 */
export function EstadoVacio({ titulo, descripcion, accion }: PropiedadesEstadoVacio) {
  return (
    <div className="estado-vacio">
      <h3 className="estado-vacio__titulo">{titulo}</h3>
      {descripcion && <p className="estado-vacio__descripcion">{descripcion}</p>}
      {accion}
    </div>
  )
}
