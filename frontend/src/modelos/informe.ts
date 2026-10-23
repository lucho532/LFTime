import type { ReglasProvisionalesDto } from '../contratos/configuracion'
import type { AsignacionHorarioDto } from '../contratos/horario'
import type { MunicipioDto } from '../contratos/hospital'
import type { IncidenciaDto } from '../contratos/incidencia'
import type { IntentoMarcacionDto, MarcacionDto } from '../contratos/marcacion'
import type { Hospital } from './hospital'
import type { Trabajador } from './trabajador'

/** Informes de la pantalla de Reportes (HU-08). */
export type TipoInforme = 'ASISTENCIA_DIARIA' | 'HORAS_POR_TRABAJADOR' | 'INCIDENCIAS' | 'INTENTOS_RECHAZADOS' | 'CUMPLIMIENTO_POR_HOSPITAL'

/** Nombre de cada informe, tal como lo ve la persona. */
export const TEXTO_INFORME: Record<TipoInforme, string> = {
  ASISTENCIA_DIARIA: 'Asistencia diaria',
  HORAS_POR_TRABAJADOR: 'Horas por trabajador',
  INCIDENCIAS: 'Incidencias',
  INTENTOS_RECHAZADOS: 'Intentos rechazados',
  CUMPLIMIENTO_POR_HOSPITAL: 'Cumplimiento por hospital',
}

/** Informes en el orden en que se ofrecen. */
export const TIPOS_INFORME = Object.keys(TEXTO_INFORME) as TipoInforme[]

/** Filtros de un informe (HU-08). Un texto vacío significa «sin filtrar»; el periodo es obligatorio. */
export interface FiltrosInforme {
  trabajadorId: string
  hospitalId: string
  municipioId: string
  /** Fecha operativa inicial `AAAA-MM-DD`. */
  desde: string
  /** Fecha operativa final `AAAA-MM-DD`. */
  hasta: string
}

/**
 * Tabla de un informe ya calculada: es **lo mismo** que se muestra en pantalla y lo que se exporta, para
 * que un archivo nunca difiera de lo que la persona vio.
 */
export interface TablaInforme {
  tipo: TipoInforme
  /** Periodo que cubre, como texto (`2026-10-17 a 2026-10-23`). */
  periodo: string
  columnas: string[]
  filas: Array<Array<string | number>>
}

/**
 * Datos en bruto que necesitan los informes: lo registrado, sin cálculos. Los informes se calculan con
 * funciones puras de `reglas/informes` sobre esta foto, con la hora `ahora` fijada en ella.
 */
export interface DatosInformes {
  /** Instante UTC de la foto. */
  ahora: string
  reglas: ReglasProvisionalesDto
  trabajadores: Trabajador[]
  hospitales: Hospital[]
  municipios: MunicipioDto[]
  /** Nombres de las personas con cuenta, para mostrar revisores. */
  nombresUsuarios: Record<string, string>
  horarios: AsignacionHorarioDto[]
  marcaciones: MarcacionDto[]
  intentos: IntentoMarcacionDto[]
  incidencias: IncidenciaDto[]
}
