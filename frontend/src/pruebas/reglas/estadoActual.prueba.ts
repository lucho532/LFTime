import { describe, expect, it } from 'vitest'
import { REGLAS_PROVISIONALES_POR_DEFECTO } from '../../configuracion/reglasProvisionales'
import { calcularEstadoActual } from '../../reglas/estadoActual'
import { aInstanteUtc } from '../../utilidades/horaColombia'
import { entradaDePrueba, jornadaCompleta, marca } from '../ayudas/jornadaDePrueba'

const entrada = marca('ENTRADA', '07:00')
const salidaAlmuerzo = marca('SALIDA_ALMUERZO', '12:00')
const regreso = marca('REGRESO_ALMUERZO', '13:00')

describe('calcularEstadoActual (catálogo D31; umbrales provisionales P-01, P-02)', () => {
  it('antes de la hora de entrada no hay estado que mostrar', () => {
    expect(calcularEstadoActual(entradaDePrueba('06:30', []))).toBeNull()
    expect(calcularEstadoActual(entradaDePrueba('07:00', []))).toBeNull()
  })

  it('sin entrada pasada la hora (tolerancia 0, D1) es Retraso', () => {
    expect(calcularEstadoActual(entradaDePrueba('07:01', []))).toBe('RETRASO')
    expect(calcularEstadoActual(entradaDePrueba('07:59', []))).toBe('RETRASO')
  })

  it('sin entrada tras 60 minutos es Ausencia aparente', () => {
    expect(calcularEstadoActual(entradaDePrueba('08:00', []))).toBe('AUSENCIA_APARENTE')
    expect(calcularEstadoActual(entradaDePrueba('11:00', []))).toBe('AUSENCIA_APARENTE')
  })

  it('con entrada está En jornada, también si entró tarde', () => {
    expect(calcularEstadoActual(entradaDePrueba('09:00', [entrada]))).toBe('EN_JORNADA')
    expect(calcularEstadoActual(entradaDePrueba('09:00', [marca('ENTRADA', '07:20')]))).toBe('EN_JORNADA')
  })

  it('en el almuerzo autorizado está En almuerzo; con 0 min de tolerancia, un minuto más es Almuerzo prolongado', () => {
    const marcaciones = [entrada, salidaAlmuerzo]
    expect(calcularEstadoActual(entradaDePrueba('12:30', marcaciones))).toBe('EN_ALMUERZO')
    expect(calcularEstadoActual(entradaDePrueba('13:00', marcaciones))).toBe('EN_ALMUERZO')
    expect(calcularEstadoActual(entradaDePrueba('13:01', marcaciones))).toBe('ALMUERZO_PROLONGADO')
  })

  it('30 minutos después del fin del almuerzo autorizado sin regreso es Sin registrar', () => {
    const marcaciones = [entrada, salidaAlmuerzo]
    expect(calcularEstadoActual(entradaDePrueba('13:29', marcaciones))).toBe('ALMUERZO_PROLONGADO')
    expect(calcularEstadoActual(entradaDePrueba('13:30', marcaciones))).toBe('SIN_REGISTRAR')
  })

  it('la tolerancia de almuerzo retrasa el estado Almuerzo prolongado', () => {
    const reglas = { ...REGLAS_PROVISIONALES_POR_DEFECTO, toleranciaAlmuerzoMinutos: 10 }
    const marcaciones = [entrada, salidaAlmuerzo]
    expect(calcularEstadoActual(entradaDePrueba('13:10', marcaciones, { reglas }))).toBe('EN_ALMUERZO')
    expect(calcularEstadoActual(entradaDePrueba('13:11', marcaciones, { reglas }))).toBe('ALMUERZO_PROLONGADO')
  })

  it('tras el regreso vuelve a En jornada', () => {
    expect(calcularEstadoActual(entradaDePrueba('14:00', [entrada, salidaAlmuerzo, regreso]))).toBe('EN_JORNADA')
  })

  it('60 minutos después del fin del turno sin salida final es Sin registrar', () => {
    const marcaciones = [entrada, salidaAlmuerzo, regreso]
    expect(calcularEstadoActual(entradaDePrueba('16:59', marcaciones))).toBe('EN_JORNADA')
    expect(calcularEstadoActual(entradaDePrueba('17:00', marcaciones))).toBe('SIN_REGISTRAR')
  })

  it('con salida final a su hora está Finalizada', () => {
    expect(calcularEstadoActual(entradaDePrueba('17:00', jornadaCompleta()))).toBe('FINALIZADA')
  })

  it('con salida final antes del fin del turno es Salida anticipada', () => {
    const marcaciones = [entrada, salidaAlmuerzo, regreso, marca('SALIDA_FINAL', '15:40')]
    expect(calcularEstadoActual(entradaDePrueba('17:00', marcaciones))).toBe('SALIDA_ANTICIPADA')
  })

  it('una incidencia abierta convierte En jornada, En almuerzo y Finalizada en Incidencia', () => {
    expect(calcularEstadoActual(entradaDePrueba('09:00', [entrada]), true)).toBe('INCIDENCIA')
    expect(calcularEstadoActual(entradaDePrueba('12:30', [entrada, salidaAlmuerzo]), true)).toBe('INCIDENCIA')
    expect(calcularEstadoActual(entradaDePrueba('17:00', jornadaCompleta()), true)).toBe('INCIDENCIA')
  })

  it('una incidencia abierta no oculta un retraso ni una ausencia', () => {
    expect(calcularEstadoActual(entradaDePrueba('07:30', []), true)).toBe('RETRASO')
    expect(calcularEstadoActual(entradaDePrueba('09:00', []), true)).toBe('AUSENCIA_APARENTE')
  })

  it('un trabajador no activo muestra su estado y no se evalúa nada más (P-20)', () => {
    expect(calcularEstadoActual(entradaDePrueba('10:00', [], { estadoTrabajador: 'INACTIVO' }))).toBe('INACTIVO')
    expect(calcularEstadoActual(entradaDePrueba('10:00', [], { estadoTrabajador: 'VACACIONES' }))).toBe('VACACIONES')
    expect(calcularEstadoActual(entradaDePrueba('10:00', [], { estadoTrabajador: 'INCAPACIDAD' }))).toBe('INCAPACIDAD')
    expect(calcularEstadoActual(entradaDePrueba('10:00', [], { estadoTrabajador: 'LICENCIA' }))).toBe('LICENCIA')
  })

  it('sin horario, o en un día no laborable sin marcaciones, no hay estado', () => {
    expect(calcularEstadoActual(entradaDePrueba('10:00', [], { horario: null }))).toBeNull()
    const soloLunes = { ...entradaDePrueba('10:00', []).horario!, diasLaborables: [1] }
    expect(calcularEstadoActual(entradaDePrueba('10:00', [], { horario: soloLunes }))).toBeNull()
  })

  it('en un hospital que no admite marcar, sin marcaciones, no se acusa ausencia (D25)', () => {
    expect(calcularEstadoActual(entradaDePrueba('10:00', [], { hospitalAdmiteMarcacion: false }))).toBeNull()
  })

  it('un turno nocturno se evalúa desde su inicio, después de la medianoche', () => {
    const nocturno = { ...entradaDePrueba('10:00', []).horario!, horaEntrada: '22:00', horaSalida: '06:00' }
    const base = entradaDePrueba('10:00', [], { horario: nocturno })
    // 2026-10-22 00:30 en Colombia: el turno del 21 empezó hace 2,5 h y no hay entrada.
    const ahora = aInstanteUtc('2026-10-22', '00:30')
    expect(calcularEstadoActual({ ...base, ahora })).toBe('AUSENCIA_APARENTE')
  })
})
