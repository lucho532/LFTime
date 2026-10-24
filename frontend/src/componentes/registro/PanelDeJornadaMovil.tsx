import '../../estilos/componentes/PanelDeJornadaMovil.css'
import type { TipoMarcacion } from '../../contratos/marcacion'
import { TEXTO_ESTADO_VISIBLE, type EstadoVisible } from '../../modelos/estadoVisible'
import { ACCION_MARCACION, SITUACION_SEGUN_SIGUIENTE } from '../../modelos/etiquetasMarcacion'
import { Boton } from '../base/Boton'
import { Icono } from '../iconos/Icono'
import { CajaMovil } from '../movil/CajaMovil'
import { RelojDeJornada } from './RelojDeJornada'

interface PropiedadesPanelDeJornadaMovil {
  ahora: Date
  estado: EstadoVisible | null
  /** Evento que toca registrar ahora; `null` si la jornada ya terminó. */
  siguiente: TipoMarcacion | null
  /** Falso si el hospital no admite marcar (D25): no se ofrece ningún botón. */
  puedeRegistrar: boolean
  hayRegistros: boolean
  onRegistrar: () => void
  onVerDetalle: () => void
}

/**
 * Tarjeta central de la pantalla principal del trabajador: reloj de Colombia, estado de la jornada con lo que
 * falta y el único botón de la acción siguiente permitida. No decide cuál es la acción ni valida nada.
 */
export function PanelDeJornadaMovil({ ahora, estado, siguiente, puedeRegistrar, hayRegistros, onRegistrar, onVerDetalle }: PropiedadesPanelDeJornadaMovil) {
  return (
    <section className="panel-jornada-movil" aria-label="Tu jornada de hoy">
      <RelojDeJornada ahora={ahora} />
      <CajaMovil tono={estado === 'EN_ALMUERZO' ? 'azul' : 'verde'} icono="verificado" titulo={estado ? TEXTO_ESTADO_VISIBLE[estado] : 'Sin jornada en curso'}>
        {SITUACION_SEGUN_SIGUIENTE[siguiente ?? 'COMPLETA']}
      </CajaMovil>
      {puedeRegistrar && siguiente !== null && (
        <Boton className="panel-jornada-movil__boton" onClick={onRegistrar}>
          <Icono nombre={siguiente === 'ENTRADA' || siguiente === 'REGRESO_ALMUERZO' ? 'entrada' : 'salida'} />
          {ACCION_MARCACION[siguiente]}
        </Boton>
      )}
      {hayRegistros && (
        <Boton variante="texto" onClick={onVerDetalle}>
          Ver detalle de mi jornada
        </Boton>
      )}
    </section>
  )
}
