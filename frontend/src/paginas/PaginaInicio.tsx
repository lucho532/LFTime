import { Link, useSearchParams } from 'react-router-dom'
import '../estilos/paginas/PaginaInicio.css'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { MapaEsquematico } from '../componentes/mapa/MapaEsquematico'
import { EncabezadoPanel } from '../componentes/panel/EncabezadoPanel'
import { EstadosDelPersonal } from '../componentes/panel/EstadosDelPersonal'
import { HorasTrabajadasHoy } from '../componentes/panel/HorasTrabajadasHoy'
import { PanelAlertas } from '../componentes/panel/PanelAlertas'
import { PromedioAlmuerzoHoy } from '../componentes/panel/PromedioAlmuerzoHoy'
import { ResumenPorHospital } from '../componentes/panel/ResumenPorHospital'
import { TablaPersonalEnVivo } from '../componentes/panel/TablaPersonalEnVivo'
import { TarjetasIndicadores } from '../componentes/panel/TarjetasIndicadores'
import { usePanel } from '../hooks/usePanel'
import { useSesion } from '../hooks/useSesion'
import {
  agruparPorEstado,
  calcularHorasDelDia,
  calcularIndicadores,
  calcularPromedioAlmuerzo,
  esClaveIndicador,
  resumirPorHospital,
} from '../reglas/indicadoresPanel'

/**
 * Inicio: panel de coordinación (HU-01) con la situación actual del personal. Se actualiza solo cada
 * cierto tiempo (provisional, P-25) y con el botón «Actualizar», sin perder la búsqueda ni la página de
 * la tabla. Los números salen de las reglas provisionales: son una ayuda para revisar, no una sanción.
 * Los permisos son solo visuales (D27).
 */
export function PaginaInicio() {
  const { usuario } = useSesion()
  const [parametros] = useSearchParams()
  const panel = usePanel()
  const indicador = parametros.get('indicador')

  if (panel.cargando && !panel.instantanea) {
    return <EstadoCarga mensaje="Cargando el panel…" />
  }
  if (!panel.instantanea) {
    return <EstadoError mensaje={panel.error ?? 'No se pudo cargar el panel.'} onReintentar={panel.recargar} />
  }
  const { filas, hospitales, municipios, alertas, reglas, generadaEn } = panel.instantanea

  return (
    <div className="pagina-inicio">
      <EncabezadoPanel
        nombre={usuario?.nombres.split(' ')[0] ?? ''}
        actualizadoEn={new Date(generadaEn)}
        actualizando={panel.cargando}
        segundosEntreActualizaciones={panel.segundosEntreActualizaciones}
        onActualizar={panel.recargar}
      />
      {panel.error && <p role="alert" className="pagina-inicio__error">No se pudo actualizar; se muestran los datos de la última actualización correcta.</p>}
      <TarjetasIndicadores indicadores={calcularIndicadores(filas)} />
      <div className="pagina-inicio__cuerpo">
        <div className="pagina-inicio__principal">
          <section id="personal-en-tiempo-real">
            <Tarjeta titulo="Personal en tiempo real">
              <TablaPersonalEnVivo
                key={indicador ?? 'todo'}
                filas={filas}
                municipios={municipios}
                indicador={esClaveIndicador(indicador) ? indicador : null}
              />
            </Tarjeta>
          </section>
          <div className="pagina-inicio__metricas">
            <Tarjeta titulo="Horas trabajadas hoy">
              <HorasTrabajadasHoy horas={calcularHorasDelDia(filas)} />
            </Tarjeta>
            <Tarjeta titulo="Estados del personal">
              <EstadosDelPersonal grupos={agruparPorEstado(filas)} />
            </Tarjeta>
            <Tarjeta titulo="Promedio de almuerzo">
              <PromedioAlmuerzoHoy promedio={calcularPromedioAlmuerzo(filas, reglas.toleranciaAlmuerzoMinutos)} />
            </Tarjeta>
          </div>
        </div>
        <aside className="pagina-inicio__lateral">
          <Tarjeta titulo="Alertas e incidencias" acciones={<Link to="/incidencias">Ver todas</Link>}>
            <PanelAlertas alertas={alertas} filas={filas} />
          </Tarjeta>
          <Tarjeta titulo="Resumen por hospital" acciones={<Link to="/hospitales">Ver hospitales</Link>}>
            <ResumenPorHospital resumen={resumirPorHospital(filas, hospitales, municipios)} />
          </Tarjeta>
          <Tarjeta titulo="Ubicación de hospitales" acciones={<Link to="/hospitales">Ver mapa completo</Link>}>
            <MapaEsquematico hospitales={hospitales} />
          </Tarjeta>
        </aside>
      </div>
    </div>
  )
}
