import type { AlertaDto } from '../contratos/alerta'
import type { EntradaAuditoriaDto } from '../contratos/auditoria'
import type { AsignacionHorarioDto } from '../contratos/horario'
import type { HospitalDto, MunicipioDto } from '../contratos/hospital'
import type { IncidenciaDto } from '../contratos/incidencia'
import type { IntentoMarcacionDto, MarcacionDto } from '../contratos/marcacion'
import type { TrabajadorDto } from '../contratos/trabajador'
import type { UsuarioDto } from '../contratos/usuario'

/** Conjunto completo de datos ficticios de la demostración. Solo contiene contratos, nunca lógica. */
export interface DatosDemo {
  municipios: MunicipioDto[]
  hospitales: HospitalDto[]
  usuarios: UsuarioDto[]
  trabajadores: TrabajadorDto[]
  horarios: AsignacionHorarioDto[]
  marcaciones: MarcacionDto[]
  intentos: IntentoMarcacionDto[]
  incidencias: IncidenciaDto[]
  alertas: AlertaDto[]
  auditoria: EntradaAuditoriaDto[]
}

/** Momento de referencia con el que se generan los datos relativos al día actual de Colombia (D33). */
export interface ContextoDemo {
  /** Fecha de hoy en Colombia, `AAAA-MM-DD`. */
  hoy: string
  /** Instante actual (UTC). Los eventos posteriores a este instante no se generan. */
  ahora: Date
}
