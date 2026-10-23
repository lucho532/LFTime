import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import '../estilos/paginas/PaginaIngreso.css'
import { AvisoModoDemo } from '../componentes/disposicion/AvisoModoDemo'
import { Boton } from '../componentes/base/Boton'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { LogoLFTime } from '../componentes/iconos/LogoLFTime'
import { useSesion } from '../hooks/useSesion'
import { ETIQUETA_ROL } from '../modelos/etiquetasRol'
import type { Usuario } from '../modelos/usuario'
import { puedeAccederARuta, rutaInicialDe } from '../reglas/permisosRuta'
import { servicios } from '../servicios/fabrica'

/**
 * Pantalla de ingreso simulado (D9): lista los usuarios de prueba por rol y permite entrar como
 * cualquiera, sin contraseña. Aclara que no hay seguridad real. Si ya hay sesión, redirige.
 */
export function PaginaIngreso() {
  const { usuario, cargando, ingresar } = useSesion()
  const ubicacion = useLocation()
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    servicios.usuarios.listar().then(setUsuarios, () => setError('No se pudieron cargar los usuarios de prueba.'))
  }, [])

  if (!cargando && usuario) {
    const destino = (ubicacion.state as { desde?: string } | null)?.desde
    return <Navigate to={destino && puedeAccederARuta(usuario.rol, destino) ? destino : rutaInicialDe(usuario.rol)} replace />
  }

  return (
    <div className="pagina-ingreso">
      <AvisoModoDemo />
      <header className="pagina-ingreso__cabecera">
        <LogoLFTime />
      </header>
      <main className="pagina-ingreso__contenido">
        <h1>Ingreso a la demostración</h1>
        <p>Elige un usuario de prueba. No hay contraseñas: esto es solo para revisar las pantallas de cada rol.</p>
        {error && <EstadoError mensaje={error} onReintentar={() => window.location.reload()} />}
        {!error && !usuarios && <EstadoCarga mensaje="Cargando usuarios de prueba…" />}
        {usuarios && (
          <ul className="pagina-ingreso__lista">
            {usuarios.map((elegido) => (
              <li key={elegido.id} className="pagina-ingreso__usuario">
                <div>
                  <strong>{elegido.nombreCompleto}</strong>
                  <span className="pagina-ingreso__rol">{ETIQUETA_ROL[elegido.rol]}</span>
                  <p>{elegido.notaDemo}</p>
                </div>
                <Boton onClick={() => ingresar(elegido.id)} aria-label={`Ingresar como ${elegido.nombreCompleto}, ${ETIQUETA_ROL[elegido.rol]}`}>
                  Ingresar
                </Boton>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
