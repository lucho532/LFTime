import type { MunicipioDto } from '../contratos/hospital'
import type { DatosHospital, EntradaCoordenadas, Hospital } from '../modelos/hospital'

/**
 * Contrato del servicio de hospitales y municipios.
 *
 * Entrega hospitales con su coordinador responsable vigente ya resuelto y registra los cambios
 * (con auditoría). No decide si una marcación es válida ni quién puede ejecutar cada operación:
 * en la Fase 1 eso es solo visual (D27) y en la Fase 2 lo comprueba el servidor.
 */
export interface IHospitalServicio {
  listar(): Promise<Hospital[]>
  obtenerPorId(id: string): Promise<Hospital | null>
  listarMunicipios(): Promise<MunicipioDto[]>
  /** Crea un hospital sin coordenadas: no admite marcaciones hasta confirmarlas (D25). */
  crear(datos: DatosHospital, usuarioId: string): Promise<Hospital>
  actualizar(id: string, datos: DatosHospital, usuarioId: string): Promise<Hospital>
  /**
   * Confirma las coordenadas de un hospital (D22). Valida los rangos, conserva en el historial el valor
   * anterior, quién y cuándo, y registra auditoría.
   */
  confirmarCoordenadas(id: string, coordenadas: EntradaCoordenadas, usuarioId: string): Promise<Hospital>
  /**
   * Cambia el coordinador responsable principal (D28): cierra la vigencia de la asignación actual y
   * abre una nueva desde hoy, sin borrar nada. Registra auditoría.
   */
  asignarCoordinador(id: string, coordinadorId: string, usuarioId: string, motivo?: string): Promise<Hospital>
}
