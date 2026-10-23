// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { ExportadorExcelExceljs } from '../../utilidades/exportacion/ExportadorExcelExceljs'

/**
 * Prueba de humo de ExcelJS (T-1.5): genera un archivo y lo vuelve a leer para comprobar
 * que el contenido es un `.xlsx` válido con la fila DEMO, las columnas y los datos.
 */
describe('ExportadorExcelExceljs', () => {
  it('genera un .xlsx válido con la fila DEMO, las columnas y las filas', async () => {
    const exportador = new ExportadorExcelExceljs()
    const contenido = await exportador.generar({
      nombreHoja: 'Prueba',
      filaDemo: 'DEMO — datos de demostración, sin validez',
      columnas: ['Trabajador', 'Horas'],
      filas: [['María López', 8]],
    })

    // Un .xlsx es un ZIP: empieza con la firma "PK".
    expect(contenido[0]).toBe(0x50)
    expect(contenido[1]).toBe(0x4b)

    const modulo = await import('exceljs')
    const ExcelJS = modulo.default ?? modulo
    const libro = new ExcelJS.Workbook()
    await libro.xlsx.load(contenido.buffer as ArrayBuffer)
    const hoja = libro.getWorksheet('Prueba')!

    expect(hoja.getCell('A1').value).toBe('DEMO — datos de demostración, sin validez')
    expect(hoja.getCell('A2').value).toBe('Trabajador')
    expect(hoja.getCell('B2').value).toBe('Horas')
    expect(hoja.getCell('A3').value).toBe('María López')
    expect(hoja.getCell('B3').value).toBe(8)
  })
})
