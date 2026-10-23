import type { HojaExportacion, IExportadorExcel } from './IExportadorExcel'

/**
 * Implementación de `IExportadorExcel` con ExcelJS.
 *
 * Representa el único lugar donde se usa `exceljs`. La librería se carga con `import()`
 * dinámico solo al exportar, porque es pesada y no debe formar parte de la carga inicial.
 *
 * No debe conocer los informes de negocio ni leer datos de la aplicación.
 */
export class ExportadorExcelExceljs implements IExportadorExcel {
  async generar(hoja: HojaExportacion): Promise<Uint8Array> {
    const modulo = await import('exceljs')
    const ExcelJS = modulo.default ?? modulo
    const libro = new ExcelJS.Workbook()
    const hojaExcel = libro.addWorksheet(hoja.nombreHoja)

    hojaExcel.addRow([hoja.filaDemo])
    hojaExcel.mergeCells(1, 1, 1, Math.max(hoja.columnas.length, 1))
    hojaExcel.getRow(1).font = { bold: true, color: { argb: 'FF6B4E00' } }
    hojaExcel.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF4CC' } }

    hojaExcel.addRow(hoja.columnas).font = { bold: true }
    for (const fila of hoja.filas) {
      hojaExcel.addRow(fila)
    }

    const contenido = await libro.xlsx.writeBuffer()
    return new Uint8Array(contenido as ArrayBuffer)
  }
}
