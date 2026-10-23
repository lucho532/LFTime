import type { MotivoErrorFotos } from '../repositorios/demo/ErrorAlmacenFotos'

/**
 * Mensajes comprensibles para los fallos al guardar una foto (D35). Todos aclaran que la aplicación
 * sigue funcionando sin foto.
 */
const MENSAJES: Record<MotivoErrorFotos, string> = {
  ALMACENAMIENTO_NO_DISPONIBLE: 'Este navegador no permite guardar fotos (por ejemplo, en una ventana privada). Puedes seguir usando la aplicación sin foto.',
  CUOTA_EXCEDIDA: 'El navegador no tiene espacio para guardar más fotos. Libera espacio o restablece la demostración. Puedes seguir usando la aplicación sin foto.',
  LIMITE_DE_FOTOS: 'Se alcanzó el máximo de fotos de esta demostración. Retira alguna foto o restablece la demostración.',
  TAMANO_EXCEDIDO: 'La foto pesa más de 2 MB incluso después de intentar reducirla. Elige otra foto.',
  ERROR_DE_ESCRITURA: 'No se pudo guardar la foto. Inténtalo de nuevo; puedes seguir usando la aplicación sin foto.',
}

/** Mensaje para la persona cuando falla el guardado de una foto. */
export function mensajeDeErrorFoto(motivo: MotivoErrorFotos): string {
  return MENSAJES[motivo]
}
