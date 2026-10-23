import type { AsignacionHorarioDto } from '../contratos/horario'
import { descomponerEnColombia, sumarDias } from '../utilidades/horaColombia'
import { obtenerHorarioVigente } from './horarioVigente'
import { esDiaLaborable, resolverTurno } from './turnoProgramado'

function fechaColombiaDe(instante: Date): string {
  const { anio, mes, dia } = descomponerEnColombia(instante)
  return `${String(anio).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/** Milisegundos entre un instante y el intervalo `[inicio, fin]`; 0 si está dentro. */
function distanciaAlTurno(instante: Date, inicio: Date, fin: Date): number {
  if (instante < inicio) return inicio.getTime() - instante.getTime()
  if (instante > fin) return instante.getTime() - fin.getTime()
  return 0
}

/**
 * Fecha operativa (`AAAA-MM-DD`) a la que pertenece un instante real para un trabajador.
 *
 * Regla provisional (P-04, aceptada en D37; el negocio sigue abierto): la jornada pertenece a la fecha
 * en que **empieza** el turno programado, aunque cruce la medianoche. Se comparan los turnos que empiezan
 * el día anterior, el mismo día y el siguiente (hora de Colombia) y gana el que contiene el instante o,
 * si ninguno lo contiene, el más cercano; en un empate gana el más antiguo. Si el trabajador no tiene
 * ningún turno en esos días, se usa la fecha de Colombia del propio instante.
 *
 * Función pura: no lee el reloj ni decide si una marcación es válida.
 */
export function calcularFechaOperativa(instante: Date, horarios: AsignacionHorarioDto[], trabajadorId: string): string {
  const fechaDelInstante = fechaColombiaDe(instante)
  let mejor: { fecha: string; distancia: number } | null = null
  for (const fecha of [sumarDias(fechaDelInstante, -1), fechaDelInstante, sumarDias(fechaDelInstante, 1)]) {
    const horario = obtenerHorarioVigente(horarios, trabajadorId, fecha)
    if (!horario || !esDiaLaborable(horario, fecha)) {
      continue
    }
    const turno = resolverTurno(horario, fecha)
    const distancia = distanciaAlTurno(instante, turno.inicio, turno.fin)
    if (mejor === null || distancia < mejor.distancia) {
      mejor = { fecha, distancia }
    }
  }
  return mejor?.fecha ?? fechaDelInstante
}
