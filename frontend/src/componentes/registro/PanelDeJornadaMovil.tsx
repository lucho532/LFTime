import '../../estilos/componentes/PanelDeJornadaMovil.css'
import type { MarcacionDto, TipoMarcacion } from '../../contratos/marcacion'
import { TEXTO_ESTADO_VISIBLE, type EstadoVisible } from '../../modelos/estadoVisible'
import { ACCION_MARCACION, NOMBRE_MARCACION, SITUACION_SEGUN_SIGUIENTE } from '../../modelos/etiquetasMarcacion'
import { Boton } from '../base/Boton'
import { CronometroJornada } from '../personal/CronometroJornada'
import { Icono } from '../iconos/Icono'
import { CajaMovil } from '../movil/CajaMovil'
import { RelojDeJornada } from './RelojDeJornada'

interface PropiedadesPanelDeJornadaMovil {
  /** Instante actual, actualizado cada segundo por quien usa el componente (mueve el cronómetro). */
  ahora: Date
  marcaciones: MarcacionDto[]
  estado: EstadoVisible | null
  /** Evento que toca registrar ahora; `null` si la jornada ya terminó. */
  siguiente: TipoMarcacion | null
  /** Falso si el hospital no admite marcar (D25): no se ofrece ningún botón. */
  puedeRegistrar: boolean
  onRegistrar: () => void
  onVerDetalle: () => void
}

type Tono = 'verde' | 'ambar' | 'azul' | 'neutro'

/** Color de la caja de estado: verde para lo normal, azul en almuerzo, ámbar para lo que merece atención y neutro sin jornada. */
function tonoDe(estado: EstadoVisible | null): Tono {
  if (estado === null) return 'neutro'
  if (estado === 'EN_JORNADA' || estado === 'FINALIZADA') return 'verde'
  if (estado === 'EN_ALMUERZO') return 'azul'
  return 'ambar'
}

/** Lo que explica la caja de estado: con «Sin registrar» se dice qué falta, para que el rótulo y el texto no se contradigan. */
function situacionDe(estado: EstadoVisible | null, siguiente: TipoMarcacion | null): string {
  if (estado === 'SIN_REGISTRAR' && siguiente !== null) {
    return `Pasó la hora de tu turno y falta registrar: ${NOMBRE_MARCACION[siguiente].toLowerCase()}.`
  }
  return SITUACION_SEGUN_SIGUIENTE[siguiente ?? 'COMPLETA']
}

/**
 * Lo primero que ve el trabajador al abrir la app: el cronómetro en vivo de lo que lleva trabajado hoy, la hora de
 * Colombia, el estado de la jornada con lo que falta, el único botón de la acción siguiente permitida y el enlace al
 * detalle de la jornada. No decide cuál es la acción ni valida nada.
 */
export function PanelDeJornadaMovil({ ahora, marcaciones, estado, siguiente, puedeRegistrar, onRegistrar, onVerDetalle }: PropiedadesPanelDeJornadaMovil) {
  return (
    <section className="panel-jornada-movil" aria-label="Tu jornada de hoy">
      <CronometroJornada marcaciones={marcaciones} ahora={ahora} variante="hero" />
      <RelojDeJornada ahora={ahora} />
      <CajaMovil tono={tonoDe(estado)} icono={estado === null ? 'info' : 'verificado'} titulo={estado ? TEXTO_ESTADO_VISIBLE[estado] : 'Sin jornada en curso'}>
        {situacionDe(estado, siguiente)}
      </CajaMovil>
      {puedeRegistrar && siguiente !== null && (
        <Boton className="panel-jornada-movil__boton" onClick={onRegistrar}>
          <Icono nombre={siguiente === 'ENTRADA' || siguiente === 'REGRESO_ALMUERZO' ? 'entrada' : 'salida'} />
          {ACCION_MARCACION[siguiente]}
        </Boton>
      )}
      <Boton variante="texto" onClick={onVerDetalle}>
        Ver detalle de la jornada
      </Boton>
    </section>
  )
}
