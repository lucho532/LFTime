import { Link } from 'react-router-dom'
import '../estilos/paginas/PaginaAccesoRestringido.css'
import { Aviso } from '../componentes/base/Aviso'
import { useSesion } from '../hooks/useSesion'
import { ETIQUETA_ROL } from '../modelos/etiquetasRol'
import { rutaInicialDe } from '../reglas/permisosRuta'

/**
 * Página que explica que el rol actual no tiene esta pantalla. Aclara que el control de acceso
 * de la demostración es solo visual. Responsabilidad: informar y ofrecer volver al inicio.
 */
export function PaginaAccesoRestringido() {
  const { usuario } = useSesion()
  return (
    <section className="pagina-acceso-restringido">
      <h1>Pantalla no disponible para tu rol</h1>
      {usuario && (
        <p>
          Con el rol <strong>{ETIQUETA_ROL[usuario.rol]}</strong> no se muestra esta pantalla.
        </p>
      )}
      <Aviso tipo="info" titulo="Demostración">
        El control de acceso por rol es solo visual y no representa seguridad real: la autorización definitiva la hará el servidor en la versión final.
      </Aviso>
      {usuario && <Link to={rutaInicialDe(usuario.rol)}>Ir a mi pantalla de inicio</Link>}
    </section>
  )
}
