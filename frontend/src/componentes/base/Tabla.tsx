import type { ReactNode } from 'react'
import '../../estilos/componentes/Tabla.css'

/** Columna de una tabla: encabezado y forma de dibujar la celda de cada fila. */
export interface ColumnaTabla<T> {
  clave: string
  titulo: string
  render: (fila: T) => ReactNode
  alineacion?: 'izquierda' | 'derecha'
  /** `derecha` deja la columna fija al borde derecho cuando la tabla se desplaza hacia un lado (solo en pantallas anchas). */
  fija?: 'derecha'
}

interface PropiedadesTabla<T> {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  clavePorFila: (fila: T) => string
  /** Descripción de la tabla para lectores de pantalla. */
  descripcion: string
  /** Se muestra en lugar de la tabla cuando no hay filas. */
  vacio?: ReactNode
}

/**
 * Tabla de datos accesible y adaptable.
 *
 * En pantallas pequeñas cada fila se convierte en una ficha con el nombre de cada columna
 * (`data-etiqueta`). No ordena, filtra ni pagina: eso lo hace `useTablaPaginada`.
 */
export function Tabla<T>({ columnas, filas, clavePorFila, descripcion, vacio }: PropiedadesTabla<T>) {
  if (filas.length === 0 && vacio) {
    return <>{vacio}</>
  }
  return (
    <div className="tabla__contenedor">
      <table className="tabla">
        <caption className="tabla__descripcion">{descripcion}</caption>
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna.clave} scope="col" className={`tabla__celda--${columna.alineacion ?? 'izquierda'}${columna.fija ? ' tabla__celda--fija' : ''}`}>
                {columna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={clavePorFila(fila)}>
              {columnas.map((columna) => (
                <td key={columna.clave} data-etiqueta={columna.titulo} className={`tabla__celda--${columna.alineacion ?? 'izquierda'}${columna.fija ? ' tabla__celda--fija' : ''}`}>
                  {columna.render(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
