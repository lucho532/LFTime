import { useId, useState, type FormEvent } from 'react'
import '../../estilos/componentes/FormularioAccion.css'
import { Boton } from '../base/Boton'
import { CampoEnvoltorio } from '../base/CampoEnvoltorio'
import { Selector, type OpcionSelector } from '../base/Selector'
import { Aviso } from '../base/Aviso'

/** Lo que entrega el formulario al enviarse. */
export interface ValoresAccion {
  texto: string
  motivo: string
  opcion: string
}

interface PropiedadesFormularioAccion {
  titulo: string
  etiquetaTexto: string
  /** Si es verdadero, el texto es obligatorio. */
  textoObligatorio?: boolean
  /** Segundo texto, por ejemplo el motivo de actuar en nombre de otra persona; siempre obligatorio si se muestra. */
  etiquetaMotivo?: string
  /** Lista de opciones (por ejemplo, la resolución); la primera queda elegida. */
  etiquetaOpcion?: string
  opciones?: OpcionSelector[]
  textoBoton: string
  /** Ejecuta la acción. Si lanza un error, su mensaje se muestra en el formulario. */
  onEnviar: (valores: ValoresAccion) => Promise<void>
}

/**
 * Formulario genérico de una acción sobre una incidencia: un texto, un motivo opcional y una lista de
 * opciones opcional. Muestra el error que lance la acción y se vacía al terminar bien. No conoce qué
 * acción es ni valida reglas de negocio: eso lo hace el servicio.
 */
export function FormularioAccion({ titulo, etiquetaTexto, textoObligatorio = true, etiquetaMotivo, etiquetaOpcion, opciones, textoBoton, onEnviar }: PropiedadesFormularioAccion) {
  const id = useId()
  const idMotivo = `${id}-motivo`
  const [texto, setTexto] = useState('')
  const [motivo, setMotivo] = useState('')
  const [opcion, setOpcion] = useState(opciones?.[0]?.valor ?? '')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await onEnviar({ texto, motivo, opcion })
      setTexto('')
      setMotivo('')
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo completar la acción.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario-accion" onSubmit={enviar}>
      <h3 className="formulario-accion__titulo">{titulo}</h3>
      {opciones && etiquetaOpcion && <Selector etiqueta={etiquetaOpcion} opciones={opciones} value={opcion} onChange={(e) => setOpcion(e.target.value)} />}
      <CampoEnvoltorio id={id} etiqueta={etiquetaTexto} obligatorio={textoObligatorio}>
        <textarea id={id} className="campo__control" rows={3} maxLength={1000} required={textoObligatorio} value={texto} onChange={(e) => setTexto(e.target.value)} />
      </CampoEnvoltorio>
      {etiquetaMotivo && (
        <CampoEnvoltorio id={idMotivo} etiqueta={etiquetaMotivo} obligatorio>
          <textarea id={idMotivo} className="campo__control" rows={2} maxLength={1000} required value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </CampoEnvoltorio>
      )}
      {error && <Aviso tipo="error">{error}</Aviso>}
      <Boton type="submit" variante="secundario" cargando={enviando}>
        {textoBoton}
      </Boton>
    </form>
  )
}
