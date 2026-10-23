import type { EstadoTrabajador } from '../contratos/trabajador'
import type { EstadoVisible } from '../modelos/estadoVisible'
import { instantesDeJornada } from './duraciones'
import { minutosEntreInstantes, sumarMinutosA, type EntradaJornada } from './entradaJornada'
import { esDiaLaborable, resolverTurno } from './turnoProgramado'

const ESTADO_VISIBLE_DEL_TRABAJADOR: Record<Exclude<EstadoTrabajador, 'ACTIVO'>, EstadoVisible> = {
  INACTIVO: 'INACTIVO',
  VACACIONES: 'VACACIONES',
  INCAPACIDAD: 'INCAPACIDAD',
  LICENCIA: 'LICENCIA',
}

/**
 * Estado visible de un trabajador en este momento (catálogo D31), o `null` si hoy no se espera nada de
 * él: sin horario, día no laborable sin marcaciones, la jornada aún no empieza, o el hospital no admite
 * marcar (D25).
 *
 * Reglas provisionales (P-01, P-02, P-20; tolerancias y umbrales de `configuracion`):
 * - Trabajador no activo: su estado de trabajador, sin evaluar nada más.
 * - Sin entrada pasada la hora (más tolerancia): «Retraso»; tras el umbral de ausencia: «Ausencia aparente».
 * - Salió a almuerzo: «En almuerzo»; pasado el almuerzo autorizado más su tolerancia: «Almuerzo prolongado»;
 *   pasado el umbral de regreso: «Sin registrar».
 * - Con entrada o regreso: «En jornada»; pasado el umbral de salida tras el fin del turno: «Sin registrar».
 * - Con salida final: «Finalizada», o «Salida anticipada» si fue antes del fin menos la tolerancia.
 * - `conIncidenciaAbierta` convierte «En jornada», «En almuerzo» y «Finalizada» en «Incidencia».
 *
 * Función pura: no usa el reloj, no crea incidencias ni impone ninguna consecuencia al trabajador.
 */
export function calcularEstadoActual(entrada: EntradaJornada, conIncidenciaAbierta = false): EstadoVisible | null {
  if (entrada.estadoTrabajador !== 'ACTIVO') {
    return ESTADO_VISIBLE_DEL_TRABAJADOR[entrada.estadoTrabajador]
  }
  const { horario, fechaOperativa, marcaciones, ahora, reglas } = entrada
  if (!horario || (!esDiaLaborable(horario, fechaOperativa) && marcaciones.length === 0)) {
    return null
  }
  if (!entrada.hospitalAdmiteMarcacion && marcaciones.length === 0) {
    return null
  }
  const turno = resolverTurno(horario, fechaOperativa)
  const instantes = instantesDeJornada(marcaciones)
  const marcaDeSeguimiento = (estado: EstadoVisible): EstadoVisible =>
    conIncidenciaAbierta && ['EN_JORNADA', 'EN_ALMUERZO', 'FINALIZADA'].includes(estado) ? 'INCIDENCIA' : estado

  if (instantes.salidaFinal) {
    const limiteSalida = sumarMinutosA(turno.fin, -reglas.toleranciaSalidaMinutos)
    return instantes.salidaFinal < limiteSalida ? 'SALIDA_ANTICIPADA' : marcaDeSeguimiento('FINALIZADA')
  }
  if (instantes.salidaAlmuerzo && !instantes.regresoAlmuerzo) {
    const transcurridos = minutosEntreInstantes(instantes.salidaAlmuerzo, ahora)
    const autorizados = turno.almuerzoAutorizadoMinutos
    if (transcurridos >= autorizados + reglas.umbralRegresoSinRegistrarMinutos) return 'SIN_REGISTRAR'
    if (transcurridos > autorizados + reglas.toleranciaAlmuerzoMinutos) return 'ALMUERZO_PROLONGADO'
    return marcaDeSeguimiento('EN_ALMUERZO')
  }
  if (instantes.entrada || instantes.regresoAlmuerzo) {
    const limiteSalida = sumarMinutosA(turno.fin, reglas.umbralSalidaSinRegistrarMinutos)
    return ahora >= limiteSalida ? 'SIN_REGISTRAR' : marcaDeSeguimiento('EN_JORNADA')
  }
  const limiteRetraso = sumarMinutosA(turno.inicio, reglas.toleranciaEntradaMinutos)
  if (ahora <= limiteRetraso) {
    return null
  }
  return ahora >= sumarMinutosA(limiteRetraso, reglas.umbralAusenciaMinutos) ? 'AUSENCIA_APARENTE' : 'RETRASO'
}
