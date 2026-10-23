import type { AlertaDto } from '../contratos/alerta'
import type { HospitalDto } from '../contratos/hospital'
import type {
  EstadoIncidencia,
  HistorialIncidenciaDto,
  IncidenciaDto,
  JustificacionDto,
  TipoIncidencia,
} from '../contratos/incidencia'
import { obtenerAsignacionVigente } from '../reglas/asignacionCoordinador'
import { elegir, type Generador } from './generadorAleatorio'
import { sumarMinutos } from './construirMarcaciones'

const SISTEMA = 'sistema'

const TEXTOS_JUSTIFICACION = [
  'Derrumbe en la vía; el transporte se demoró y el hospital fue informado por teléfono.',
  'Cita médica programada; el soporte se entregó al coordinador.',
  'Se atendió a un paciente en urgencias y el almuerzo se pospuso.',
  'Falla en el transporte público; se avisó a la jefatura del servicio.',
]

/** Datos para crear una incidencia de demostración. */
export interface EntradaIncidencia {
  tipo: TipoIncidencia
  trabajadorId: string
  hospital: HospitalDto
  fechaOperativa: string
  detectadaEn: Date
  /** Estado final; los días recientes solo admiten PENDIENTE o EN_REVISION para no inventar hechos futuros. */
  estado: EstadoIncidencia
  generador: Generador
}

function entradaHistorial(
  incidenciaId: string,
  orden: number,
  datos: Omit<HistorialIncidenciaDto, 'id'>,
): HistorialIncidenciaDto {
  return { id: `${incidenciaId}-h${orden}`, ...datos }
}

/**
 * Crea una incidencia de demostración con el historial que corresponde a su estado final.
 * Nunca implica una sanción (principio 8): «no justificada» solo queda registrada.
 * Si el hospital no tiene coordinador vigente, la incidencia queda pendiente de asignación (D28).
 */
export function construirIncidencia(entrada: EntradaIncidencia): IncidenciaDto {
  const { tipo, trabajadorId, hospital, fechaOperativa, detectadaEn, estado, generador } = entrada
  const id = `inc-${tipo.toLowerCase()}-${trabajadorId}-${fechaOperativa}`
  const revisor = obtenerAsignacionVigente(hospital.asignacionesCoordinador, fechaOperativa)?.coordinadorId
  const instante = (minutos: number) => sumarMinutos(detectadaEn, minutos).toISOString()

  const historial: HistorialIncidenciaDto[] = [
    entradaHistorial(id, 1, { accion: 'DETECTADA', usuarioId: SISTEMA, instante: instante(0), estadoNuevo: 'PENDIENTE' }),
  ]
  const justificaciones: JustificacionDto[] = []

  if (revisor) {
    historial.push(entradaHistorial(id, 2, { accion: 'ASIGNADA', usuarioId: SISTEMA, instante: instante(1), motivo: 'Coordinador responsable del hospital' }))
  }
  if (estado === 'JUSTIFICADA') {
    justificaciones.push({ id: `${id}-j1`, autorId: trabajadorId, texto: elegir(generador, TEXTOS_JUSTIFICACION), creadaEn: instante(180) })
    historial.push(entradaHistorial(id, 3, { accion: 'JUSTIFICADA', usuarioId: trabajadorId, instante: instante(180) }))
  }
  if (revisor && estado !== 'PENDIENTE') {
    historial.push(entradaHistorial(id, 4, { accion: 'REVISADA', usuarioId: revisor, instante: instante(600), estadoAnterior: 'PENDIENTE', estadoNuevo: 'EN_REVISION' }))
  }
  if (revisor && ['JUSTIFICADA', 'NO_JUSTIFICADA', 'PENDIENTE_INFORMACION'].includes(estado)) {
    historial.push(entradaHistorial(id, 5, {
      accion: 'RESUELTA',
      usuarioId: revisor,
      instante: instante(1500),
      estadoAnterior: 'EN_REVISION',
      estadoNuevo: estado,
      motivo: estado === 'PENDIENTE_INFORMACION' ? 'Se solicita el soporte de la situación.' : undefined,
    }))
  }

  return {
    id,
    tipo,
    estado: revisor ? estado : 'PENDIENTE',
    trabajadorId,
    hospitalId: hospital.id,
    fechaOperativa,
    detectadaEn: detectadaEn.toISOString(),
    revisorPrincipalId: revisor,
    asignacion: revisor ? 'ASIGNADA' : 'PENDIENTE_ASIGNACION',
    justificaciones: revisor ? justificaciones : [],
    historial: revisor ? historial : historial.slice(0, 1),
  }
}

/** Crea la alerta de una incidencia. Es revisada si la incidencia ya salió de PENDIENTE. */
export function construirAlerta(incidencia: IncidenciaDto): AlertaDto {
  return {
    id: `ale-${incidencia.id}`,
    incidenciaId: incidencia.id,
    creadaEn: incidencia.detectadaEn,
    revisada: incidencia.estado !== 'PENDIENTE',
  }
}
