/**
 * Utilidades de texto para búsquedas.
 *
 * Su responsabilidad es normalizar cadenas para comparar sin distinguir mayúsculas ni tildes.
 * No conoce las entidades del negocio.
 */

/** Pasa a minúsculas, quita tildes y recorta espacios: «Pérez » y «perez» se consideran iguales. */
export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** Indica si `texto` contiene `busqueda` ignorando mayúsculas y tildes. Una búsqueda vacía siempre coincide. */
export function contieneTexto(texto: string, busqueda: string): boolean {
  const buscado = normalizarTexto(busqueda)
  return buscado === '' || normalizarTexto(texto).includes(buscado)
}
