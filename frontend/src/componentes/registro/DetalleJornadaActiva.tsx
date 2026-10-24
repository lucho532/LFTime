import '../../estilos/componentes/DetalleJornadaActiva.css'
import type { TipoMarcacion } from '../../contratos/marcacion'
import { ACCION_MARCACION } from '../../modelos/etiquetasMarcacion'
import type { InstantesJornada } from '../../reglas/duraciones'
import { formatearDuracion } from '../../utilidades/formatoDuracion'
import { formatearHora12 } from '../../utilidades/horaColombia'
import { Boton } from '../base/Boton'
import { Icono } from '../iconos/Icono'
import { CajaMovil } from '../movil/CajaMovil'
import { EncabezadoPantallaMovil } from '../movil/EncabezadoPantallaMovil'

interface PropiedadesDetalleJornadaActiva {
  instantes: InstantesJornada
  /** Tiempo efectivo acumulado hasta ahora; `null` si aún no hay entrada. Es una referencia, no el tiempo oficial. */
  efectivoMinutos: number | null
  /** Duración del turno de entrada a salida según el horario; `null` si no hay horario vigente. */
  programadosMinutos: number | null
  siguiente: TipoMarcacion | null
  puedeRegistrar: boolean
  onRegistrar: () => void
  onAtras: () => void
}

const hora = (instante: Date | null) => (instante ? formatearHora12(instante) : '—')

/**
 * Detalle de la jornada en curso: tiempo trabajado hasta ahora frente a lo programado y las tres marcas del
 * día (entrada, almuerzo y salida). El tiempo es una referencia: los oficiales salen de las marcas
 * registradas y se ven en el resumen del historial (D16). No calcula nada; recibe todo ya calculado.
 */
export function DetalleJornadaActiva({ instantes, efectivoMinutos, programadosMinutos, siguiente, puedeRegistrar, onRegistrar, onAtras }: PropiedadesDetalleJornadaActiva) {
  const programados = programadosMinutos === null ? null : formatearDuracion(programadosMinutos)
  return (
    <section className="detalle-jornada-activa">
      <EncabezadoPantallaMovil titulo="Mi jornada de hoy" onAtras={onAtras} />
      <CajaMovil tono="verde" icono="registro" titulo="Tiempo trabajado">
        <strong className="detalle-jornada-activa__tiempo">{efectivoMinutos === null ? '—' : formatearDuracion(efectivoMinutos)}</strong>
        <small>{programados ? `de ${programados} programadas, de entrada a salida (referencia, no oficial)` : 'sin horario vigente (referencia, no oficial)'}</small>
      </CajaMovil>
      <dl className="detalle-jornada-activa__marcas">
        <div>
          <dt>
            <Icono nombre="entrada" /> Entrada
          </dt>
          <dd>{hora(instantes.entrada)}</dd>
        </div>
        <div>
          <dt>
            <Icono nombre="cubiertos" /> Almuerzo
          </dt>
          <dd>{instantes.salidaAlmuerzo ? `${hora(instantes.salidaAlmuerzo)} a ${hora(instantes.regresoAlmuerzo)}` : '—'}</dd>
        </div>
        <div>
          <dt>
            <Icono nombre="salida" /> Salida
          </dt>
          <dd>{hora(instantes.salidaFinal)}</dd>
        </div>
      </dl>
      {puedeRegistrar && siguiente !== null && (
        <Boton variante="secundario" className="detalle-jornada-activa__boton" onClick={onRegistrar}>
          {ACCION_MARCACION[siguiente]}
        </Boton>
      )}
      <CajaMovil icono="info">El almuerzo se registra con salida y regreso. El tiempo se calcula automáticamente a partir de tus registros.</CajaMovil>
    </section>
  )
}
