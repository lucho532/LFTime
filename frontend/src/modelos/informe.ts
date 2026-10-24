import type { ReglasProvisionalesDto } from '../contratos/configuracion'
import type { AsignacionHorarioDto } from '../contratos/horario'
import type { MunicipioDto } from '../contratos/hospital'
import type { IncidenciaDto } from '../contratos/incidencia'
import type { IntentoMarcacionDto, MarcacionDto } from '../contratos/marcacion'
import type { Hospital } from './hospital'
import type { Trabajador } from './trabajador'

/** Informes de la pantalla de Reportes (HU-08). */
export type TipoInforme = 'ASISTENCIA_DIARIA' | 'HORAS_POR_TRABAJADOR' | 'INCIDENCIAS' | 'INTENTOS_RECHAZADOS' | 'CUMPLIMIENTO_POR_HOSPITAL' | 'ACUMULADO_MENSUAL' | 'TIEMPO_DEBIDO'

/** Nombre de cada informe, tal como lo ve la persona. */
export const TEXTO_INFORME: Record<TipoInforme, string> = {
  ASISTENCIA_DIARIA: 'Asistencia diaria',
  HORAS_POR_TRABAJADOR: 'Horas por trabajador',
  INCIDENCIAS: 'Incidencias',
  INTENTOS_RECHAZADOS: 'Intentos rechazados',
  CUMPLIMIENTO_POR_HOSPITAL: 'Cumplimiento por hospital',
  ACUMULADO_MENSUAL: 'Acumulado mensual',
  TIEMPO_DEBIDO: 'Tiempo por reponer',
}

/** Informes en el orden en que se ofrecen. */
export const TIPOS_INFORME = Object.keys(TEXTO_INFORME) as TipoInforme[]

/** Filtros de un informe (HU-08). Un texto vacío significa «sin filtrar»; el periodo es obligatorio. */
export interface FiltrosInforme {
  trabajadorId: string
  hospitalId: string
  municipioId: string
  /** Si es verdadero, solo entra el personal con al menos una incidencia en el periodo. */
  soloConIncidencias: boolean
  /** Fecha operativa inicial `AAAA-MM-DD`. */
  desde: string
  /** Fecha operativa final `AAAA-MM-DD`. */
  hasta: string
}

/** Qué parte de la diferencia con lo programado aporta cada momento de la jornada. */
export interface AporteDiferencia {
  concepto: string
  programado: string
  registrado: string
  /** Minutos que suma (+) o resta (−) al tiempo efectivo; la suma de los aportes es la diferencia total. */
  aporteMinutos: number
  /** Explicación en palabras: «Llegó 22 min tarde». */
  descripcion: string
}

/** De dónde viene la diferencia con lo programado de una jornada completa (provisional, P-03 y P-05). */
export interface DetalleDiferencia {
  fecha: string
  trabajador: string
  aportes: AporteDiferencia[]
  efectivoProgramadoMinutos: number
  efectivoMinutos: number
  diferenciaMinutos: number
}

/** Un día del desglose del tiempo por reponer de un trabajador; los aportes son con signo (− resta tiempo efectivo). */
export interface DiaDeDeuda {
  fecha: string
  entradaMinutos: number
  almuerzoMinutos: number
  salidaMinutos: number
  totalMinutos: number
  incidencias: Array<{ id: string; texto: string }>
}

/** Enlaces de una fila de informe, solo para la pantalla. */
export interface EnlacesDeFila {
  /** Trabajador de la fila, para abrir su ficha (horarios, jornada de hoy). */
  trabajadorId?: string
  /** Nombre del trabajador, para titular los desgloses. */
  nombre?: string
  /** Incidencias de la fila, para abrir cada una; `texto` es lo que dice el enlace. */
  incidencias?: Array<{ id: string; texto: string }>
  /** Desglose de la diferencia con lo programado; solo si la jornada está completa. */
  diferencia?: DetalleDiferencia
  /** Desglose día por día del tiempo por reponer. */
  dias?: DiaDeDeuda[]
}

/**
 * Tabla de un informe ya calculada: es **lo mismo** que se muestra en pantalla y lo que se exporta, para
 * que un archivo nunca difiera de lo que la persona vio. `enlaces` solo sirve a la pantalla (nombres y
 * incidencias como enlaces) y no se exporta.
 */
export interface TablaInforme {
  tipo: TipoInforme
  /** Periodo que cubre, como texto (`2026-10-17 a 2026-10-23`). */
  periodo: string
  columnas: string[]
  filas: Array<Array<string | number>>
  /** Opcional; si existe, trae un elemento por fila de `filas`. */
  enlaces?: EnlacesDeFila[]
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
