import type { TablaInforme, TipoInforme } from '../../modelos/informe'
import { TEXTO_INFORME } from '../../modelos/informe'
import { generarCsv, TEXTO_DEMO } from './csv'
import { ExportadorExcelExceljs } from './ExportadorExcelExceljs'
import type { IExportadorExcel } from './IExportadorExcel'

/** Formatos de exportación disponibles. */
export type FormatoExportacion = 'csv' | 'xlsx'

/** Archivo listo para descargar. */
export interface ArchivoExportado {
  nombre: string
  tipoMime: string
  contenido: Uint8Array
}

const NOMBRE_EN_ARCHIVO: Record<TipoInforme, string> = {
  ASISTENCIA_DIARIA: 'asistencia_diaria',
  HORAS_POR_TRABAJADOR: 'horas_por_trabajador',
  INCIDENCIAS: 'incidencias',
  INTENTOS_RECHAZADOS: 'intentos_rechazados',
  CUMPLIMIENTO_POR_HOSPITAL: 'cumplimiento_por_hospital',
}

const TIPO_MIME: Record<FormatoExportacion, string> = {
  csv: 'text/csv;charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

/** Marca de orden de bytes UTF-8, para que Excel abra el CSV con las tildes bien. */
const BOM_UTF8 = '﻿'

/**
 * Nombre de un archivo exportado: `DEMO_<informe>_<AAAAMMDD>.<formato>`. La marca DEMO va siempre en el
 * nombre (D36). `fecha` es la de hoy en Colombia con formato `AAAA-MM-DD`.
 */
export function nombreArchivoDemo(tipo: TipoInforme, fecha: string, formato: FormatoExportacion): string {
  return `DEMO_${NOMBRE_EN_ARCHIVO[tipo]}_${fecha.replace(/-/g, '')}.${formato}`
}

/**
 * Convierte la tabla de un informe en el contenido de un archivo CSV o Excel, con la marca DEMO en el nombre
 * y en la primera fila (D36). Exporta exactamente la tabla que se muestra en pantalla. No descarga nada ni
 * conoce cómo se calculó el informe; el generador de Excel se puede sustituir (pruebas).
 */
export async function prepararArchivo(
  tabla: TablaInforme,
  formato: FormatoExportacion,
  fecha: string,
  exportadorExcel: IExportadorExcel = new ExportadorExcelExceljs(),
): Promise<ArchivoExportado> {
  const nombre = nombreArchivoDemo(tabla.tipo, fecha, formato)
  const tipoMime = TIPO_MIME[formato]
  if (formato === 'csv') {
    return { nombre, tipoMime, contenido: new TextEncoder().encode(BOM_UTF8 + generarCsv(tabla.columnas, tabla.filas)) }
  }
  const contenido = await exportadorExcel.generar({
    nombreHoja: TEXTO_INFORME[tabla.tipo],
    filaDemo: TEXTO_DEMO,
    columnas: tabla.columnas,
    filas: tabla.filas,
  })
  return { nombre, tipoMime, contenido }
}
