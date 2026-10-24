/**
 * Utilidad única de fechas y horas de LFTime (constitución R-9).
 *
 * Representa la hora de Colombia: UTC−5 fijo, sin horario de verano. Su responsabilidad es
 * entregar "hoy" y "ahora" en hora de Colombia, descomponer instantes UTC y convertir una
 * fecha y hora programadas (hora de Colombia) a un instante UTC.
 *
 * No debe usarse `new Date()` ni reglas de zonas horarias fuera de este archivo. Tampoco
 * decide reglas de negocio (jornadas, tolerancias).
 */

const DESFASE_COLOMBIA_MINUTOS = -5 * 60
const MILISEGUNDOS_POR_MINUTO = 60_000

const DIAS_SEMANA_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** Fecha y hora descompuestas en hora de Colombia. `mes` va de 1 a 12 y `diaSemana` de 0 (domingo) a 6. */
export interface ComponentesColombia {
  anio: number
  mes: number
  dia: number
  hora: number
  minuto: number
  segundo: number
  diaSemana: number
}

let relojActual: () => Date = () => new Date()

/**
 * Sustituye el reloj para las pruebas. Solo debe usarse desde archivos de prueba.
 * Llamar sin argumentos restablece el reloj real.
 */
export function establecerRelojParaPruebas(reloj?: () => Date): void {
  relojActual = reloj ?? (() => new Date())
}

/** Instante actual (UTC). Es el único punto de la aplicación que lee el reloj del sistema. */
export function obtenerAhoraUtc(): Date {
  return relojActual()
}

/** Descompone un instante UTC en sus componentes de hora de Colombia. */
export function descomponerEnColombia(instante: Date): ComponentesColombia {
  const desplazado = new Date(instante.getTime() + DESFASE_COLOMBIA_MINUTOS * MILISEGUNDOS_POR_MINUTO)
  return {
    anio: desplazado.getUTCFullYear(),
    mes: desplazado.getUTCMonth() + 1,
    dia: desplazado.getUTCDate(),
    hora: desplazado.getUTCHours(),
    minuto: desplazado.getUTCMinutes(),
    segundo: desplazado.getUTCSeconds(),
    diaSemana: desplazado.getUTCDay(),
  }
}

function conCeros(valor: number, largo = 2): string {
  return String(valor).padStart(largo, '0')
}

/** Fecha de un instante UTC en Colombia con formato `AAAA-MM-DD`. */
export function fechaColombiaDe(instante: Date): string {
  const { anio, mes, dia } = descomponerEnColombia(instante)
  return `${conCeros(anio, 4)}-${conCeros(mes)}-${conCeros(dia)}`
}

/** Fecha de hoy en Colombia con formato `AAAA-MM-DD`. */
export function hoyColombia(): string {
  return fechaColombiaDe(obtenerAhoraUtc())
}

/** Hora actual en Colombia con formato `HH:mm` (24 horas). */
export function horaActualColombia(): string {
  const { hora, minuto } = descomponerEnColombia(obtenerAhoraUtc())
  return `${conCeros(hora)}:${conCeros(minuto)}`
}

/**
 * Convierte una fecha (`AAAA-MM-DD`) y una hora (`HH:mm`) expresadas en hora de Colombia
 * a su instante UTC. Lanza un error si el formato no es válido.
 */
export function aInstanteUtc(fecha: string, hora: string): Date {
  const coincideFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha)
  const coincideHora = /^(\d{2}):(\d{2})$/.exec(hora)
  if (!coincideFecha || !coincideHora) {
    throw new Error(`Fecha u hora con formato inválido: "${fecha}" "${hora}"`)
  }
  const [, anio, mes, dia] = coincideFecha.map(Number)
  const [, horas, minutos] = coincideHora.map(Number)
  const milisegundos = Date.UTC(anio, mes - 1, dia, horas, minutos) - DESFASE_COLOMBIA_MINUTOS * MILISEGUNDOS_POR_MINUTO
  return new Date(milisegundos)
}

/** Suma (o resta, con valores negativos) días a una fecha `AAAA-MM-DD` y devuelve otra fecha del mismo formato. */
export function sumarDias(fecha: string, dias: number): string {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const resultado = new Date(Date.UTC(anio, mes - 1, dia + dias))
  return `${conCeros(resultado.getUTCFullYear(), 4)}-${conCeros(resultado.getUTCMonth() + 1)}-${conCeros(resultado.getUTCDate())}`
}

/** Formatea la hora de un instante UTC, en hora de Colombia, a 12 horas: `09:42 a. m.`. */
export function formatearHora12(instante: Date): string {
  const { hora, minuto } = descomponerEnColombia(instante)
  const sufijo = hora < 12 ? 'a. m.' : 'p. m.'
  const hora12 = hora % 12 === 0 ? 12 : hora % 12
  return `${conCeros(hora12)}:${conCeros(minuto)} ${sufijo}`
}

/** Formatea la fecha de un instante UTC, en hora de Colombia, como `Lun, 27 Oct 2025`. */
export function formatearFechaCorta(instante: Date): string {
  const { anio, mes, dia, diaSemana } = descomponerEnColombia(instante)
  return `${DIAS_SEMANA_CORTOS[diaSemana]}, ${dia} ${MESES_CORTOS[mes - 1]} ${anio}`
}

/** Formatea la hora de un instante UTC, en hora de Colombia, a 24 horas: `09:41`. */
export function formatearHora24(instante: Date): string {
  const { hora, minuto } = descomponerEnColombia(instante)
  return `${conCeros(hora)}:${conCeros(minuto)}`
}

/** Formatea la fecha de un instante UTC, en hora de Colombia, como `27 de octubre de 2025`. */
export function formatearFechaLarga(instante: Date): string {
  const { anio, mes, dia } = descomponerEnColombia(instante)
  return `${dia} de ${MESES_LARGOS[mes - 1]} de ${anio}`
}

/** Formatea una fecha `AAAA-MM-DD` como `27 oct. 2025` (sin conversión de zona: ya es la fecha de Colombia). */
export function formatearFechaDia(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return `${dia} ${MESES_CORTOS[mes - 1].toLowerCase()}. ${anio}`
}
