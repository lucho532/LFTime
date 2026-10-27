import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import '../../estilos/componentes/FormularioIngreso.css'
import { Boton } from '../base/Boton'

interface PropiedadesFormularioIngreso {
  /** Intenta entrar con lo escrito; devuelve el motivo si no se pudo o `null` si entró. */
  onIngresar: (usuarioOCedula: string) => Promise<string | null>
}

/**
 * Formulario «Iniciar sesión» del ingreso simulado (D9): usuario o cédula y contraseña. La contraseña **no se
 * valida** en la demostración y el formulario lo dice; sirve solo para parecerse al diseño final. No autentica
 * ni decide a qué usuario corresponde lo escrito: de eso se encarga quien lo usa.
 */
export function FormularioIngreso({ onIngresar }: PropiedadesFormularioIngreso) {
  const idUsuario = useId()
  const idClave = useId()
  const [usuario, setUsuario] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    setError(await onIngresar(usuario))
    setEnviando(false)
  }

  return (
    <form className="formulario-ingreso" onSubmit={enviar} noValidate>
      <label htmlFor={idUsuario}>Usuario o cédula</label>
      <input id={idUsuario} type="text" inputMode="numeric" autoComplete="off" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Ej.: 1.020.304.050" aria-invalid={error ? true : undefined} />
      <label htmlFor={idClave}>Contraseña</label>
      <input id={idClave} type="password" autoComplete="off" placeholder="No se valida en la demostración" />
      <Link className="formulario-ingreso__olvido" to="/recuperar-acceso">
        ¿Olvidaste tu contraseña?
      </Link>
      {error && (
        <p role="alert" className="formulario-ingreso__error">
          {error}
        </p>
      )}
      <Boton type="submit" cargando={enviando}>
        Ingresar
      </Boton>
    </form>
  )
}
