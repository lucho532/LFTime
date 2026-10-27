import '../../estilos/componentes/DetalleJornadaActiva.css'
import type { TipoMarcacion } from '../../contratos/marcacion'
import { ACCION_MARCACION } from '../../modelos/etiquetasMarcacion'
import type { JornadaDelDia } from '../../modelos/jornada'
import { Boton } from '../base/Boton'
import { CajaMovil } from '../movil/CajaMovil'
import { EncabezadoPantallaMovil } from '../movil/EncabezadoPantallaMovil'
import { JornadaDelDiaTrabajador } from '../personal/JornadaDelDiaTrabajador'

interface PropiedadesDetalleJornadaActiva {
  jornada: JornadaDelDia
  /** Instante actual, actualizado cada segundo por quien usa el componente. */
  ahora: Date
  siguiente: TipoMarcacion | null
  puedeRegistrar: boolean
  onRegistrar: () => void
  onAtras: () => void
}

/**
 * Detalle de la jornada de hoy, al que se llega desde el enlace de la pantalla principal: cada marcación con su
 * hora programada, la registrada y su ubicación, y el resumen del día (tramos, almuerzo frente a lo autorizado y
 * total). El cronómetro queda en la pantalla principal. Los tiempos son una referencia y provisionales (D16, P-03,
 * P-05). No calcula nada: reutiliza la tarjeta de la ficha.
 */
export function DetalleJornadaActiva({ jornada, ahora, siguiente, puedeRegistrar, onRegistrar, onAtras }: PropiedadesDetalleJornadaActiva) {
  return (
    <section className="detalle-jornada-activa">
      <EncabezadoPantallaMovil titulo="Detalle de la jornada de hoy" onAtras={onAtras} />
      <JornadaDelDiaTrabajador jornada={jornada} ahora={ahora} conCronometro={false} />
      {puedeRegistrar && siguiente !== null && (
        <Boton variante="secundario" className="detalle-jornada-activa__boton" onClick={onRegistrar}>
          {ACCION_MARCACION[siguiente]}
        </Boton>
      )}
      <CajaMovil icono="info">El almuerzo se registra con salida y regreso. El tiempo se calcula automáticamente a partir de tus registros.</CajaMovil>
    </section>
  )
}
