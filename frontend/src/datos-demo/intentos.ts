import type { AsignacionHorarioDto } from '../contratos/horario'
import type { HospitalDto } from '../contratos/hospital'
import type { EstadoIncidencia, IncidenciaDto } from '../contratos/incidencia'
import type { IntentoMarcacionDto, MotivoRechazo } from '../contratos/marcacion'
import { obtenerHorarioVigente } from '../reglas/horarioVigente'
import { sumarDias } from '../utilidades/horaColombia'
import { construirIncidencia } from './construirIncidencias'
import { instantesBase, sumarMinutos, ubicacionA } from './construirMarcaciones'
import { TRABAJADOR_INTENTO_FALLO_TECNICO, TRABAJADOR_INTENTO_FUERA_DE_RADIO } from './escenarios'
import { crearGenerador } from './generadorAleatorio'
import type { ContextoDemo } from './tipos'

/** Descripción de un intento de ejemplo, relativo a la hora programada de entrada. */
interface IntentoSemilla {
  trabajadorId: string
  /** Días antes de hoy (0 = hoy). */
  diasAtras: number
  /** Minutos respecto a la hora de entrada programada (negativo = antes). */
  minutos: number
  motivo: MotivoRechazo
  /** Distancia al hospital; solo si hay ubicación válida. */
  distanciaMetros?: number
  precisionMetros?: number
  /** Estado final de la incidencia agrupada (solo para FUERA_DE_RADIO). */
  estadoIncidencia?: EstadoIncidencia
}

/**
 * Intentos rechazados de ejemplo (D23, D26):
 * - trab-012: dos intentos fuera de radio hoy → **una** incidencia agrupada con ambos.
 * - trab-013: fallo técnico (permiso denegado) hoy → **sin** incidencia de ubicación indebida.
 * - trab-020: intento fuera de radio hace dos días, incidencia ya justificada.
 * - trab-025: fallo técnico por precisión insuficiente hace cuatro días.
 */
const SEMILLAS: IntentoSemilla[] = [
  { trabajadorId: TRABAJADOR_INTENTO_FUERA_DE_RADIO, diasAtras: 0, minutos: -6, motivo: 'FUERA_DE_RADIO', distanciaMetros: 165, precisionMetros: 12, estadoIncidencia: 'PENDIENTE' },
  { trabajadorId: TRABAJADOR_INTENTO_FUERA_DE_RADIO, diasAtras: 0, minutos: -3, motivo: 'FUERA_DE_RADIO', distanciaMetros: 140, precisionMetros: 10, estadoIncidencia: 'PENDIENTE' },
  { trabajadorId: TRABAJADOR_INTENTO_FALLO_TECNICO, diasAtras: 0, minutos: -2, motivo: 'PERMISO_DENEGADO' },
  { trabajadorId: 'trab-020', diasAtras: 2, minutos: -4, motivo: 'FUERA_DE_RADIO', distanciaMetros: 210, precisionMetros: 15, estadoIncidencia: 'JUSTIFICADA' },
  { trabajadorId: 'trab-025', diasAtras: 4, minutos: -2, motivo: 'PRECISION_INSUFICIENTE', distanciaMetros: 20, precisionMetros: 48 },
]

/** Indica si el trabajador tiene un intento rechazado de ejemplo ese día; su entrada válida llega después del intento. */
export function tieneIntentoEseDia(trabajadorId: string, diasAtras: number): boolean {
  return SEMILLAS.some((semilla) => semilla.trabajadorId === trabajadorId && semilla.diasAtras === diasAtras)
}

/** Resultado: los intentos y las incidencias agrupadas que de ellos se derivan. */
export interface ResultadoIntentos {
  intentos: IntentoMarcacionDto[]
  incidencias: IncidenciaDto[]
}

/**
 * Construye los intentos rechazados de demostración y la incidencia agrupada de ubicación no
 * autorizada (una por trabajador + fecha operativa + hospital). Los intentos posteriores al
 * instante actual no se generan. Un fallo técnico nunca produce incidencia de ubicación indebida.
 */
export function construirIntentos(
  contexto: ContextoDemo,
  hospitales: HospitalDto[],
  trabajadorHospital: Record<string, string>,
  horarios: AsignacionHorarioDto[],
): ResultadoIntentos {
  const intentos: IntentoMarcacionDto[] = []
  const gruposFueraDeRadio = new Map<string, { intentos: IntentoMarcacionDto[]; estado: EstadoIncidencia }>()

  for (const semilla of SEMILLAS) {
    const fecha = sumarDias(contexto.hoy, -semilla.diasAtras)
    const hospital = hospitales.find((h) => h.id === trabajadorHospital[semilla.trabajadorId])
    const horario = obtenerHorarioVigente(horarios, semilla.trabajadorId, fecha)
    if (!hospital || !horario) {
      continue
    }
    const instante = sumarMinutos(instantesBase(horario, fecha).inicio, semilla.minutos)
    if (instante.getTime() > contexto.ahora.getTime()) {
      continue
    }
    const esFueraDeRadio = semilla.motivo === 'FUERA_DE_RADIO'
    const incidenciaId = `inc-ubicacion_no_autorizada-${semilla.trabajadorId}-${fecha}`
    const intento: IntentoMarcacionDto = {
      id: `int-${semilla.trabajadorId}-${fecha}-${Math.abs(semilla.minutos)}`,
      trabajadorId: semilla.trabajadorId,
      hospitalId: hospital.id,
      tipo: 'ENTRADA',
      instante: instante.toISOString(),
      fechaOperativa: fecha,
      motivo: semilla.motivo,
      esFalloTecnico: !esFueraDeRadio,
      ubicacion: semilla.distanciaMetros !== undefined && semilla.precisionMetros !== undefined
        ? ubicacionA(hospital, semilla.distanciaMetros, semilla.precisionMetros)
        : undefined,
      distanciaAlHospitalMetros: semilla.distanciaMetros,
      incidenciaId: esFueraDeRadio ? incidenciaId : undefined,
    }
    intentos.push(intento)
    if (esFueraDeRadio) {
      const grupo = gruposFueraDeRadio.get(incidenciaId) ?? { intentos: [], estado: semilla.estadoIncidencia ?? 'PENDIENTE' }
      grupo.intentos.push(intento)
      gruposFueraDeRadio.set(incidenciaId, grupo)
    }
  }

  const incidencias: IncidenciaDto[] = []
  for (const grupo of gruposFueraDeRadio.values()) {
    const primero = grupo.intentos[0]
    const hospital = hospitales.find((h) => h.id === primero.hospitalId)!
    const incidencia = construirIncidencia({
      tipo: 'UBICACION_NO_AUTORIZADA',
      trabajadorId: primero.trabajadorId,
      hospital,
      fechaOperativa: primero.fechaOperativa,
      detectadaEn: new Date(primero.instante),
      estado: grupo.estado,
      generador: crearGenerador(7),
    })
    incidencia.intentosIds = grupo.intentos.map((intento) => intento.id)
    grupo.intentos.slice(1).forEach((intento, orden) => {
      incidencia.historial.push({
        id: `${incidencia.id}-i${orden + 2}`,
        accion: 'INTENTO_ANADIDO',
        usuarioId: 'sistema',
        instante: intento.instante,
      })
    })
    incidencia.historial.sort((a, b) => a.instante.localeCompare(b.instante))
    incidencias.push(incidencia)
  }
  return { intentos, incidencias }
}
