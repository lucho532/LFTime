import type { ArchivoExportado } from './prepararArchivo'

/**
 * Entrega un archivo al navegador para que la persona lo guarde: crea una dirección temporal, simula el
 * clic en un enlace de descarga y la libera. Solo existe en el navegador; no genera contenido.
 */
export function descargarArchivo(archivo: ArchivoExportado): void {
  const direccion = URL.createObjectURL(new Blob([archivo.contenido as BlobPart], { type: archivo.tipoMime }))
  const enlace = document.createElement('a')
  enlace.href = direccion
  enlace.download = archivo.nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(direccion)
}
