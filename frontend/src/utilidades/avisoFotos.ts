/**
 * Aviso interno de que cambió alguna foto (se subió, se cambió o se retiró), para que todos los avatares
 * visibles la vuelvan a leer. Responsabilidad: notificar y escuchar. No guarda ni lee fotos.
 */

const NOMBRE_EVENTO = 'lftime:fotos-cambiadas'

/** Avisa a quien escuche que las fotos cambiaron. */
export function notificarCambioDeFotos(): void {
  window.dispatchEvent(new Event(NOMBRE_EVENTO))
}

/** Escucha los cambios de fotos. Devuelve la función que deja de escuchar. */
export function escucharCambioDeFotos(alCambiar: () => void): () => void {
  window.addEventListener(NOMBRE_EVENTO, alCambiar)
  return () => window.removeEventListener(NOMBRE_EVENTO, alCambiar)
}
