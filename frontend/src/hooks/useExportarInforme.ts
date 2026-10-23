import { useState } from 'react'
import type { TablaInforme } from '../modelos/informe'
import { descargarArchivo } from '../utilidades/exportacion/descargarArchivo'
import { prepararArchivo, type FormatoExportacion } from '../utilidades/exportacion/prepararArchivo'
import { hoyColombia } from '../utilidades/horaColombia'

/**
 * Exportación de la tabla de un informe a CSV o Excel (HU-08, D36): genera el archivo con la marca DEMO y
 * lo descarga. Guarda si está exportando, el nombre del último archivo y el mensaje de error. No calcula el
 * informe: recibe la tabla que se muestra.
 */
export function useExportarInforme(tabla: TablaInforme | null) {
  const [exportando, setExportando] = useState<FormatoExportacion | null>(null)
  const [nombreUltimo, setNombreUltimo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const exportar = async (formato: FormatoExportacion) => {
    if (!tabla) return
    setExportando(formato)
    setError(null)
    try {
      const archivo = await prepararArchivo(tabla, formato, hoyColombia())
      descargarArchivo(archivo)
      setNombreUltimo(archivo.nombre)
    } catch {
      setNombreUltimo(null)
      setError('No se pudo generar el archivo. Inténtalo de nuevo.')
    } finally {
      setExportando(null)
    }
  }

  return { exportar, exportando, nombreUltimo, error }
}
