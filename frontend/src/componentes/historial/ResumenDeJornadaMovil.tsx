import '../../estilos/componentes/ResumenDeJornadaMovil.css'
import type { AsignacionHorarioDto } from '../../contratos/horario'
import type { DuracionesJornada } from '../../reglas/duraciones'
import { formatearDuracion } from '../../utilidades/formatoDuracion'
import { aInstanteUtc, formatearFechaLarga, formatearHora12 } from '../../utilidades/horaColombia'
import { minutosEntre } from '../../utilidades/horas'
import { CajaMovil } from '../movil/CajaMovil'
import { EncabezadoPantallaMovil } from '../movil/EncabezadoPantallaMovil'

interface PropiedadesResumenDeJornadaMovil {
  /** Fecha `AAAA-MM-DD` del resumen. */
  fecha: string
  duraciones: DuracionesJornada
  horario: AsignacionHorarioDto | null
  onAtras: () => void
}

/**
 * Resumen de la jornada de un día: los tres tiempos **por separado** (efectivo, almuerzo y total, D21), con
 * «Incompleto» cuando falta una marca (D16), y el horario programado. Es provisional (P-03 y P-05 abiertos):
 * no decide si el almuerzo se paga ni clasifica horas extra. Recibe todo calculado; no tiene reglas.
 */
export function ResumenDeJornadaMovil({ fecha, duraciones, horario, onAtras }: PropiedadesResumenDeJornadaMovil) {
  const horasDelTurno = horario ? minutosEntre(horario.horaEntrada, horario.horaSalida) / 60 : null
  return (
    <section className="resumen-jornada-movil">
      <EncabezadoPantallaMovil titulo="Resumen de jornada" onAtras={onAtras} />
      <p className="resumen-jornada-movil__fecha">{formatearFechaLarga(aInstanteUtc(fecha, '12:00'))}</p>
      <CajaMovil tono="verde" icono="registro" titulo="Tiempo efectivo">
        <strong className="resumen-jornada-movil__valor">{formatearDuracion(duraciones.efectivoMinutos)}</strong>
      </CajaMovil>
      <CajaMovil tono="ambar" icono="cubiertos" titulo="Tiempo de almuerzo">
        <strong className="resumen-jornada-movil__valor">{formatearDuracion(duraciones.almuerzoMinutos)}</strong>
      </CajaMovil>
      <CajaMovil tono="azul" icono="jornadas" titulo="Total de la jornada">
        <strong className="resumen-jornada-movil__valor">{formatearDuracion(duraciones.totalMinutos)}</strong>
      </CajaMovil>
      <CajaMovil icono="info" titulo="Horario programado">
        {horario && horasDelTurno !== null ? (
          <>
            {formatearHora12(aInstanteUtc(fecha, horario.horaEntrada))} – {formatearHora12(aInstanteUtc(fecha, horario.horaSalida))}
            <br />
            Jornada de {Number.isInteger(horasDelTurno) ? horasDelTurno : horasDelTurno.toFixed(1)} horas de entrada a salida, incluido el almuerzo
          </>
        ) : (
          'No tenías un horario vigente ese día.'
        )}
      </CajaMovil>
      <p className="resumen-jornada-movil__nota">Los tiempos son provisionales y se calculan solo con tus registros; no son una sanción ni un descuento.</p>
    </section>
  )
}
