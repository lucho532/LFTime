import '../../estilos/componentes/ResumenHorario.css'
import type { AsignacionHorarioDto } from '../../contratos/horario'
import { resumirDias } from '../../utilidades/diasSemana'
import { minutosEntre } from '../../utilidades/horas'

/**
 * Resumen legible de un horario asignado: entrada y salida, días, almuerzo (intervalo y duración) y,
 * cuando corresponde, que el turno cruza la medianoche (D5). Solo muestra; no calcula jornadas.
 */
export function ResumenHorario({ horario }: { horario: AsignacionHorarioDto }) {
  const cruzaMedianoche = horario.horaSalida < horario.horaEntrada
  const horasProgramadas = minutosEntre(horario.horaEntrada, horario.horaSalida) / 60
  return (
    <dl className="resumen-horario">
      <dt>Jornada</dt>
      <dd>
        {horario.horaEntrada} – {horario.horaSalida}
        {cruzaMedianoche && ' (cruza la medianoche)'}
        <small> · {Number.isInteger(horasProgramadas) ? horasProgramadas : horasProgramadas.toFixed(1)} h de entrada a salida, incluido el almuerzo</small>
      </dd>
      <dt>Días</dt>
      <dd>{resumirDias(horario.diasLaborables)}</dd>
      <dt>Almuerzo</dt>
      <dd>
        Entre {horario.ventanaAlmuerzoDesde} y {horario.ventanaAlmuerzoHasta} · {horario.duracionAlmuerzoMinutos} min autorizados
      </dd>
      <dt>Rige desde</dt>
      <dd>{horario.vigenteDesde}</dd>
    </dl>
  )
}
