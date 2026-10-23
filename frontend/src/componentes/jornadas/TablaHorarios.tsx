import '../../estilos/componentes/TablaHorarios.css'
import type { AsignacionHorarioDto } from '../../contratos/horario'
import { useTablaPaginada } from '../../hooks/useTablaPaginada'
import type { Hospital } from '../../modelos/hospital'
import type { Trabajador } from '../../modelos/trabajador'
import { obtenerHorarioVigente } from '../../reglas/horarioVigente'
import { hoyColombia } from '../../utilidades/horaColombia'
import { resumirDias } from '../../utilidades/diasSemana'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'
import { Paginacion } from '../base/Paginacion'
import { Selector } from '../base/Selector'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'
import { InsigniaEstadoTrabajador } from '../personal/InsigniaEstadoTrabajador'

interface PropiedadesTablaHorarios {
  trabajadores: Trabajador[]
  hospitales: Hospital[]
  horarios: AsignacionHorarioDto[]
  /** Texto del botón de cada fila: «Editar horario» si se puede editar o «Ver horario» si solo se consulta. */
  textoAccion: string
  onAbrir: (trabajador: Trabajador) => void
}

/**
 * Lista de trabajadores con su horario vigente planificado (HU-04): jornada, almuerzo y días. Permite
 * buscar, filtrar por hospital y abrir el detalle de cada horario. Distingue lo planificado de lo
 * registrado: aquí solo hay lo planificado. No edita; abre el detalle mediante `onAbrir`.
 */
export function TablaHorarios({ trabajadores, hospitales, horarios, textoAccion, onAbrir }: PropiedadesTablaHorarios) {
  const hoy = hoyColombia()
  const vigenteDe = (trabajadorId: string) => obtenerHorarioVigente(horarios, trabajadorId, hoy)
  const hospitalDe = (id: string) => hospitales.find((h) => h.id === id)?.nombre ?? 'Sin hospital'
  const tabla = useTablaPaginada(trabajadores, {
    textoBuscable: (t) => `${t.nombreCompleto} ${t.cargo} ${hospitalDe(t.hospitalId)}`,
    filtros: { hospital: (t, valor) => t.hospitalId === valor },
  })

  const columnas: ColumnaTabla<Trabajador>[] = [
    { clave: 'nombre', titulo: 'Trabajador', render: (t) => t.nombreCompleto },
    { clave: 'hospital', titulo: 'Hospital', render: (t) => hospitalDe(t.hospitalId) },
    { clave: 'estado', titulo: 'Estado', render: (t) => <InsigniaEstadoTrabajador estado={t.estado} /> },
    {
      clave: 'jornada',
      titulo: 'Jornada',
      render: (t) => {
        const horario = vigenteDe(t.id)
        return horario ? `${horario.horaEntrada} – ${horario.horaSalida}${horario.horaSalida < horario.horaEntrada ? ' (cruza medianoche)' : ''}` : 'Sin horario'
      },
    },
    {
      clave: 'almuerzo',
      titulo: 'Almuerzo',
      render: (t) => {
        const horario = vigenteDe(t.id)
        return horario ? `${horario.ventanaAlmuerzoDesde} – ${horario.ventanaAlmuerzoHasta} · ${horario.duracionAlmuerzoMinutos} min` : '—'
      },
    },
    { clave: 'dias', titulo: 'Días', render: (t) => (vigenteDe(t.id) ? resumirDias(vigenteDe(t.id)!.diasLaborables) : '—') },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (t) => (
        <Boton variante="texto" aria-label={`${textoAccion} de ${t.nombreCompleto}`} onClick={() => onAbrir(t)}>
          {textoAccion}
        </Boton>
      ),
    },
  ]

  return (
    <div className="tabla-horarios">
      <div className="tabla-horarios__filtros">
        <Campo etiqueta="Buscar" type="search" placeholder="Nombre, cargo u hospital" value={tabla.busqueda} onChange={(e) => tabla.setBusqueda(e.target.value)} />
        <Selector
          etiqueta="Hospital"
          textoVacio="Todos los hospitales"
          value={tabla.valoresFiltro.hospital ?? ''}
          opciones={hospitales.map((h) => ({ valor: h.id, etiqueta: h.nombre }))}
          onChange={(e) => tabla.setFiltro('hospital', e.target.value)}
        />
      </div>
      <Tabla columnas={columnas} filas={tabla.filasPagina} clavePorFila={(t) => t.id} descripcion="Horarios planificados del personal" vacio={<EstadoVacio titulo="Sin personal" descripcion="Ningún trabajador coincide con la búsqueda o el filtro." />} />
      <Paginacion paginaActual={tabla.paginaActual} totalPaginas={tabla.totalPaginas} total={tabla.total} desde={tabla.desde} hasta={tabla.hasta} onCambiarPagina={tabla.irAPagina} />
    </div>
  )
}
