import '../estilos/paginas/PaginaIncidencias.css'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { BandejaPendientesAsignacion } from '../componentes/incidencias/BandejaPendientesAsignacion'
import { TablaIncidencias } from '../componentes/incidencias/TablaIncidencias'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import { estaCerrada } from '../reglas/permisosIncidencia'
import { servicios } from '../servicios/fabrica'

/**
 * Pantalla de incidencias (HU-06): lista con búsqueda, filtros y paginación. Coordinación y administración
 * ven todas; el trabajador solo las suyas («Mis incidencias»). El administrador ve además la bandeja de
 * pendientes de asignación (D28). Una incidencia no es una sanción. Los permisos son solo visuales (D27).
 */
export function PaginaIncidencias() {
  const { usuario } = useSesion()
  const esTrabajador = usuario?.rol === 'TRABAJADOR'
  const carga = useCarga(async () => {
    const [incidencias, trabajadores, hospitales] = await Promise.all([servicios.incidencias.listar(), servicios.trabajadores.listar(), servicios.hospitales.listar()])
    return { incidencias, trabajadores, hospitales }
  }, 'No se pudieron cargar las incidencias.')

  if (carga.cargando && !carga.datos) {
    return <EstadoCarga mensaje="Cargando incidencias…" />
  }
  if (carga.error || !carga.datos) {
    return <EstadoError mensaje={carga.error ?? 'No se pudieron cargar las incidencias.'} onReintentar={carga.recargar} />
  }
  const { trabajadores, hospitales } = carga.datos
  const visibles = esTrabajador ? carga.datos.incidencias.filter((i) => i.trabajadorId === usuario?.trabajadorId) : carga.datos.incidencias
  const pendientes = visibles.filter((i) => i.asignacion === 'PENDIENTE_ASIGNACION' && !estaCerrada(i.estado))

  return (
    <section className="pagina-incidencias">
      <header>
        <h1>{esTrabajador ? 'Mis incidencias' : 'Incidencias'}</h1>
        <p>
          {esTrabajador
            ? 'Anomalías detectadas en tus jornadas. Puedes aportar una justificación; ninguna es una sanción.'
            : 'Anomalías detectadas al comparar los registros con el horario. Las revisa la coordinación; ninguna es una sanción.'}
        </p>
      </header>
      {usuario?.rol === 'ADMINISTRADOR' && <BandejaPendientesAsignacion incidencias={pendientes} trabajadores={trabajadores} hospitales={hospitales} />}
      <Tarjeta titulo="Lista de incidencias">
        <TablaIncidencias incidencias={visibles} trabajadores={trabajadores} hospitales={hospitales} verTodas={!esTrabajador} />
      </Tarjeta>
    </section>
  )
}
