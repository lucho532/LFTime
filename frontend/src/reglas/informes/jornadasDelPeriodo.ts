import type { IncidenciaDto } from '../../contratos/incidencia'
import type { MarcacionDto } from '../../contratos/marcacion'
import type { EstadoVisible } from '../../modelos/estadoVisible'
import type { Hospital } from '../../modelos/hospital'
import type { DatosInformes, FiltrosInforme } from '../../modelos/informe'
import type { Trabajador } from '../../modelos/trabajador'
import { fechaColombiaDe } from '../../utilidades/horaColombia'
import { calcularDuraciones, instantesDeJornada, type DuracionesJornada, type InstantesJornada } from '../duraciones'
import { calcularEstadoActual } from '../estadoActual'
import { obtenerHorarioVigente } from '../horarioVigente'
import { estaCerrada } from '../permisosIncidencia'
import { esDiaLaborable, resolverTurno } from '../turnoProgramado'
import { fechasDelPeriodo } from './periodo'

/** Una jornada de un trabajador en una fecha operativa, con todo lo que los informes necesitan de ella. */
export interface JornadaInforme {
  trabajador: Trabajador
  hospital: Hospital
  municipio: string
  fecha: string
  /** Se esperaba esa jornada: trabajador activo, horario laborable ese día y hospital que admite marcar. */
  programada: boolean
  efectivoProgramadoMinutos: number
  turnoInicio: Date | null
  turnoFin: Date | null
  marcaciones: MarcacionDto[]
  instantes: InstantesJornada
  duraciones: DuracionesJornada
  /** Estado visible calculado con la hora de la foto (D31); `null` si ese día no se esperaba nada. */
  estado: EstadoVisible | null
  incidencias: IncidenciaDto[]
}

/** Trabajadores que cumplen los filtros de trabajador, hospital y municipio (HU-08). */
export function filtrarTrabajadores(datos: DatosInformes, filtros: FiltrosInforme): Trabajador[] {
  const municipioDe = (hospitalId: string) => datos.hospitales.find((h) => h.id === hospitalId)?.municipioId
  return datos.trabajadores.filter(
    (t) =>
      (filtros.trabajadorId === '' || t.id === filtros.trabajadorId) &&
      (filtros.hospitalId === '' || t.hospitalId === filtros.hospitalId) &&
      (filtros.municipioId === '' || municipioDe(t.hospitalId) === filtros.municipioId),
  )
}

const claveDe = (trabajadorId: string, fecha: string) => `${trabajadorId}|${fecha}`

function agrupar<T extends { trabajadorId: string; fechaOperativa: string }>(elementos: T[]): Map<string, T[]> {
  const grupos = new Map<string, T[]>()
  for (const elemento of elementos) {
    const clave = claveDe(elemento.trabajadorId, elemento.fechaOperativa)
    grupos.set(clave, [...(grupos.get(clave) ?? []), elemento])
  }
  return grupos
}

/**
 * Reúne, por trabajador y fecha operativa del periodo (sin pasar de hoy), la jornada con sus marcaciones,
 * duraciones, estado e incidencias. Solo incluye una fecha si se esperaba la jornada o hay marcaciones ese
 * día. Función pura sobre la foto `datos`: el estado usa `datos.ahora` y no el reloj. Los tiempos y estados
 * son provisionales (P-01, P-02, P-03, P-05).
 */
export function construirJornadas(datos: DatosInformes, filtros: FiltrosInforme): JornadaInforme[] {
  const ahora = new Date(datos.ahora)
  const fechas = fechasDelPeriodo(filtros.desde, filtros.hasta, fechaColombiaDe(ahora))
  const marcacionesPor = agrupar(datos.marcaciones)
  const incidenciasPor = agrupar(datos.incidencias)
  const jornadas: JornadaInforme[] = []

  for (const trabajador of filtrarTrabajadores(datos, filtros)) {
    const hospital = datos.hospitales.find((h) => h.id === trabajador.hospitalId)
    if (!hospital) continue
    const municipio = datos.municipios.find((m) => m.id === hospital.municipioId)?.nombre ?? ''
    const horarios = datos.horarios.filter((h) => h.trabajadorId === trabajador.id)
    for (const fecha of fechas) {
      const horario = obtenerHorarioVigente(horarios, trabajador.id, fecha)
      const marcaciones = (marcacionesPor.get(claveDe(trabajador.id, fecha)) ?? []).sort((a, b) => a.instante.localeCompare(b.instante))
      const programada = trabajador.estaActivo && horario !== null && hospital.admiteMarcaciones && esDiaLaborable(horario, fecha)
      if (!programada && marcaciones.length === 0) continue
      const incidencias = incidenciasPor.get(claveDe(trabajador.id, fecha)) ?? []
      const turno = horario ? resolverTurno(horario, fecha) : null
      jornadas.push({
        trabajador,
        hospital,
        municipio,
        fecha,
        programada,
        efectivoProgramadoMinutos: programada && turno ? turno.efectivoProgramadoMinutos : 0,
        turnoInicio: turno?.inicio ?? null,
        turnoFin: turno?.fin ?? null,
        marcaciones,
        instantes: instantesDeJornada(marcaciones),
        duraciones: calcularDuraciones(marcaciones),
        estado: calcularEstadoActual(
          { estadoTrabajador: trabajador.estado, horario, fechaOperativa: fecha, marcaciones, ahora, reglas: datos.reglas, hospitalAdmiteMarcacion: hospital.admiteMarcaciones },
          incidencias.some((i) => !estaCerrada(i.estado)),
        ),
        incidencias,
      })
    }
  }
  return jornadas
}
