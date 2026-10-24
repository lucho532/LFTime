import { beforeEach, describe, expect, it } from 'vitest'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { construirInforme } from '../../reglas/informes/construirInforme'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

describe('detalle de la diferencia con lo programado', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:30:00Z'))
  })

  it('en toda jornada completa los aportes de entrada, almuerzo y salida suman exactamente la diferencia', async () => {
    const datos = await servicios.informes.obtenerDatos()
    const tabla = construirInforme('ASISTENCIA_DIARIA', datos, { trabajadorId: '', hospitalId: '', municipioId: '', soloConIncidencias: false, desde: '2026-10-17', hasta: '2026-10-23' })
    const detalles = tabla.enlaces!.flatMap((e) => (e.diferencia ? [e.diferencia] : []))
    expect(detalles.length).toBeGreaterThan(10)
    for (const detalle of detalles) {
      expect(detalle.aportes.map((a) => a.concepto)).toEqual(['Entrada', 'Almuerzo', 'Salida'])
      expect(detalle.aportes.reduce((suma, a) => suma + a.aporteMinutos, 0)).toBe(detalle.diferenciaMinutos)
    }
  })

  it('una jornada incompleta no tiene detalle (no se estima, D16) y coincide con «Incompleto» en la tabla', async () => {
    const datos = await servicios.informes.obtenerDatos()
    const tabla = construirInforme('ASISTENCIA_DIARIA', datos, { trabajadorId: '', hospitalId: '', municipioId: '', soloConIncidencias: false, desde: '2026-10-17', hasta: '2026-10-23' })
    const columna = tabla.columnas.indexOf('Diferencia con lo programado')
    tabla.filas.forEach((fila, i) => {
      const completa = fila[columna] !== 'Incompleto' && fila[columna] !== '—'
      expect(Boolean(tabla.enlaces![i].diferencia)).toBe(completa)
    })
  })
})

describe('acumulado mensual', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:30:00Z'))
  })

  it('suma la diferencia de las jornadas completas por trabajador y mes, y pone primero a quien más debe', async () => {
    const datos = await servicios.informes.obtenerDatos()
    const filtros = { trabajadorId: '', hospitalId: '', municipioId: '', soloConIncidencias: false, desde: '2026-10-01', hasta: '2026-10-23' }
    const acumulado = construirInforme('ACUMULADO_MENSUAL', datos, filtros)
    const diario = construirInforme('ASISTENCIA_DIARIA', datos, filtros)
    expect(acumulado.columnas).toContain('Diferencia acumulada')
    // Cada trabajador aparece una vez por mes.
    const claves = acumulado.filas.map((fila) => `${fila[0]}|${fila[1]}`)
    expect(new Set(claves).size).toBe(claves.length)
    // La suma de los desgloses diarios de un trabajador coincide con su acumulado.
    const total = (nombre: string) => diario.enlaces!.reduce((suma, e, i) => suma + (diario.filas[i][1] === nombre ? (e.diferencia?.diferenciaMinutos ?? 0) : 0), 0)
    const fila = acumulado.filas.find((f) => f[3] === 'Debe tiempo')!
    const texto = String(fila[2])
    const minutos = (texto.startsWith('−') ? -1 : 1) * (/(\d+) h/.exec(texto) ? Number(/(\d+) h/.exec(texto)![1]) * 60 : 0) + (texto.startsWith('−') ? -1 : 1) * Number(/(\d+) min/.exec(texto)![1])
    expect(minutos).toBe(total(String(fila[1])))
    // Quien más debe va primero dentro del mes: ninguna fila «A favor» o «Al día» precede a una que «Debe tiempo».
    const situaciones = acumulado.filas.filter((f) => f[0] === acumulado.filas[0][0]).map((f) => f[3])
    expect(situaciones.lastIndexOf('Debe tiempo')).toBeLessThan(situaciones.findIndex((x) => x === 'A favor' || x === 'Al día') === -1 ? Infinity : situaciones.findIndex((x) => x === 'A favor' || x === 'Al día'))
  })
})

describe('tiempo por reponer', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:30:00Z'))
  })

  it('lista solo a quien debe, y los aportes de entrada, almuerzo y salida suman lo que debe', async () => {
    const datos = await servicios.informes.obtenerDatos()
    const filtros = { trabajadorId: '', hospitalId: '', municipioId: '', soloConIncidencias: false, desde: '2026-10-01', hasta: '2026-10-23' }
    const tabla = construirInforme('TIEMPO_DEBIDO', datos, filtros)
    expect(tabla.filas.length).toBeGreaterThan(0)
    tabla.enlaces!.forEach((enlace, i) => {
      const dias = enlace.dias!
      const total = dias.reduce((suma, d) => suma + d.totalMinutos, 0)
      expect(total).toBeLessThan(0)
      expect(String(tabla.filas[i][1]).startsWith('−')).toBe(true)
      for (const dia of dias) {
        expect(dia.entradaMinutos + dia.almuerzoMinutos + dia.salidaMinutos).toBe(dia.totalMinutos)
      }
      const porConcepto = dias.reduce((suma, d) => suma + d.entradaMinutos + d.almuerzoMinutos + d.salidaMinutos, 0)
      expect(porConcepto).toBe(total)
    })
    // Debe en el informe quien aparece «Debe tiempo» en el acumulado del periodo.
    const acumulado = construirInforme('ACUMULADO_MENSUAL', datos, filtros)
    const deudoresDelAcumulado = new Set(acumulado.filas.filter((f) => f[3] === 'Debe tiempo').map((f) => f[1]))
    expect(new Set(tabla.filas.map((f) => f[0]))).toEqual(deudoresDelAcumulado)
  })
})
