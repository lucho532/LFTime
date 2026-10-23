import { describe, expect, it } from 'vitest'
import { REGLAS_PROVISIONALES_POR_DEFECTO } from '../../configuracion/reglasProvisionales'
import { detectarIncidencias } from '../../reglas/detectarIncidencias'
import { aInstanteUtc } from '../../utilidades/horaColombia'
import { entradaDePrueba, FECHA_PRUEBA, jornadaCompleta, marca } from '../ayudas/jornadaDePrueba'

const tipos = (hora: string, marcaciones = jornadaCompleta(), cambios = {}) =>
  detectarIncidencias(entradaDePrueba(hora, marcaciones, cambios)).map((incidencia) => incidencia.tipo)

const entrada = marca('ENTRADA', '07:00')
const salidaAlmuerzo = marca('SALIDA_ALMUERZO', '12:00')
const regreso = marca('REGRESO_ALMUERZO', '13:00')

describe('detectarIncidencias (HU-06; definiciones provisionales P-01, P-02)', () => {
  it('una jornada cumplida no genera ninguna incidencia', () => {
    expect(tipos('17:00')).toEqual([])
  })

  it('ENTRADA_TARDIA: entrada después de la hora (tolerancia 0), detectada al registrarla', () => {
    const marcaciones = [marca('ENTRADA', '07:01'), marca('SALIDA_ALMUERZO', '12:00'), marca('REGRESO_ALMUERZO', '13:00'), marca('SALIDA_FINAL', '16:01')]
    const detectadas = detectarIncidencias(entradaDePrueba('17:00', marcaciones))
    expect(detectadas).toEqual([{ tipo: 'ENTRADA_TARDIA', detectadaEn: aInstanteUtc(FECHA_PRUEBA, '07:01') }])
  })

  it('la tolerancia de entrada evita la incidencia dentro del margen', () => {
    const reglas = { ...REGLAS_PROVISIONALES_POR_DEFECTO, toleranciaEntradaMinutos: 5 }
    const marcaciones = [marca('ENTRADA', '07:05'), salidaAlmuerzo, regreso, marca('SALIDA_FINAL', '16:05')]
    expect(tipos('17:00', marcaciones, { reglas })).toEqual([])
  })

  it('AUSENCIA_APARENTE: sin ninguna marcación, 60 minutos después de la hora de entrada', () => {
    expect(tipos('07:59', [])).toEqual([])
    expect(detectarIncidencias(entradaDePrueba('08:00', []))).toEqual([
      { tipo: 'AUSENCIA_APARENTE', detectadaEn: aInstanteUtc(FECHA_PRUEBA, '08:00') },
    ])
  })

  it('SIN_ENTRADA: hay marcaciones posteriores pero falta la entrada', () => {
    expect(tipos('13:30', [salidaAlmuerzo, regreso])).toEqual(['SIN_ENTRADA'])
  })

  it('SALIDA_ANTICIPADA: salida final antes del fin del turno, y también TIEMPO_INFERIOR', () => {
    const marcaciones = [entrada, salidaAlmuerzo, regreso, marca('SALIDA_FINAL', '15:30')]
    expect(tipos('17:00', marcaciones)).toEqual(['SALIDA_ANTICIPADA', 'TIEMPO_INFERIOR'])
  })

  it('SIN_SALIDA: con entrada y sin salida final, 60 minutos después del fin del turno', () => {
    const marcaciones = [entrada, salidaAlmuerzo, regreso]
    expect(tipos('16:59', marcaciones)).toEqual([])
    expect(detectarIncidencias(entradaDePrueba('17:00', marcaciones))).toEqual([
      { tipo: 'SIN_SALIDA', detectadaEn: aInstanteUtc(FECHA_PRUEBA, '17:00') },
    ])
  })

  it('ALMUERZO_EXCEDIDO: almuerzo completo más largo que el autorizado, detectado al regresar', () => {
    const marcaciones = [entrada, salidaAlmuerzo, marca('REGRESO_ALMUERZO', '13:20'), marca('SALIDA_FINAL', '16:20')]
    expect(detectarIncidencias(entradaDePrueba('17:00', marcaciones))).toEqual([
      { tipo: 'ALMUERZO_EXCEDIDO', detectadaEn: aInstanteUtc(FECHA_PRUEBA, '13:20') },
    ])
  })

  it('un almuerzo de exactamente la duración autorizada no es excedido', () => {
    expect(tipos('17:00')).not.toContain('ALMUERZO_EXCEDIDO')
  })

  it('REGRESO_TARDIO: sin regreso 30 minutos después del fin del almuerzo autorizado', () => {
    const marcaciones = [entrada, salidaAlmuerzo]
    expect(tipos('13:29', marcaciones)).toEqual([])
    expect(tipos('13:30', marcaciones)).toEqual(['REGRESO_TARDIO'])
  })

  it('TIEMPO_INFERIOR: jornada completa con menos tiempo efectivo que el programado', () => {
    const marcaciones = [entrada, salidaAlmuerzo, regreso, marca('SALIDA_FINAL', '15:30')]
    expect(tipos('17:00', marcaciones)).toEqual(['SALIDA_ANTICIPADA', 'TIEMPO_INFERIOR'])
    const sinAnticipada = [marca('ENTRADA', '07:30'), salidaAlmuerzo, regreso, marca('SALIDA_FINAL', '16:00')]
    expect(tipos('17:00', sinAnticipada)).toEqual(['ENTRADA_TARDIA', 'TIEMPO_INFERIOR'])
  })

  it('REGISTRO_INCOMPLETO: falta una marcación intermedia o están fuera de orden', () => {
    expect(tipos('17:00', [entrada, regreso, marca('SALIDA_FINAL', '16:00')])).toEqual(['REGISTRO_INCOMPLETO'])
    const desordenadas = [entrada, marca('SALIDA_ALMUERZO', '13:00'), marca('REGRESO_ALMUERZO', '12:00'), marca('SALIDA_FINAL', '16:00')]
    expect(tipos('17:00', desordenadas)).toContain('REGISTRO_INCOMPLETO')
  })

  it('no detecta lo que aún no puede afirmarse en el instante de evaluación', () => {
    expect(tipos('10:00', [marca('ENTRADA', '07:30')])).toEqual(['ENTRADA_TARDIA'])
    expect(tipos('07:15', [])).toEqual([])
  })

  it('trabajador no activo (P-20), sin horario o en hospital que no admite marcar (D25): nada', () => {
    expect(tipos('12:00', [], { estadoTrabajador: 'VACACIONES' })).toEqual([])
    expect(tipos('12:00', [], { horario: null })).toEqual([])
    expect(tipos('12:00', [], { hospitalAdmiteMarcacion: false })).toEqual([])
  })

  it('nunca entrega consecuencias: solo el tipo y el instante de detección (P-18)', () => {
    const detectadas = detectarIncidencias(entradaDePrueba('17:00', [marca('ENTRADA', '07:40')]))
    expect(detectadas.length).toBeGreaterThan(0)
    for (const incidencia of detectadas) {
      expect(Object.keys(incidencia).sort()).toEqual(['detectadaEn', 'tipo'])
    }
  })
})
