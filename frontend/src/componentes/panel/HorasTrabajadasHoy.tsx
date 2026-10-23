import '../../estilos/componentes/HorasTrabajadasHoy.css'
import type { HorasDelDia } from '../../reglas/indicadoresPanel'
import { formatearDuracion } from '../../utilidades/formatoDuracion'

interface PropiedadesHorasTrabajadasHoy {
  horas: HorasDelDia
}

/**
 * «Horas trabajadas hoy» (HU-01, D21): tiempo efectivo programado frente al registrado hasta ahora, sin
 * mezclar el almuerzo. Lo registrado es parcial mientras haya jornadas abiertas y la diferencia es del
 * momento, no un incumplimiento. Provisional (P-03 y P-05 abiertos). Muestra lo que recibe; no calcula.
 */
export function HorasTrabajadasHoy({ horas }: PropiedadesHorasTrabajadasHoy) {
  const { programadasMinutos, registradasMinutos, diferenciaMinutos } = horas
  const avance = programadasMinutos === 0 ? 0 : Math.min(100, Math.round((registradasMinutos / programadasMinutos) * 100))
  return (
    <div className="horas-trabajadas-hoy">
      <meter min={0} max={100} value={avance} aria-label={`Avance del tiempo efectivo programado de hoy: ${avance} %`} />
      <dl>
        <div>
          <dt>Efectivo programado</dt>
          <dd>{formatearDuracion(programadasMinutos)}</dd>
        </div>
        <div>
          <dt>Efectivo registrado hasta ahora</dt>
          <dd>{formatearDuracion(registradasMinutos)}</dd>
        </div>
        <div>
          <dt>Diferencia en este momento</dt>
          <dd>
            {diferenciaMinutos < 0 ? '−' : '+'}
            {formatearDuracion(Math.abs(diferenciaMinutos))}
          </dd>
        </div>
      </dl>
      <p className="horas-trabajadas-hoy__nota">Suma del personal esperado hoy. Parcial mientras haya jornadas abiertas; no incluye el almuerzo.</p>
    </div>
  )
}
