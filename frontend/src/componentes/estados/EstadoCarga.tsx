import '../../estilos/componentes/EstadoCarga.css'

interface PropiedadesEstadoCarga {
  mensaje?: string
}

/**
 * Indicador de que se están cargando datos. Se anuncia a lectores de pantalla como estado
 * (`role="status"`). No sabe qué se carga ni cuánto falta.
 */
export function EstadoCarga({ mensaje = 'Cargando…' }: PropiedadesEstadoCarga) {
  return (
    <div className="estado-carga" role="status" aria-live="polite">
      <span className="estado-carga__rueda" aria-hidden="true" />
      <span>{mensaje}</span>
    </div>
  )
}
