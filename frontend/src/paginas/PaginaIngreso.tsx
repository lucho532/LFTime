import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import '../estilos/paginas/PaginaIngreso.css'
import { AvisoModoDemo } from '../componentes/disposicion/AvisoModoDemo'
import { Boton } from '../componentes/base/Boton'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { LogoLFTime } from '../componentes/iconos/LogoLFTime'
import { FormularioIngreso } from '../componentes/ingreso/FormularioIngreso'
import { CajaMovil } from '../componentes/movil/CajaMovil'
import { useSesion } from '../hooks/useSesion'
import { ETIQUETA_ROL } from '../modelos/etiquetasRol'
import type { Trabajador } from '../modelos/trabajador'
import type { Usuario } from '../modelos/usuario'
import { puedeAccederARuta, rutaInicialDe } from '../reglas/permisosRuta'
import { servicios } from '../servicios/fabrica'
import { buscarUsuarioDeIngreso } from '../utilidades/buscarUsuarioDeIngreso'

/**
 * Pantalla de ingreso simulado (D9) con el diseño móvil: marca, formulario «Iniciar sesión» (usuario o cédula;
 * la contraseña no se valida) y, debajo, los usuarios de prueba por rol para entrar con un toque. Aclara que
 * no hay seguridad real. Si ya hay sesión, redirige.
 */
export function PaginaIngreso() {
  const { usuario, cargando, ingresar } = useSesion()
  const ubicacion = useLocation()
  const [datos, setDatos] = useState<{ usuarios: Usuario[]; trabajadores: Trabajador[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([servicios.usuarios.listar(), servicios.trabajadores.listar()]).then(
      ([usuarios, trabajadores]) => setDatos({ usuarios, trabajadores }),
      () => setError('No se pudieron cargar los usuarios de prueba.'),
    )
  }, [])

  if (!cargando && usuario) {
    const destino = (ubicacion.state as { desde?: string } | null)?.desde
    return <Navigate to={destino && puedeAccederARuta(usuario.rol, destino) ? destino : rutaInicialDe(usuario.rol)} replace />
  }

  async function ingresarConTexto(texto: string): Promise<string | null> {
    const encontrado = datos ? buscarUsuarioDeIngreso(texto, datos.usuarios, datos.trabajadores) : null
    if (!encontrado) {
      return 'No encontramos ese usuario de prueba. Escribe la cédula de uno de los usuarios o elígelo de la lista.'
    }
    await ingresar(encontrado.id)
    return null
  }

  return (
    <div className="pagina-ingreso">
      <AvisoModoDemo />
      <main className="pagina-ingreso__contenido">
        <div className="pagina-ingreso__marca">
          <LogoLFTime variante="claro" lema={null} tamano={64} />
          <p>Tu tiempo, en buenas manos</p>
        </div>
        <section className="pagina-ingreso__tarjeta" aria-labelledby="titulo-ingreso">
          <h1 id="titulo-ingreso">Iniciar sesión</h1>
          <p>Ingresa con la cédula de un usuario de prueba para continuar.</p>
          <FormularioIngreso onIngresar={ingresarConTexto} />
        </section>
        <CajaMovil icono="info" titulo="Esta es una demostración.">
          La autorización por rol es solo visual. No hay contraseñas ni seguridad real.
        </CajaMovil>
        <h2>Usuarios de prueba</h2>
        <p className="pagina-ingreso__ayuda">Elige uno para revisar las pantallas de cada rol.</p>
        {error && <EstadoError mensaje={error} onReintentar={() => window.location.reload()} />}
        {!error && !datos && <EstadoCarga mensaje="Cargando usuarios de prueba…" />}
        {datos && (
          <ul className="pagina-ingreso__lista">
            {datos.usuarios.map((elegido) => (
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
