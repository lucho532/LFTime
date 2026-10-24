import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import '../../estilos/componentes/TablaDeInforme.css'
import { useTablaPaginada } from '../../hooks/useTablaPaginada'
import { esTiempoEnContra } from '../../reglas/informes/formatoInforme'
import type { EnlacesDeFila, TablaInforme } from '../../modelos/informe'
import { Campo } from '../base/Campo'
import { Modal } from '../base/Modal'
import { Paginacion } from '../base/Paginacion'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'
import { DesgloseTiempoDebido } from './DesgloseTiempoDebido'
import { DetalleDiferenciaJornada } from './DetalleDiferenciaJornada'

interface FilaDeInforme {
  indice: number
  celdas: Array<string | number>
  enlaces?: EnlacesDeFila
}

/**
 * Convierte en enlaces lo que lo admite: el nombre del trabajador abre su ficha (horarios y jornada de hoy) y
 * las incidencias de la fila abren cada incidencia. Lo demás se muestra como texto.
 */
function abreDetalle(titulo: string, enlaces?: EnlacesDeFila): boolean {
  return Boolean((titulo.toLowerCase().startsWith('diferencia') && enlaces?.diferencia) || (titulo === 'Debe en total' && enlaces?.dias))
}

function celdaConEnlaces(titulo: string, valor: string | number, enlaces: EnlacesDeFila | undefined, onVerDiferencia: (enlaces: EnlacesDeFila) => void, nombre: string): ReactNode {
  if (enlaces && abreDetalle(titulo, enlaces)) {
    const enContra = esTiempoEnContra(valor)
    return (
      <button type="button" className={`tabla-de-informe__diferencia${enContra ? ' tabla-de-informe__en-contra' : ''}`} title={enlaces.dias ? 'Ver el desglose día por día' : 'Ver de dónde viene esta diferencia'} aria-label={enlaces.dias ? `Ver de dónde sale el tiempo que debe ${nombre}: ${valor}` : `Ver de dónde viene la diferencia ${valor}`} onClick={() => onVerDiferencia(enlaces)}>
        {valor}
      </button>
    )
  }
  if (titulo === 'Trabajador' && enlaces?.trabajadorId) {
    return (
      <Link className="tabla-de-informe__enlace" to={`/personal/${enlaces.trabajadorId}`} title="Abrir la ficha: datos y horarios">
        {valor}
      </Link>
    )
  }
  const esColumnaDeIncidencias = ['Incidencias del día', 'Id', 'Incidencia'].includes(titulo)
  if (esColumnaDeIncidencias && enlaces?.incidencias && enlaces.incidencias.length > 0) {
    return enlaces.incidencias.map((incidencia, posicion) => (
      <span key={incidencia.id}>
        {posicion > 0 && ', '}
        <Link className="tabla-de-informe__enlace" to={`/incidencias/${incidencia.id}`} title="Abrir la incidencia">
          {incidencia.texto}
        </Link>
      </span>
    ))
  }
  return valor
}

interface PropiedadesTablaDeInforme {
  tabla: TablaInforme
}

/**
 * Muestra la tabla de un informe con búsqueda y paginación. Dibuja exactamente las columnas y filas del
 * informe (las mismas que se exportan) y dice cuántas filas tiene en total. Los tiempos por debajo de lo
 * programado se resaltan en rojo, siempre con el signo − en el texto. La búsqueda y la página solo
 * afectan a lo que se ve, no al archivo exportado. No calcula nada.
 */
export function TablaDeInforme({ tabla }: PropiedadesTablaDeInforme) {
  const [verDiferencia, setVerDiferencia] = useState<EnlacesDeFila | null>(null)
  const filas = useMemo<FilaDeInforme[]>(() => tabla.filas.map((celdas, indice) => ({ indice, celdas, enlaces: tabla.enlaces?.[indice] })), [tabla])
  const paginada = useTablaPaginada(filas, { textoBuscable: (fila) => fila.celdas.join(' '), tamanoPagina: 15 })
  const columnas: ColumnaTabla<FilaDeInforme>[] = tabla.columnas.map((titulo, posicion) => ({
    clave: `${posicion}`,
    titulo,
    // La diferencia con lo programado es lo que más se consulta: queda fija a la derecha al desplazar.
    fija: posicion === tabla.columnas.length - 1 && titulo.toLowerCase().startsWith('diferencia') ? 'derecha' : undefined,
    render: (fila) => {
      const valor = fila.celdas[posicion]
      const conDetalle = abreDetalle(titulo, fila.enlaces)
      return esTiempoEnContra(valor) && !conDetalle ? <span className="tabla-de-informe__en-contra">{valor}</span> : celdaConEnlaces(titulo, valor, fila.enlaces, setVerDiferencia, String(fila.celdas[0]))
    },
  }))

  return (
    <div className="tabla-de-informe">
      <p className="tabla-de-informe__resumen">
        {tabla.filas.length} fila{tabla.filas.length === 1 ? '' : 's'} · Periodo: {tabla.periodo} · Desliza la tabla hacia un lado para ver todas las columnas
      </p>
      {tabla.columnas.some((titulo) => titulo.toLowerCase().includes('diferencia') || titulo.startsWith('Debe')) && (
        <p className="tabla-de-informe__nota">
          La diferencia compara el tiempo efectivo registrado con el programado, solo en jornadas completas. Lo que falta aparece en rojo y con el signo −. Es un cálculo provisional (P-03 y P-05 abiertos): no es una sanción ni un descuento.
        </p>
      )}
      <Campo etiqueta="Buscar en el informe" type="search" value={paginada.busqueda} onChange={(e) => paginada.setBusqueda(e.target.value)} />
      <Tabla
        columnas={columnas}
        filas={paginada.filasPagina}
        clavePorFila={(fila) => `${fila.indice}`}
        descripcion="Informe"
        vacio={<EstadoVacio titulo="Sin datos" descripcion="No hay registros para este informe con los filtros y el periodo elegidos." />}
      />
      <Modal abierto={verDiferencia !== null} titulo={verDiferencia?.dias ? 'De dónde sale el tiempo por reponer' : 'De dónde viene la diferencia'} onCerrar={() => setVerDiferencia(null)} ancho="amplio">
        {verDiferencia?.diferencia && <DetalleDiferenciaJornada detalle={verDiferencia.diferencia} enlaces={verDiferencia} />}
        {verDiferencia?.dias && <DesgloseTiempoDebido trabajador={verDiferencia.nombre ?? ''} trabajadorId={verDiferencia.trabajadorId} dias={verDiferencia.dias} />}
      </Modal>
      <Paginacion paginaActual={paginada.paginaActual} totalPaginas={paginada.totalPaginas} total={paginada.total} desde={paginada.desde} hasta={paginada.hasta} onCambiarPagina={paginada.irAPagina} />
    </div>
  )
}
