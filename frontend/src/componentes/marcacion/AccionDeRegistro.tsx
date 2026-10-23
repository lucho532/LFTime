import '../../estilos/componentes/AccionDeRegistro.css'
import type { TipoMarcacion } from '../../contratos/marcacion'
import { ACCION_MARCACION } from '../../modelos/etiquetasMarcacion'
import { Boton } from '../base/Boton'

interface PropiedadesAccionDeRegistro {
  /** Único evento que corresponde registrar ahora; `null` si la jornada ya terminó. */
  siguiente: TipoMarcacion | null
  registrando: boolean
  obteniendoUbicacion: boolean
  onMarcar: (tipo: TipoMarcacion) => void
}

/**
 * Muestra solo la acción siguiente permitida de la jornada (HU-05), con un botón grande para el móvil.
 * Mientras se pide la ubicación lo dice con texto. No decide cuál es la siguiente acción ni valida nada.
 */
export function AccionDeRegistro({ siguiente, registrando, obteniendoUbicacion, onMarcar }: PropiedadesAccionDeRegistro) {
  if (siguiente === null) {
    return <p className="accion-registro__fin">Tu jornada de hoy ya está completa: no hay más eventos por registrar.</p>
  }
  return (
    <div className="accion-registro">
      <Boton className="accion-registro__boton" cargando={registrando} onClick={() => onMarcar(siguiente)}>
        {registrando ? (obteniendoUbicacion ? 'Obteniendo tu ubicación…' : 'Registrando…') : ACCION_MARCACION[siguiente]}
      </Boton>
      <p className="accion-registro__ayuda">Se usará la ubicación real de tu dispositivo. Sin ubicación válida no se registra nada.</p>
    </div>
  )
}
