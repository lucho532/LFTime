import { FORMATOS_FOTO } from '../configuracion/limitesFotos'

/** Datos mínimos de un archivo para validar su formato (compatible con `File`). */
export interface ArchivoDeFoto {
  name: string
  type: string
}

export const MENSAJE_FORMATO_NO_ADMITIDO = 'Formato no admitido. Usa una foto JPG, JPEG, PNG o WebP.'

function extensionDe(nombre: string): string {
  const posicion = nombre.lastIndexOf('.')
  return posicion < 0 ? '' : nombre.slice(posicion + 1).toLowerCase()
}

/**
 * Valida el formato de una foto de perfil (D24): JPG, JPEG, PNG o WebP. Devuelve un mensaje de error
 * comprensible o `null` si es válido. El tipo del archivo manda; solo si el navegador no lo informa se
 * usa la extensión. No comprueba el tamaño: una foto grande se comprime (ver `prepararFoto`).
 */
export function validarFormatoFoto(archivo: ArchivoDeFoto): string | null {
  const extension = extensionDe(archivo.name)
  if (archivo.type !== '') {
    const extensionesPermitidas = FORMATOS_FOTO[archivo.type.toLowerCase()]
    return extensionesPermitidas && (extension === '' || extensionesPermitidas.includes(extension)) ? null : MENSAJE_FORMATO_NO_ADMITIDO
  }
  return Object.values(FORMATOS_FOTO).some((extensiones) => extensiones.includes(extension)) ? null : MENSAJE_FORMATO_NO_ADMITIDO
}
