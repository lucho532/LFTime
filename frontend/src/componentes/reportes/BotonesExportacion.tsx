import '../../estilos/componentes/BotonesExportacion.css'
import type { FormatoExportacion } from '../../utilidades/exportacion/prepararArchivo'
import { Boton } from '../base/Boton'

interface PropiedadesBotonesExportacion {
  /** Formato que se está generando ahora; `null` si ninguno. */
  exportando: FormatoExportacion | null
  deshabilitado: boolean
  nombreUltimo: string | null
  error: string | null
  onExportar: (formato: FormatoExportacion) => void
}

/**
 * Botones para exportar el informe visible a CSV o Excel. Recuerda que los archivos son de demostración
 * (marca DEMO) y avisa del nombre del último archivo generado o del error. No genera archivos: avisa a
 * quien lo usa.
 */
export function BotonesExportacion({ exportando, deshabilitado, nombreUltimo, error, onExportar }: PropiedadesBotonesExportacion) {
  return (
    <div className="botones-exportacion">
      <div className="botones-exportacion__acciones">
        <Boton variante="secundario" disabled={deshabilitado} cargando={exportando === 'csv'} onClick={() => onExportar('csv')}>
          Exportar CSV
        </Boton>
        <Boton variante="secundario" disabled={deshabilitado} cargando={exportando === 'xlsx'} onClick={() => onExportar('xlsx')}>
          Exportar Excel
        </Boton>
      </div>
      <small>Los archivos son de demostración: llevan la marca DEMO en el nombre y en la primera fila, y no tienen validez.</small>
      {nombreUltimo && <p role="status">Archivo generado: {nombreUltimo}</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
