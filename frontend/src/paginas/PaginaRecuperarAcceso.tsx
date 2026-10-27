import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../estilos/paginas/PaginaRecuperarAcceso.css'
import { AvisoModoDemo } from '../componentes/disposicion/AvisoModoDemo'
import { LogoLFTime } from '../componentes/iconos/LogoLFTime'
import { FormularioNuevaContrasena } from '../componentes/ingreso/FormularioNuevaContrasena'
import { FormularioSolicitudRecuperacion } from '../componentes/ingreso/FormularioSolicitudRecuperacion'
import { CajaMovil } from '../componentes/movil/CajaMovil'
import { useRecuperacionAcceso } from '../hooks/useRecuperacionAcceso'

interface PropiedadesPaginaRecuperarAcceso {
  /** `solicitud` pide el correo; `nueva` es la pantalla a la que llega el enlace del correo. */
  paso: 'solicitud' | 'nueva'
}

/**
 * Pantallas de recuperación de acceso: pedir el enlace por correo y crear la contraseña nueva. En la
 * demostración no se envía ningún correo ni se cambia ninguna contraseña, y la pantalla lo dice; en la Fase 2 el
 * backend envía el correo con Brevo. No muestra datos de usuarios ni revela si un correo tiene cuenta.
 */
export function PaginaRecuperarAcceso({ paso }: PropiedadesPaginaRecuperarAcceso) {
  const { enviando, solicitarEnlace, restablecer } = useRecuperacionAcceso()
  const [terminado, setTerminado] = useState(false)

  return (
    <div className="pagina-recuperar">
      <AvisoModoDemo compacto />
      <main className="pagina-recuperar__contenido">
        <LogoLFTime variante="claro" lema={null} tamano={48} />
        <section className="pagina-recuperar__tarjeta" aria-labelledby="titulo-recuperar">
          {paso === 'solicitud' && !terminado && (
            <>
              <h1 id="titulo-recuperar">¿Olvidaste tu contraseña?</h1>
              <p>Escribe tu correo electrónico y te enviaremos un enlace para crear una contraseña nueva.</p>
              <FormularioSolicitudRecuperacion onSolicitar={solicitarEnlace} onSolicitado={() => setTerminado(true)} enviando={enviando} />
            </>
          )}
          {paso === 'solicitud' && terminado && (
            <>
              <h1 id="titulo-recuperar">Revisa tu correo</h1>
              <p>Si el correo está registrado, recibirás un enlace para crear una contraseña nueva.</p>
              <CajaMovil tono="ambar" icono="info" titulo="Demostración: no se envió ningún correo.">
                El envío con Brevo se hará desde el backend en la Fase 2.
              </CajaMovil>
              <Link className="pagina-recuperar__enlace" to="/restablecer-contrasena">
                Ver la pantalla del enlace (demostración)
              </Link>
            </>
          )}
          {paso === 'nueva' && !terminado && (
            <>
              <h1 id="titulo-recuperar">Crea tu contraseña nueva</h1>
              <p>Escribe la contraseña nueva y confírmala.</p>
              <FormularioNuevaContrasena onGuardar={(nueva, confirmacion) => restablecer('demo', nueva, confirmacion)} onGuardada={() => setTerminado(true)} enviando={enviando} />
            </>
          )}
          {paso === 'nueva' && terminado && (
            <>
              <h1 id="titulo-recuperar">Contraseña lista</h1>
              <CajaMovil tono="ambar" icono="info" titulo="Demostración: no se cambió ninguna contraseña.">
                En la demostración no hay contraseñas guardadas. En la versión final podrás ingresar con la nueva.
              </CajaMovil>
            </>
          )}
          <Link className="pagina-recuperar__enlace" to="/ingreso">
            Volver a iniciar sesión
          </Link>
        </section>
      </main>
    </div>
  )
}
