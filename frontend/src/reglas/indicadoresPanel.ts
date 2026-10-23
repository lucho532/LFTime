import type { MunicipioDto } from '../contratos/hospital'
import { TEXTO_ESTADO_VISIBLE, type EstadoVisible } from '../modelos/estadoVisible'
import type { Hospital } from '../modelos/hospital'
import type { FilaPersonalEnVivo } from '../modelos/panel'

/** Indicadores de las tarjetas del panel que llevan a una lista filtrada del personal en tiempo real. */
export type ClaveIndicador = 'enJornada' | 'enAlmuerzo' | 'conRetraso' | 'sinEntrada'

/** Conteos de las tarjetas del panel (HU-01). Se calculan sobre el personal activo. */
export interface IndicadoresPanel extends Record<ClaveIndicador, number> {
  /** Trabajadores activos. */
  total: number
  /** Con al menos una incidencia de hoy sin cerrar. */
  conIncidencias: number
}

const TIPOS_EN_JORNADA = ['ENTRADA', 'REGRESO_ALMUERZO']
const sinEntradaAun = (fila: FilaPersonalEnVivo) => !fila.conEntrada && (fila.estado === 'RETRASO' || fila.estado === 'AUSENCIA_APARENTE')

/**
 * Quién cuenta en cada indicador (provisional, P-01, P-02, D37). «En jornada»: última marca de hoy en
 * entrada o regreso de almuerzo; «en almuerzo»: salida a almuerzo. «Con retraso»: entrada posterior a la hora
 * programada (tolerancia de `configuracion`, D1) o su falta pasada esa hora; «sin entrada» es el subconjunto
 * que aún no registra entrada. Solo cuentan los trabajadores activos.
 */
const PERTENENCIA: Record<ClaveIndicador, (fila: FilaPersonalEnVivo) => boolean> = {
  enJornada: (fila) => fila.ultimaMarca !== null && TIPOS_EN_JORNADA.includes(fila.ultimaMarca.tipo),
  enAlmuerzo: (fila) => fila.ultimaMarca?.tipo === 'SALIDA_ALMUERZO',
  conRetraso: (fila) => sinEntradaAun(fila) || fila.minutosRetrasoEntrada > 0,
  sinEntrada: sinEntradaAun,
}

/** Indica si una fila entra en un indicador; la tabla del panel lo usa para mostrar el detalle de cada tarjeta. */
export function perteneceAIndicador(fila: FilaPersonalEnVivo, clave: ClaveIndicador): boolean {
  return fila.trabajador.estaActivo && PERTENENCIA[clave](fila)
}

/** Texto de cada indicador filtrable, tal como lo ve la persona. */
export const TEXTO_INDICADOR: Record<ClaveIndicador, string> = {
  enJornada: 'En jornada',
  enAlmuerzo: 'En almuerzo',
  conRetraso: 'Con retraso',
  sinEntrada: 'Sin entrada registrada',
}

/** Indica si un texto es una clave de indicador válida (por ejemplo, la que llega por la dirección). */
export function esClaveIndicador(valor: string | null): valor is ClaveIndicador {
  return valor !== null && valor in PERTENENCIA
}

/** Cuenta los indicadores del panel. Función pura: no usa el reloj y no genera consecuencias para las personas. */
export function calcularIndicadores(filas: FilaPersonalEnVivo[]): IndicadoresPanel {
  const cuenta = (clave: ClaveIndicador) => filas.filter((fila) => perteneceAIndicador(fila, clave)).length
  const activos = filas.filter((fila) => fila.trabajador.estaActivo)
  return {
    total: activos.length,
    enJornada: cuenta('enJornada'),
    enAlmuerzo: cuenta('enAlmuerzo'),
    conRetraso: cuenta('conRetraso'),
    sinEntrada: cuenta('sinEntrada'),
    conIncidencias: activos.filter((fila) => fila.incidenciasAbiertas > 0).length,
  }
}

/** Porcentaje entero de `parte` sobre `total`; 0 si no hay total. */
export function porcentaje(parte: number, total: number): number {
  return total === 0 ? 0 : Math.round((parte / total) * 100)
}

/** Asistencia de un hospital hoy: quiénes de los esperados ya registraron su entrada. */
export interface ResumenHospital {
  hospitalId: string
  nombre: string
  municipio: string
  presentes: number
  esperados: number
}

/** Resume por hospital cuántos de los esperados hoy tienen entrada (asistencia por hospital, HU-01). */
export function resumirPorHospital(filas: FilaPersonalEnVivo[], hospitales: Hospital[], municipios: MunicipioDto[]): ResumenHospital[] {
  return hospitales.map((hospital) => {
    const esperados = filas.filter((fila) => fila.trabajador.hospitalId === hospital.id && fila.esperadoHoy)
    return {
      hospitalId: hospital.id,
      nombre: hospital.nombre,
      municipio: municipios.find((m) => m.id === hospital.municipioId)?.nombre ?? '',
      presentes: esperados.filter((fila) => fila.conEntrada).length,
      esperados: esperados.length,
    }
  })
}

/** Tiempo efectivo programado del día frente al registrado hasta ahora (parcial), en minutos. */
export interface HorasDelDia {
  programadasMinutos: number
  registradasMinutos: number
  /** Registradas menos programadas; negativa mientras el día está en curso. No es un incumplimiento. */
  diferenciaMinutos: number
}

/**
 * Suma el efectivo programado y el registrado hasta ahora de quienes se esperan hoy (D21: no mezcla el
 * almuerzo). El registrado es parcial mientras haya jornadas abiertas (ver `calcularEfectivoHastaAhora`).
 */
export function calcularHorasDelDia(filas: FilaPersonalEnVivo[]): HorasDelDia {
  const esperados = filas.filter((fila) => fila.esperadoHoy)
  const programadasMinutos = esperados.reduce((suma, fila) => suma + fila.efectivoProgramadoMinutos, 0)
  const registradasMinutos = esperados.reduce((suma, fila) => suma + (fila.efectivoMinutos ?? 0), 0)
  return { programadasMinutos, registradasMinutos, diferenciaMinutos: registradasMinutos - programadasMinutos }
}

/** Clave de un grupo del gráfico de estados: un estado del catálogo o «sin turno hoy». */
export type ClaveEstadoPersonal = EstadoVisible | 'SIN_TURNO'

export interface GrupoEstadoPersonal {
  clave: ClaveEstadoPersonal
  texto: string
  cantidad: number
}

const ORDEN_ESTADOS: ClaveEstadoPersonal[] = [
  'EN_JORNADA', 'EN_ALMUERZO', 'RETRASO', 'ALMUERZO_PROLONGADO', 'SIN_REGISTRAR', 'AUSENCIA_APARENTE', 'SALIDA_ANTICIPADA',
  'INCIDENCIA', 'FINALIZADA', 'SIN_TURNO', 'INACTIVO', 'VACACIONES', 'INCAPACIDAD', 'LICENCIA',
]

/** Agrupa a todo el personal por su estado visible; quien hoy no tiene nada esperado queda en «Sin turno por ahora». */
export function agruparPorEstado(filas: FilaPersonalEnVivo[]): GrupoEstadoPersonal[] {
  const cuenta = new Map<ClaveEstadoPersonal, number>()
  for (const fila of filas) {
    const clave = fila.estado ?? 'SIN_TURNO'
    cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1)
  }
  return ORDEN_ESTADOS.filter((clave) => cuenta.has(clave)).map((clave) => ({
    clave,
    texto: clave === 'SIN_TURNO' ? 'Sin turno por ahora' : TEXTO_ESTADO_VISIBLE[clave],
    cantidad: cuenta.get(clave) ?? 0,
  }))
}

/** Duración media de los almuerzos completos de hoy frente al autorizado. */
export interface PromedioAlmuerzo {
  almuerzosCompletos: number
  promedioMinutos: number
  autorizadoMinutos: number
  /** Verdadero si el promedio no supera el autorizado más la tolerancia de almuerzo. */
  dentroDeLoAutorizado: boolean
}

/** Promedia los almuerzos completos (salida y regreso) de hoy; `null` si aún no hay ninguno. */
export function calcularPromedioAlmuerzo(filas: FilaPersonalEnVivo[], toleranciaMinutos: number): PromedioAlmuerzo | null {
  const completos = filas.filter((fila) => fila.almuerzoMinutos !== null && fila.almuerzoAutorizadoMinutos !== null)
  if (completos.length === 0) {
    return null
  }
  const promedio = (valores: number[]) => Math.round(valores.reduce((suma, valor) => suma + valor, 0) / valores.length)
  const promedioMinutos = promedio(completos.map((fila) => fila.almuerzoMinutos ?? 0))
  const autorizadoMinutos = promedio(completos.map((fila) => fila.almuerzoAutorizadoMinutos ?? 0))
  return {
    almuerzosCompletos: completos.length,
    promedioMinutos,
    autorizadoMinutos,
    dentroDeLoAutorizado: promedioMinutos <= autorizadoMinutos + toleranciaMinutos,
  }
}
