import { useMemo, useState } from 'react'
import { contieneTexto } from '../utilidades/texto'

/** Cantidad de filas por página si no se indica otra, como en la referencia visual. */
const TAMANO_PAGINA_POR_DEFECTO = 10

interface OpcionesTablaPaginada<T> {
  /** Texto de la fila sobre el que busca el cuadro de búsqueda (nombre, documento, hospital…). */
  textoBuscable: (fila: T) => string
  /** Filtros por nombre; cada uno decide si la fila coincide con el valor elegido. Un valor vacío no filtra. */
  filtros?: Record<string, (fila: T, valor: string) => boolean>
  tamanoPagina?: number
}

/**
 * Hook de búsqueda, filtros y paginación sobre una lista ya cargada.
 *
 * Responsabilidad: calcular qué filas se ven y mantener el estado de búsqueda, filtros y página.
 * La búsqueda ignora mayúsculas y tildes. Al cambiar la búsqueda o un filtro vuelve a la página 1.
 * No carga datos ni conoce las entidades.
 */
export function useTablaPaginada<T>(filas: T[], opciones: OpcionesTablaPaginada<T>) {
  const { textoBuscable, filtros = {}, tamanoPagina = TAMANO_PAGINA_POR_DEFECTO } = opciones
  const [busqueda, setBusquedaEstado] = useState('')
  const [valoresFiltro, setValoresFiltro] = useState<Record<string, string>>({})
  const [pagina, setPagina] = useState(1)

  const filasFiltradas = useMemo(
    () =>
      filas.filter(
        (fila) =>
          contieneTexto(textoBuscable(fila), busqueda) &&
          Object.entries(valoresFiltro).every(([nombre, valor]) => valor === '' || (filtros[nombre]?.(fila, valor) ?? true)),
      ),
    // `textoBuscable` y `filtros` son funciones estables de quien llama; se recalcula al cambiar los datos o el estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filas, busqueda, valoresFiltro],
  )

  const total = filasFiltradas.length
  const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * tamanoPagina

  return {
    filasPagina: filasFiltradas.slice(inicio, inicio + tamanoPagina),
    total,
    totalPaginas,
    paginaActual,
    desde: total === 0 ? 0 : inicio + 1,
    hasta: Math.min(inicio + tamanoPagina, total),
    busqueda,
    valoresFiltro,
    irAPagina: (destino: number) => setPagina(Math.min(Math.max(1, destino), totalPaginas)),
    setBusqueda: (valor: string) => {
      setBusquedaEstado(valor)
      setPagina(1)
    },
    setFiltro: (nombre: string, valor: string) => {
      setValoresFiltro((anterior) => ({ ...anterior, [nombre]: valor }))
      setPagina(1)
    },
  }
}
