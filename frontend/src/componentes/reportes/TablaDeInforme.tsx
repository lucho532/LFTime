import { useMemo } from 'react'
import '../../estilos/componentes/TablaDeInforme.css'
import { useTablaPaginada } from '../../hooks/useTablaPaginada'
import type { TablaInforme } from '../../modelos/informe'
import { Campo } from '../base/Campo'
import { Paginacion } from '../base/Paginacion'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'

interface FilaDeInforme {
  indice: number
  celdas: Array<string | number>
}

interface PropiedadesTablaDeInforme {
  tabla: TablaInforme
}

/**
 * Muestra la tabla de un informe con búsqueda y paginación. Dibuja exactamente las columnas y filas del
 * informe (las mismas que se exportan) y dice cuántas filas tiene en total. La búsqueda y la página solo
 * afectan a lo que se ve, no al archivo exportado. No calcula nada.
 */
export function TablaDeInforme({ tabla }: PropiedadesTablaDeInforme) {
  const filas = useMemo<FilaDeInforme[]>(() => tabla.filas.map((celdas, indice) => ({ indice, celdas })), [tabla])
  const paginada = useTablaPaginada(filas, { textoBuscable: (fila) => fila.celdas.join(' '), tamanoPagina: 15 })
  const columnas: ColumnaTabla<FilaDeInforme>[] = tabla.columnas.map((titulo, posicion) => ({
    clave: `${posicion}`,
    titulo,
    render: (fila) => fila.celdas[posicion],
  }))

  return (
    <div className="tabla-de-informe">
      <p className="tabla-de-informe__resumen">
        {tabla.filas.length} fila{tabla.filas.length === 1 ? '' : 's'} · Periodo: {tabla.periodo}
      </p>
      <Campo etiqueta="Buscar en el informe" type="search" value={paginada.busqueda} onChange={(e) => paginada.setBusqueda(e.target.value)} />
      <Tabla
        columnas={columnas}
        filas={paginada.filasPagina}
        clavePorFila={(fila) => `${fila.indice}`}
        descripcion="Informe"
        vacio={<EstadoVacio titulo="Sin datos" descripcion="No hay registros para este informe con los filtros y el periodo elegidos." />}
      />
      <Paginacion paginaActual={paginada.paginaActual} totalPaginas={paginada.totalPaginas} total={paginada.total} desde={paginada.desde} hasta={paginada.hasta} onCambiarPagina={paginada.irAPagina} />
    </div>
  )
}
