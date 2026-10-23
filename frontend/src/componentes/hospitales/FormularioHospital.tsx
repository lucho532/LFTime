import { useState, type FormEvent } from 'react'
import '../../estilos/componentes/FormularioHospital.css'
import type { MunicipioDto } from '../../contratos/hospital'
import type { DatosHospital } from '../../modelos/hospital'
import { validarDatosHospital, type ErroresHospital } from '../../validadores/hospital'
import { Aviso } from '../base/Aviso'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'
import { Selector } from '../base/Selector'

interface PropiedadesFormularioHospital {
  inicial?: DatosHospital
  municipios: MunicipioDto[]
  /** Guarda los datos. Si lanza un error, el mensaje se muestra en el formulario. */
  onGuardar: (datos: DatosHospital) => Promise<void>
  onCancelar: () => void
}

const VACIO: DatosHospital = { nombre: '', municipioId: '', direccion: '' }

/**
 * Formulario de alta y edición de un hospital: nombre, municipio y dirección (D12).
 * Valida en la interfaz y muestra todos los errores juntos; la dirección es solo texto y no se
 * convierte en coordenadas (D18). No decide quién puede guardar ni dónde se guarda.
 */
export function FormularioHospital({ inicial = VACIO, municipios, onGuardar, onCancelar }: PropiedadesFormularioHospital) {
  const [datos, setDatos] = useState<DatosHospital>(inicial)
  const [errores, setErrores] = useState<ErroresHospital>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const encontrados = validarDatosHospital(datos)
    setErrores(encontrados)
    setErrorGeneral(null)
    if (Object.keys(encontrados).length > 0) {
      return
    }
    setGuardando(true)
    try {
      await onGuardar(datos)
    } catch (fallo) {
      setErrorGeneral(fallo instanceof Error ? fallo.message : 'No se pudo guardar el hospital.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="formulario-hospital" onSubmit={enviar} noValidate>
      <Campo etiqueta="Nombre del hospital" required value={datos.nombre} error={errores.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
      <Selector
        etiqueta="Municipio"
        required
        textoVacio="Elige un municipio"
        value={datos.municipioId}
        error={errores.municipioId}
        opciones={municipios.map((municipio) => ({ valor: municipio.id, etiqueta: municipio.nombre }))}
        onChange={(e) => setDatos({ ...datos, municipioId: e.target.value })}
      />
      <Campo
        etiqueta="Dirección"
        required
        value={datos.direccion}
        ayuda="Se guarda como texto. Las coordenadas se configuran aparte."
        error={errores.direccion}
        onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
      />
      {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
      <div className="formulario-hospital__acciones">
        <Boton variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={guardando}>
          Guardar hospital
        </Boton>
      </div>
    </form>
  )
}
