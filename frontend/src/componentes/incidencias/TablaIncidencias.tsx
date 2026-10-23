import { Link } from 'react-router-dom'
import '../../estilos/componentes/TablaIncidencias.css'
import type { IncidenciaDto } from '../../contratos/incidencia'
import { useTablaPaginada } from '../../hooks/useTablaPaginada'
import { ESTADOS_INCIDENCIA, TEXTO_ESTADO_INCIDENCIA, TEXTO_TIPO_INCIDENCIA, TIPOS_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import type { Hospital } from '../../modelos/hospital'
import type { Trabajador } from '../../modelos/trabajador'
import { Campo } from '../base/Campo'
import { Insignia } from '../base/Insignia'
import { Paginacion } from '../base/Paginacion'
import { Selector } from '../base/Selector'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'
import { InsigniaEstadoIncidencia } from './InsigniaEstadoIncidencia'

interface PropiedadesTablaIncidencias {
  incidencias: IncidenciaDto[]
  trabajadores: Trabajador[]
  hospitales: Hospital[]
  /** Falso para el trabajador: solo ve las propias y no necesita la columna de persona ni los filtros de hospital. */
  verTodas: boolean
}

/**
 * Lista de incidencias con búsqueda por trabajador u hospital, filtros por estado, tipo, hospital y
 * situación (pendientes de asignación, escaladas) y paginación (HU-06). Una incidencia es una anomalía
 * sujeta a revisión, no una sanción. No carga ni modifica datos.
 */
export function TablaIncidencias({ incidencias, trabajadores, hospitales, verTodas }: PropiedadesTablaIncidencias) {
  const trabajadorDe = (id: string) => trabajadores.find((t) => t.id === id)?.nombreCompleto ?? 'Persona no disponible'
  const hospitalDe = (id: string) => hospitales.find((h) => h.id === id)?.nombre ?? 'Hospital no disponible'
  const tabla = useTablaPaginada(incidencias, {
    textoBuscable: (i) => `${trabajadorDe(i.trabajadorId)} ${hospitalDe(i.hospitalId)} ${TEXTO_TIPO_INCIDENCIA[i.tipo]}`,
    filtros: {
      estado: (i, valor) => i.estado === valor,
      tipo: (i, valor) => i.tipo === valor,
      hospital: (i, valor) => i.hospitalId === valor,
      situacion: (i, valor) => (valor === 'pendientes' ? i.asignacion === 'PENDIENTE_ASIGNACION' : i.escalada !== undefined),
    },
  })

  const columnas: ColumnaTabla<IncidenciaDto>[] = [
    { clave: 'tipo', titulo: 'Incidencia', render: (i) => <Link to={`/incidencias/${i.id}`}>{TEXTO_TIPO_INCIDENCIA[i.tipo]}</Link> },
    ...(verTodas ? [{ clave: 'trabajador', titulo: 'Trabajador', render: (i: IncidenciaDto) => trabajadorDe(i.trabajadorId) }] : []),
    { clave: 'hospital', titulo: 'Hospital', render: (i) => hospitalDe(i.hospitalId) },
    { clave: 'fecha', titulo: 'Jornada', render: (i) => i.fechaOperativa },
    {
      clave: 'estado',
      titulo: 'Estado',
      render: (i) => (
        <span>
          <InsigniaEstadoIncidencia estado={i.estado} />{' '}
          {i.asignacion === 'PENDIENTE_ASIGNACION' && <Insignia texto="Pendiente de asignación" tono="ambar" icono="!" />}{' '}
          {i.escalada && <Insignia texto="Escalada" tono="rojo" icono="▲" />}
        </span>
      ),
    },
  ]

  return (
    <div className="tabla-incidencias">
      <div className="tabla-incidencias__filtros">
        <Campo etiqueta="Buscar" type="search" placeholder="Trabajador, hospital o tipo" value={tabla.busqueda} onChange={(e) => tabla.setBusqueda(e.target.value)} />
        <Selector
          etiqueta="Estado"
          textoVacio="Todos los estados"
          value={tabla.valoresFiltro.estado ?? ''}
          opciones={ESTADOS_INCIDENCIA.map((estado) => ({ valor: estado, etiqueta: TEXTO_ESTADO_INCIDENCIA[estado] }))}
          onChange={(e) => tabla.setFiltro('estado', e.target.value)}
        />
        <Selector
          etiqueta="Tipo"
          textoVacio="Todos los tipos"
          value={tabla.valoresFiltro.tipo ?? ''}
          opciones={TIPOS_INCIDENCIA.map((tipo) => ({ valor: tipo, etiqueta: TEXTO_TIPO_INCIDENCIA[tipo] }))}
          onChange={(e) => tabla.setFiltro('tipo', e.target.value)}
        />
        {verTodas && (
          <>
            <Selector
              etiqueta="Hospital"
              textoVacio="Todos los hospitales"
              value={tabla.valoresFiltro.hospital ?? ''}
              opciones={hospitales.map((h) => ({ valor: h.id, etiqueta: h.nombre }))}
              onChange={(e) => tabla.setFiltro('hospital', e.target.value)}
            />
            <Selector
              etiqueta="Situación"
              textoVacio="Todas"
              value={tabla.valoresFiltro.situacion ?? ''}
              opciones={[
                { valor: 'pendientes', etiqueta: 'Pendientes de asignación' },
                { valor: 'escaladas', etiqueta: 'Escaladas' },
              ]}
              onChange={(e) => tabla.setFiltro('situacion', e.target.value)}
            />
          </>
        )}
      </div>
      <Tabla
        columnas={columnas}
        filas={tabla.filasPagina}
        clavePorFila={(i) => i.id}
        descripcion="Incidencias"
        vacio={<EstadoVacio titulo="Sin incidencias" descripcion="Ninguna incidencia coincide con la búsqueda o los filtros." />}
      />
      <Paginacion paginaActual={tabla.paginaActual} totalPaginas={tabla.totalPaginas} total={tabla.total} desde={tabla.desde} hasta={tabla.hasta} onCambiarPagina={tabla.irAPagina} />
    </div>
  )
}
