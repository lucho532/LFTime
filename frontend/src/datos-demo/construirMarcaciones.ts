import type { AsignacionHorarioDto } from '../contratos/horario'
import type { HospitalDto } from '../contratos/hospital'
import type { MarcacionDto, TipoMarcacion, UbicacionDto } from '../contratos/marcacion'
import { aInstanteUtc } from '../utilidades/horaColombia'
import { minutosEntre } from '../utilidades/horas'
import { enteroEntre, type Generador } from './generadorAleatorio'
import type { PlanDia } from './escenarios'

const METROS_POR_GRADO = 111_320

const SUFIJO_TIPO: Record<TipoMarcacion, string> = {
  ENTRADA: 'ent',
  SALIDA_ALMUERZO: 'sal-alm',
  REGRESO_ALMUERZO: 'reg-alm',
  SALIDA_FINAL: 'sal-fin',
}

/** Suma minutos a un instante y devuelve otro instante. */
export function sumarMinutos(instante: Date, minutos: number): Date {
  return new Date(instante.getTime() + minutos * 60_000)
}

/**
 * Ubicación ficticia a `metros` del centro del hospital (hacia el norte-este), con una precisión
 * de GPS verosímil. Solo se usa en datos de demostración; la validación real no vive aquí.
 */
export function ubicacionA(hospital: HospitalDto, metros: number, precisionMetros: number): UbicacionDto {
  const centro = hospital.coordenadas
  if (!centro) {
    throw new Error(`El hospital ${hospital.id} no tiene coordenadas; no puede tener marcaciones.`)
  }
  const desplazamientoGrados = metros / Math.SQRT2 / METROS_POR_GRADO
  return {
    latitud: Number((centro.latitud + desplazamientoGrados).toFixed(6)),
    longitud: Number((centro.longitud + desplazamientoGrados / Math.cos((centro.latitud * Math.PI) / 180)).toFixed(6)),
    precisionMetros,
  }
}

/** Datos necesarios para generar las marcaciones de una jornada. */
export interface EntradaMarcacionesDia {
  trabajadorId: string
  hospital: HospitalDto
  horario: AsignacionHorarioDto
  fechaOperativa: string
  plan: PlanDia
  generador: Generador
}

/** Instantes de referencia de un día laboral según el horario: inicio, duración y apertura de la ventana de almuerzo. */
export function instantesBase(horario: AsignacionHorarioDto, fechaOperativa: string) {
  const inicio = aInstanteUtc(fechaOperativa, horario.horaEntrada)
  const duracionMinutos = minutosEntre(horario.horaEntrada, horario.horaSalida)
  const ventanaMinutos = minutosEntre(horario.horaEntrada, horario.ventanaAlmuerzoDesde)
  return { inicio, duracionMinutos, inicioVentana: sumarMinutos(inicio, ventanaMinutos) }
}

/**
 * Genera las marcaciones válidas de una jornada según su plan (datos de demostración).
 * Devuelve eventos en orden; los que el plan marca como `null` no se generan. Cada marcación
 * lleva una ubicación dentro del radio del hospital. No filtra por la hora actual: eso lo hace
 * quien arma el conjunto de datos.
 */
export function construirMarcacionesDelDia(entrada: EntradaMarcacionesDia): MarcacionDto[] {
  const { trabajadorId, hospital, horario, fechaOperativa, plan, generador } = entrada
  const { inicio, duracionMinutos, inicioVentana } = instantesBase(horario, fechaOperativa)
  const marcaciones: MarcacionDto[] = []

  const agregar = (tipo: TipoMarcacion, instante: Date) => {
    const distancia = enteroEntre(generador, 4, 60)
    marcaciones.push({
      id: `mar-${trabajadorId}-${fechaOperativa}-${SUFIJO_TIPO[tipo]}`,
      trabajadorId,
      hospitalId: hospital.id,
      tipo,
      instante: instante.toISOString(),
      fechaOperativa,
      ubicacion: ubicacionA(hospital, distancia, enteroEntre(generador, 5, 18)),
      distanciaAlHospitalMetros: distancia,
      origen: 'TRABAJADOR',
    })
  }

  if (plan.entrada === null) {
    return marcaciones
  }
  agregar('ENTRADA', sumarMinutos(inicio, plan.entrada))
  if (plan.almuerzoSalida !== null) {
    const salidaAlmuerzo = sumarMinutos(inicioVentana, plan.almuerzoSalida)
    agregar('SALIDA_ALMUERZO', salidaAlmuerzo)
    if (plan.almuerzoDuracion !== null) {
      agregar('REGRESO_ALMUERZO', sumarMinutos(salidaAlmuerzo, plan.almuerzoDuracion))
    }
  }
  if (plan.salida !== null) {
    agregar('SALIDA_FINAL', sumarMinutos(inicio, duracionMinutos + plan.salida))
  }
  return marcaciones
}
