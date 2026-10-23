import '../../estilos/componentes/Paginacion.css'

interface PropiedadesPaginacion {
  paginaActual: number
  totalPaginas: number
  /** Total de elementos (no de páginas). */
  total: number
  /** Posición del primer y del último elemento de la página, empezando en 1. */
  desde: number
  hasta: number
  onCambiarPagina: (pagina: number) => void
}

const PAGINAS_VISIBLES = 5

function paginasAMostrar(actual: number, total: number): number[] {
  const inicio = Math.max(1, Math.min(actual - Math.floor(PAGINAS_VISIBLES / 2), total - PAGINAS_VISIBLES + 1))
  const cantidad = Math.min(PAGINAS_VISIBLES, total)
  return Array.from({ length: cantidad }, (_, indice) => inicio + indice)
}

/**
 * Control de paginación con resumen («Mostrando 1 - 10 de 48») y botones numerados.
 * La página actual se indica con `aria-current` y texto. No calcula la página: la recibe.
 */
export function Paginacion({ paginaActual, totalPaginas, total, desde, hasta, onCambiarPagina }: PropiedadesPaginacion) {
  const resumen = total === 0 ? 'Sin resultados' : `Mostrando ${desde} - ${hasta} de ${total}`
  return (
    <nav className="paginacion" aria-label="Paginación">
      <span className="paginacion__resumen">{resumen}</span>
      {totalPaginas > 1 && (
        <ul className="paginacion__lista">
          <li>
            <button type="button" className="paginacion__boton" onClick={() => onCambiarPagina(paginaActual - 1)} disabled={paginaActual <= 1}>
              Anterior
            </button>
          </li>
          {paginasAMostrar(paginaActual, totalPaginas).map((pagina) => (
            <li key={pagina}>
              <button
                type="button"
                className={`paginacion__boton ${pagina === paginaActual ? 'paginacion__boton--actual' : ''}`.trim()}
                aria-current={pagina === paginaActual ? 'page' : undefined}
                aria-label={`Página ${pagina}`}
                onClick={() => onCambiarPagina(pagina)}
              >
                {pagina}
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="paginacion__boton" onClick={() => onCambiarPagina(paginaActual + 1)} disabled={paginaActual >= totalPaginas}>
              Siguiente
            </button>
          </li>
        </ul>
      )}
    </nav>
  )
}
