/**
 * Contrato del generador de archivos Excel (`.xlsx`).
 *
 * Representa la única puerta de entrada a la librería de Excel: ningún otro módulo debe
 * importar `exceljs` (decisión D34). Su responsabilidad es describir qué se necesita,
 * sin exponer detalles de la librería.
 *
 * No decide el contenido de los informes ni el nombre del archivo.
 */

/** Hoja de un libro de Excel con una fila de encabezado de demostración y una tabla. */
export interface HojaExportacion {
  nombreHoja: string
  /** Texto de la primera fila (marca DEMO), combinada sobre el ancho de la tabla. */
  filaDemo: string
  columnas: string[]
  filas: Array<Array<string | number>>
}

export interface IExportadorExcel {
  /** Genera el contenido de un archivo `.xlsx` con la hoja indicada. */
  generar(hoja: HojaExportacion): Promise<Uint8Array>
}
