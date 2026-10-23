import type { HospitalDto } from '../../contratos/hospital'
import type { IncidenciaDto, TipoIncidencia } from '../../contratos/incidencia'
import { obtenerAsignacionVigente } from '../../reglas/asignacionCoordinador'
import { repositorios } from '../../repositorios/demo/repositorios'

const SISTEMA = 'sistema'

/** Datos para abrir una incidencia detectada. */
export interface DatosAperturaIncidencia {
  tipo: TipoIncidencia
  trabajadorId: string
  hospital: HospitalDto
  fechaOperativa: string
  /** Instante (ISO UTC) desde el que la anomalía es afirmable. */
  detectadaEn: string
  /** Solo para la ubicación no autorizada (D26). */
  intentosIds?: string[]
}

/**
 * Abre una incidencia y su alerta (P-19). El revisor es el coordinador responsable del hospital en la
 * fecha operativa; sin responsable queda «pendiente de asignación» (D28). Es idempotente: el identificador
 * sale de tipo + trabajador + fecha operativa, así que no se duplica. Solo añade; una incidencia no es una
 * sanción. Devuelve la incidencia (la existente, si ya estaba).
 */
export function abrirIncidencia(datos: DatosAperturaIncidencia): IncidenciaDto {
  const id = `inc-${datos.tipo.toLowerCase()}-${datos.trabajadorId}-${datos.fechaOperativa}`
  const existente = repositorios.incidencias.obtenerPorId(id)
  if (existente) {
    return existente
  }
  const revisor = obtenerAsignacionVigente(datos.hospital.asignacionesCoordinador, datos.fechaOperativa)?.coordinadorId
  const incidencia: IncidenciaDto = {
    id,
    tipo: datos.tipo,
    estado: 'PENDIENTE',
    trabajadorId: datos.trabajadorId,
    hospitalId: datos.hospital.id,
    fechaOperativa: datos.fechaOperativa,
    detectadaEn: datos.detectadaEn,
    revisorPrincipalId: revisor,
    asignacion: revisor ? 'ASIGNADA' : 'PENDIENTE_ASIGNACION',
    intentosIds: datos.intentosIds,
    justificaciones: [],
    historial: [
      { id: `${id}-h1`, accion: 'DETECTADA', usuarioId: SISTEMA, instante: datos.detectadaEn, estadoNuevo: 'PENDIENTE' },
      ...(revisor ? [{ id: `${id}-h2`, accion: 'ASIGNADA' as const, usuarioId: SISTEMA, instante: datos.detectadaEn, motivo: 'Coordinador responsable del hospital' }] : []),
    ],
  }
  repositorios.incidencias.guardar(incidencia)
  repositorios.alertas.guardar({ id: `ale-${id}`, incidenciaId: id, creadaEn: datos.detectadaEn, revisada: false })
  return incidencia
}
