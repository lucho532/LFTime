import type { ReactNode } from 'react'
import '../../estilos/componentes/ListaHistorial.css'

interface ElementoHistorial {
  id: string
  contenido: ReactNode
}

interface PropiedadesListaHistorial {
  elementos: ElementoHistorial[]
  textoVacio: string
}

/**
 * Lista cronológica de entradas de un historial (quién, cuándo, qué). El orden lo decide quien la usa.
 * Solo presenta: los historiales no se editan (R-10).
 */
export function ListaHistorial({ elementos, textoVacio }: PropiedadesListaHistorial) {
  if (elementos.length === 0) {
    return <p className="lista-historial__vacio">{textoVacio}</p>
  }
  return (
    <ol className="lista-historial">
      {elementos.map((elemento) => (
        <li key={elemento.id} className="lista-historial__elemento">
          {elemento.contenido}
        </li>
      ))}
    </ol>
  )
}
