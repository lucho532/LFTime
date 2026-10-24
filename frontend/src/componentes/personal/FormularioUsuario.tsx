import { useState, type FormEvent } from 'react'
import '../../estilos/componentes/FormularioUsuario.css'
import type { DatosPersonales } from '../../modelos/datosPersonales'
import type { DatosUsuario } from '../../modelos/usuario'
import { validarDatosPersonales, type ErroresDatosPersonales } from '../../validadores/trabajador'
import { Aviso } from '../base/Aviso'
import { Boton } from '../base/Boton'
import { CamposDatosPersonales } from './CamposDatosPersonales'

interface PropiedadesFormularioUsuario {
  inicial: DatosUsuario
  /** Guarda los datos. Si lanza un error, el mensaje se muestra en el formulario. */
  onGuardar: (datos: DatosUsuario) => Promise<void>
  onCancelar: () => void
}

/**
 * Formulario de los datos personales de un administrador o coordinador (P-13): los mismos campos que el
 * trabajador, sin hospital ni estado. Valida en la interfaz y muestra todos los errores juntos. El rol, los
 * hospitales a cargo y la foto no se editan aquí. No decide quién puede guardar.
 */
export function FormularioUsuario({ inicial, onGuardar, onCancelar }: PropiedadesFormularioUsuario) {
  const [datos, setDatos] = useState<DatosUsuario>(inicial)
  const [errores, setErrores] = useState<ErroresDatosPersonales>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const cambiar = (campo: keyof DatosPersonales) => (e: { target: { value: string } }) => setDatos({ ...datos, [campo]: e.target.value })

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const encontrados = validarDatosPersonales(datos)
    setErrores(encontrados)
    setErrorGeneral(null)
    if (Object.keys(encontrados).length > 0) {
      return
    }
    setGuardando(true)
    try {
      await onGuardar(datos)
    } catch (fallo) {
      setErrorGeneral(fallo instanceof Error ? fallo.message : 'No se pudieron guardar los datos.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="formulario-usuario" onSubmit={enviar} noValidate>
      <CamposDatosPersonales datos={datos} errores={errores} onCambiar={cambiar} />
      {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
      <div className="formulario-usuario__acciones">
        <Boton variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={guardando}>
          Guardar datos
        </Boton>
      </div>
    </form>
  )
}
