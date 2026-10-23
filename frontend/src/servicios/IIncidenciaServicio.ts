import type { IncidenciaDto } from '../contratos/incidencia'
import type { IntentoMarcacionDto } from '../contratos/marcacion'
import type { ResolucionIncidencia } from '../reglas/permisosIncidencia'

/**
 * Contrato del servicio de incidencias.
 *
 * Entrega las incidencias y ejecuta las acciones del flujo D11: justificar, revisar, resolver, reabrir,
 * escalar y asignar revisor. Cada acción **añade** una entrada al historial (nunca edita ni borra, R-10) y
 * las decisiones dejan auditoría (quién, cuándo y por qué). Resolver o escalar no toca los intentos
 * originales. Una incidencia no es una sanción: ninguna acción tiene efecto sobre pagos ni contratos (P-18).
 * No decide quién puede actuar (`reglas/permisosIncidencia`; en la Fase 1 es solo visual, D27).
 */
export interface IIncidenciaServicio {
  /** Evalúa las reglas de detección sobre la jornada actual y abre las incidencias nuevas. Devuelve cuántas abrió. */
  sincronizar(): Promise<number>
  /** Todas las incidencias, la más reciente primero. Antes de listar, la demostración ejecuta `sincronizar`. */
  listar(): Promise<IncidenciaDto[]>
  obtenerPorId(id: string): Promise<IncidenciaDto | null>
  /** Intentos rechazados asociados a una incidencia de ubicación no autorizada, en orden cronológico. */
  listarIntentos(incidenciaId: string): Promise<IntentoMarcacionDto[]>
  /**
   * Añade una justificación de texto (sin adjuntos, P-16). Si la registra otra persona en nombre del
   * trabajador, `motivo` es obligatorio.
   */
  justificar(id: string, texto: string, usuarioId: string, motivo?: string): Promise<IncidenciaDto>
  /** Pasa de «Pendiente» a «En revisión». */
  iniciarRevision(id: string, usuarioId: string): Promise<IncidenciaDto>
  /** Registra la resolución con su motivo (obligatorio) y deja auditoría. */
  resolver(id: string, resolucion: ResolucionIncidencia, motivo: string, usuarioId: string): Promise<IncidenciaDto>
  /** Reabre una incidencia cerrada; el motivo es obligatorio. */
  reabrir(id: string, motivo: string, usuarioId: string): Promise<IncidenciaDto>
  /** Escala al administrador (D29); el motivo es obligatorio. */
  escalar(id: string, motivo: string, usuarioId: string): Promise<IncidenciaDto>
  /** Asigna un coordinador como revisor de una incidencia pendiente de asignación (D28). */
  asignarRevisor(id: string, coordinadorId: string, usuarioId: string, motivo?: string): Promise<IncidenciaDto>
}
