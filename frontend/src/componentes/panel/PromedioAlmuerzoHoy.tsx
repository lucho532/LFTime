import '../../estilos/componentes/PromedioAlmuerzoHoy.css'
import type { PromedioAlmuerzo } from '../../reglas/indicadoresPanel'
import { formatearDuracion } from '../../utilidades/formatoDuracion'
import { Insignia } from '../base/Insignia'

interface PropiedadesPromedioAlmuerzoHoy {
  /** `null` si todavía no hay almuerzos completos hoy. */
  promedio: PromedioAlmuerzo | null
}

/**
 * «Promedio de almuerzo» (HU-01, D21): duración media de los almuerzos completos de hoy frente al tiempo
 * autorizado, siempre aparte del tiempo efectivo. Si todavía no hay almuerzos completos lo dice, en lugar de
 * mostrar un cero. Provisional (P-03 abierto): no decide si el almuerzo se paga o se descuenta.
 */
export function PromedioAlmuerzoHoy({ promedio }: PropiedadesPromedioAlmuerzoHoy) {
  if (!promedio) {
    return <p className="promedio-almuerzo-hoy__vacio">Todavía no hay almuerzos completos hoy.</p>
  }
  return (
    <div className="promedio-almuerzo-hoy">
      <strong className="promedio-almuerzo-hoy__valor">{formatearDuracion(promedio.promedioMinutos)}</strong>
      <p>Tiempo autorizado: {formatearDuracion(promedio.autorizadoMinutos)}</p>
      {promedio.dentroDeLoAutorizado ? (
        <Insignia texto="Dentro de lo autorizado" tono="verde" icono="✓" />
      ) : (
        <Insignia texto="Por encima de lo autorizado" tono="ambar" icono="▲" />
      )}
      <small>
        Promedio de {promedio.almuerzosCompletos} almuerzo{promedio.almuerzosCompletos === 1 ? '' : 's'} completo{promedio.almuerzosCompletos === 1 ? '' : 's'}.
      </small>
    </div>
  )
}
