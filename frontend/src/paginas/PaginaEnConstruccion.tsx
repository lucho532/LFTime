import '../estilos/paginas/PaginaEnConstruccion.css'

interface PropiedadesPaginaEnConstruccion {
  titulo: string
}

/**
 * Página provisional de una ruta que aún no tiene su pantalla definitiva.
 *
 * Representa un marcador de posición del andamiaje (hito 1). Cada ruta la reemplaza por su
 * página real en su hito; no debe contener lógica ni datos.
 */
export function PaginaEnConstruccion({ titulo }: PropiedadesPaginaEnConstruccion) {
  return (
    <section className="pagina-en-construccion">
      <h1>{titulo}</h1>
      <p>Esta pantalla se construirá en un hito posterior.</p>
    </section>
  )
}
