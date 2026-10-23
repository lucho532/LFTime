/** Texto de la primera fila de todo archivo exportado en la demostración (D36). */
export const TEXTO_DEMO = 'DEMO — datos de demostración, sin validez'

const PREFIJOS_DE_FORMULA = ['=', '+', '-', '@', '\t', '\r']

/**
 * Prepara el texto de una celda para CSV: si empieza por un carácter que una hoja de cálculo tomaría por
 * fórmula, antepone un apóstrofo; y lo entrecomilla si contiene coma, comillas o saltos de línea.
 */
function celdaCsv(valor: string | number): string {
  const texto = typeof valor === 'number' ? String(valor) : valor
  const seguro = typeof valor === 'string' && PREFIJOS_DE_FORMULA.some((prefijo) => texto.startsWith(prefijo)) ? `'${texto}` : texto
  return /[",\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro
}

/**
 * Genera el texto de un CSV: la fila DEMO, la fila de columnas y los datos, separados por saltos de línea
 * `\r\n`. En la primera línea va la marca DEMO y no la cabecera: las herramientas que esperen cabecera en la
 * primera línea deben saltarla (formato provisional, ver `contratos-preliminares.md` §7). No escribe archivos.
 */
export function generarCsv(columnas: string[], filas: Array<Array<string | number>>): string {
  return [[TEXTO_DEMO], columnas, ...filas].map((fila) => fila.map(celdaCsv).join(',')).join('\r\n') + '\r\n'
}
