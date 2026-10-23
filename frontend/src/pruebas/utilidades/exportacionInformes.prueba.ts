// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { TablaInforme } from '../../modelos/informe'
import { generarCsv, TEXTO_DEMO } from '../../utilidades/exportacion/csv'
import { nombreArchivoDemo, prepararArchivo } from '../../utilidades/exportacion/prepararArchivo'

const TABLA: TablaInforme = {
  tipo: 'HORAS_POR_TRABAJADOR',
  periodo: '2026-10-17 a 2026-10-23',
  columnas: ['Trabajador', 'Horas', 'Observación'],
  filas: [
    ['María López', '8 h 00 min', 'Sin novedad'],
    ['Pérez, Juan "Juancho"', '7 h 30 min', 'Dijo: "ya salgo"\nluego volvió'],
    ['=SUMA(A1)', 5, '—'],
  ],
}

describe('exportación DEMO (D36, T-11.1)', () => {
  it('el nombre lleva la marca DEMO, el informe y la fecha', () => {
    expect(nombreArchivoDemo('ASISTENCIA_DIARIA', '2026-10-23', 'csv')).toBe('DEMO_asistencia_diaria_20261023.csv')
    expect(nombreArchivoDemo('CUMPLIMIENTO_POR_HOSPITAL', '2026-01-05', 'xlsx')).toBe('DEMO_cumplimiento_por_hospital_20260105.xlsx')
  })

  it('el CSV empieza por la fila DEMO, sigue con las columnas y escapa comas, comillas y saltos de línea', () => {
    const lineas = generarCsv(TABLA.columnas, TABLA.filas).split('\r\n')
    // El texto DEMO lleva una coma, por eso va entre comillas: sigue siendo una sola celda.
    expect(lineas[0]).toBe(`"${TEXTO_DEMO}"`)
    expect(lineas[1]).toBe('Trabajador,Horas,Observación')
    expect(lineas[2]).toBe('María López,8 h 00 min,Sin novedad')
    expect(lineas[3]).toBe('"Pérez, Juan ""Juancho""",7 h 30 min,"Dijo: ""ya salgo""\nluego volvió"')
    expect(lineas[4]).toBe("'=SUMA(A1),5,—")
  })

  it('una celda que parece fórmula se neutraliza en el CSV', () => {
    expect(generarCsv(['A'], [['=SUMA(A1)'], ['+1'], ['@x']]).split('\r\n').slice(2, 5)).toEqual(["'=SUMA(A1)", "'+1", "'@x"])
  })

  it('prepara un CSV descargable con BOM UTF-8, tipo y nombre DEMO', async () => {
    const archivo = await prepararArchivo(TABLA, 'csv', '2026-10-23')
    expect(archivo.nombre).toBe('DEMO_horas_por_trabajador_20261023.csv')
    expect(archivo.tipoMime).toContain('text/csv')
    const texto = new TextDecoder('utf-8', { ignoreBOM: true }).decode(archivo.contenido)
    expect(texto.startsWith(`﻿"${TEXTO_DEMO}"`)).toBe(true)
  })

  it('prepara un Excel válido con la fila DEMO, las columnas y las mismas filas que la tabla', async () => {
    const archivo = await prepararArchivo(TABLA, 'xlsx', '2026-10-23')
    expect(archivo.nombre).toBe('DEMO_horas_por_trabajador_20261023.xlsx')
    expect([archivo.contenido[0], archivo.contenido[1]]).toEqual([0x50, 0x4b])

    const modulo = await import('exceljs')
    const ExcelJS = modulo.default ?? modulo
    const libro = new ExcelJS.Workbook()
    await libro.xlsx.load(archivo.contenido.buffer as ArrayBuffer)
    const hoja = libro.getWorksheet('Horas por trabajador')!
    expect(hoja.getCell('A1').value).toBe(TEXTO_DEMO)
    expect(hoja.getRow(2).values).toEqual([undefined, ...TABLA.columnas])
    TABLA.filas.forEach((fila, i) => expect(hoja.getRow(i + 3).values).toEqual([undefined, ...fila]))
  })
})
