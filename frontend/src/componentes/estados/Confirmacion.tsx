import '../../estilos/componentes/Confirmacion.css'

interface PropiedadesConfirmacion {
  mensaje: string
  /** Si se entrega, aparece el botón para cerrar el mensaje. */
  onCerrar?: () => void
}

/**
 * Mensaje de confirmación tras completar una acción (por ejemplo, «Hospital guardado»).
 * Se anuncia como estado y lleva el rótulo «Listo» además del color. No cierra solo: lo decide
 * quien lo usa. Nunca debe afirmar que algo se guardó de forma permanente en la demostración.
 */
export function Confirmacion({ mensaje, onCerrar }: PropiedadesConfirmacion) {
  return (
    <div className="confirmacion" role="status">
      <p className="confirmacion__mensaje">
        <strong>Listo.</strong> {mensaje}
      </p>
      {onCerrar && (
        <button type="button" className="confirmacion__cerrar" onClick={onCerrar}>
          Cerrar mensaje
        </button>
      )}
    </div>
  )
}
