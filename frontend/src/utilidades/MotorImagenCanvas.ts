import type { MotorImagen } from './comprimirFoto'

function aBlob(lienzo: HTMLCanvasElement, tipo: string, calidad: number): Promise<Blob | null> {
  return new Promise((resolver) => lienzo.toBlob(resolver, tipo, calidad))
}

/**
 * Motor de imagen real: usa `createImageBitmap` y un `canvas` del navegador para reducir la imagen.
 * Intenta WebP y, si el navegador no lo genera, JPEG. Pinta un fondo blanco para que las imágenes
 * con transparencia no queden negras. Lanza un error si la imagen está dañada.
 *
 * Solo funciona en un navegador real: las pruebas automáticas usan un motor simulado.
 */
export class MotorImagenCanvas implements MotorImagen {
  async redimensionar(archivo: Blob, ladoMaximo: number, calidad: number): Promise<Blob> {
    const imagen = await createImageBitmap(archivo)
    try {
      const escala = Math.min(1, ladoMaximo / Math.max(imagen.width, imagen.height))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.max(1, Math.round(imagen.width * escala))
      lienzo.height = Math.max(1, Math.round(imagen.height * escala))
      const contexto = lienzo.getContext('2d')
      if (!contexto) {
        throw new Error('El navegador no permite procesar imágenes.')
      }
      contexto.fillStyle = '#ffffff'
      contexto.fillRect(0, 0, lienzo.width, lienzo.height)
      contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
      const webp = await aBlob(lienzo, 'image/webp', calidad)
      const resultado = webp?.type === 'image/webp' ? webp : await aBlob(lienzo, 'image/jpeg', calidad)
      if (!resultado) {
        throw new Error('No se pudo generar la imagen reducida.')
      }
      return resultado
    } finally {
      imagen.close()
    }
  }
}
