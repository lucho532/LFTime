import { CALIDADES_PRUEBA, LADOS_MAXIMOS_PRUEBA, LIMITE_BYTES_FOTO } from '../configuracion/limitesFotos'
import { validarFormatoFoto, type ArchivoDeFoto } from '../validadores/foto'
import { MotorImagenCanvas } from './MotorImagenCanvas'

/** Reduce una imagen al lado máximo y a la calidad indicados y devuelve la imagen resultante. */
export interface MotorImagen {
  redimensionar(archivo: Blob, ladoMaximo: number, calidad: number): Promise<Blob>
}

/** Motivos por los que una foto no se pudo preparar (formato, compresión o lectura); cada uno lleva su mensaje comprensible. */
export type MotivoFalloFoto = 'FORMATO_NO_ADMITIDO' | 'NO_SE_PUDO_COMPRIMIR' | 'ARCHIVO_NO_LEGIBLE'

/** Resultado de preparar una foto para guardarla: la foto lista (con si se comprimió) o el motivo del fallo y su mensaje. No la guarda. */
export type ResultadoPreparacionFoto =
  | { exito: true; foto: Blob; fueComprimida: boolean }
  | { exito: false; motivo: MotivoFalloFoto; mensaje: string }

const MENSAJE_NO_LEGIBLE = 'No se pudo leer la imagen. Elige otra foto.'
const MENSAJE_NO_COMPRIMIBLE = 'La foto es demasiado pesada y no se pudo reducir a 2 MB. Elige otra foto.'

/**
 * Prepara una foto de perfil para guardarla (D24): valida el formato y, si pesa más de 2 MB, la
 * comprime automáticamente probando tamaños y calidades cada vez menores hasta que cabe. Si ya cabe,
 * la devuelve sin tocar. Nunca devuelve una foto que supere el límite.
 *
 * El motor de imagen es inyectable para las pruebas; el real usa un `canvas` del navegador.
 * No guarda la foto ni decide quién puede subirla.
 */
export async function prepararFoto(archivo: File, motor: MotorImagen = new MotorImagenCanvas()): Promise<ResultadoPreparacionFoto> {
  const errorFormato = validarFormatoFoto(archivo as ArchivoDeFoto)
  if (errorFormato) {
    return { exito: false, motivo: 'FORMATO_NO_ADMITIDO', mensaje: errorFormato }
  }
  if (archivo.size === 0) {
    return { exito: false, motivo: 'ARCHIVO_NO_LEGIBLE', mensaje: MENSAJE_NO_LEGIBLE }
  }
  if (archivo.size <= LIMITE_BYTES_FOTO) {
    return { exito: true, foto: archivo, fueComprimida: false }
  }
  try {
    for (const lado of LADOS_MAXIMOS_PRUEBA) {
      for (const calidad of CALIDADES_PRUEBA) {
        const candidata = await motor.redimensionar(archivo, lado, calidad)
        if (candidata.size > 0 && candidata.size <= LIMITE_BYTES_FOTO) {
          return { exito: true, foto: candidata, fueComprimida: true }
        }
      }
    }
  } catch {
    return { exito: false, motivo: 'ARCHIVO_NO_LEGIBLE', mensaje: MENSAJE_NO_LEGIBLE }
  }
  return { exito: false, motivo: 'NO_SE_PUDO_COMPRIMIR', mensaje: MENSAJE_NO_COMPRIMIBLE }
}
