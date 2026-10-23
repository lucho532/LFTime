import { useState, type FormEvent } from 'react'
import '../../estilos/componentes/AsignacionCoordinador.css'
import type { Hospital } from '../../modelos/hospital'
import type { Usuario } from '../../modelos/usuario'
import { Aviso } from '../base/Aviso'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'
import { ListaHistorial } from '../base/ListaHistorial'
import { Modal } from '../base/Modal'
import { Selector } from '../base/Selector'

interface PropiedadesAsignacionCoordinador {
  hospital: Hospital
  coordinadores: Usuario[]
  nombreDe: (usuarioId: string) => string
  /** Si es falso, solo se consulta (no aparece el botón de cambio). */
  puedeAsignar: boolean
  /** Cambia el responsable. Si lanza un error, el mensaje se muestra en el diálogo. */
  onAsignar: (coordinadorId: string, motivo: string) => Promise<void>
}

function formatoVigencia(desde: string, hasta?: string): string {
  return hasta ? `Del ${desde} al ${hasta}` : `Desde el ${desde} (vigente)`
}

/**
 * Coordinador responsable principal de un hospital y el historial de sus asignaciones (D28): quién,
 * desde y hasta cuándo, quién asignó y por qué. Un hospital sin responsable se señala y deja sus
 * incidencias pendientes de asignación, visibles para el administrador. Solo el administrador
 * autorizado ve el botón para cambiarlo. Los cambios cierran la vigencia anterior; nada se borra.
 */
export function AsignacionCoordinador({ hospital, coordinadores, nombreDe, puedeAsignar, onAsignar }: PropiedadesAsignacionCoordinador) {
  const [abierto, setAbierto] = useState(false)
  const [coordinadorId, setCoordinadorId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  function cerrar() {
    setAbierto(false)
    setError(null)
    setCoordinadorId('')
    setMotivo('')
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (coordinadorId === '') {
      setError('Elige a la persona que será responsable.')
      return
    }
    setGuardando(true)
    try {
      await onAsignar(coordinadorId, motivo)
      cerrar()
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo cambiar el responsable.')
    } finally {
      setGuardando(false)
    }
  }

  const responsable = hospital.coordinadorResponsableId
  const historial = [...hospital.asignacionesCoordinador].sort((a, b) => b.vigenteDesde.localeCompare(a.vigenteDesde))
  return (
    <div className="asignacion-coordinador">
      {responsable ? (
        <p>
          Responsable principal: <strong>{nombreDe(responsable)}</strong>
        </p>
      ) : (
        <Aviso tipo="advertencia" titulo="Sin responsable">
          Este hospital no tiene coordinador responsable. Sus incidencias quedan pendientes de asignación y son visibles para el administrador.
        </Aviso>
      )}
      {puedeAsignar && (
        <Boton variante="secundario" onClick={() => setAbierto(true)}>
          {responsable ? 'Cambiar coordinador responsable' : 'Asignar coordinador responsable'}
        </Boton>
      )}
      <h3 className="asignacion-coordinador__subtitulo">Historial de asignaciones</h3>
      <ListaHistorial
        textoVacio="Este hospital nunca ha tenido un coordinador responsable."
        elementos={historial.map((asignacion) => ({
          id: asignacion.id,
          contenido: (
            <>
              <strong>{nombreDe(asignacion.coordinadorId)}</strong>
              <span>{formatoVigencia(asignacion.vigenteDesde, asignacion.vigenteHasta)}</span>
              <span>Asignó: {nombreDe(asignacion.asignadoPorUsuarioId)}</span>
              {asignacion.motivo && <span>Motivo: {asignacion.motivo}</span>}
            </>
          ),
        }))}
      />
      <Modal abierto={abierto} titulo="Coordinador responsable" onCerrar={cerrar}>
        <form className="asignacion-coordinador__formulario" onSubmit={enviar} noValidate>
          <Selector
            etiqueta="Coordinador"
            required
            textoVacio="Elige un coordinador"
            value={coordinadorId}
            opciones={coordinadores.map((coordinador) => ({ valor: coordinador.id, etiqueta: coordinador.nombreCompleto }))}
            onChange={(e) => setCoordinadorId(e.target.value)}
          />
          <Campo etiqueta="Motivo (opcional)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <p className="asignacion-coordinador__nota">El cambio rige desde hoy. La asignación anterior se conserva en el historial.</p>
          {error && <Aviso tipo="error">{error}</Aviso>}
          <div className="asignacion-coordinador__acciones">
            <Boton variante="secundario" onClick={cerrar}>
              Cancelar
            </Boton>
            <Boton type="submit" cargando={guardando}>
              Guardar cambio
            </Boton>
          </div>
        </form>
      </Modal>
    </div>
  )
}
