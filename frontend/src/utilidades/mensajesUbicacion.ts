import type { MotivoFalloUbicacion } from './geolocalizacion'

/**
 * Mensajes comprensibles para cada fallo técnico de ubicación (spec D13, CA-1): dicen qué pasó y
 * cómo corregirlo. El de permiso bloqueado incluye las instrucciones para habilitarlo en el navegador.
 */
const MENSAJES: Record<MotivoFalloUbicacion, string> = {
  PERMISO_DENEGADO:
    'No diste permiso para usar tu ubicación. Pulsa de nuevo el botón y elige «Permitir» cuando el navegador te lo pregunte.',
  PERMISO_BLOQUEADO:
    'El navegador tiene bloqueada la ubicación para este sitio. Para habilitarla: pulsa el icono de candado o de ajustes junto a la dirección, entra en «Configuración del sitio» o «Permisos», cambia «Ubicación» a «Permitir» y vuelve a intentarlo.',
  UBICACION_NO_DISPONIBLE:
    'No se pudo determinar tu ubicación. Comprueba que el GPS o la ubicación del dispositivo estén activados y vuelve a intentarlo.',
  TIEMPO_AGOTADO: 'La ubicación tardó demasiado en responder. Acércate a una ventana o a un lugar abierto y vuelve a intentarlo.',
  CONTEXTO_NO_SEGURO:
    'El navegador solo entrega la ubicación en una conexión segura (https) o en localhost. Abre la aplicación desde una dirección segura.',
}

/** Mensaje para mostrar a la persona cuando falla la obtención de la ubicación. */
export function mensajeDeFalloUbicacion(motivo: MotivoFalloUbicacion): string {
  return MENSAJES[motivo]
}
