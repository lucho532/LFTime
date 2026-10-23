import type { CambioCoordenadasDto, CoordenadasHospitalDto } from '../../contratos/hospital'
import { formatearFechaCorta, formatearHora12 } from '../../utilidades/horaColombia'
import { ListaHistorial } from '../base/ListaHistorial'

interface PropiedadesHistorialCoordenadas {
  cambios: CambioCoordenadasDto[]
  /** Devuelve el nombre de una persona a partir de su identificador. */
  nombreDe: (usuarioId: string) => string
}

function describir(coordenadas: CoordenadasHospitalDto | null): string {
  if (!coordenadas) {
    return 'sin coordenadas'
  }
  const origen = coordenadas.origen === 'GPS_COORDINADOR' ? `GPS, ± ${Math.round(coordenadas.precisionMetros ?? 0)} m` : 'manual'
  return `${coordenadas.latitud}, ${coordenadas.longitud} (${origen})`
}

/**
 * Historial de confirmaciones y cambios de coordenadas de un hospital (D22): quién, cuándo y el valor
 * anterior. Solo muestra; el historial nunca se edita (R-10). El más reciente aparece primero.
 */
export function HistorialCoordenadas({ cambios, nombreDe }: PropiedadesHistorialCoordenadas) {
  return (
    <ListaHistorial
      textoVacio="Todavía no se han confirmado coordenadas."
      elementos={[...cambios].reverse().map((cambio) => {
        const instante = new Date(cambio.instante)
        return {
          id: cambio.id,
          contenido: (
            <>
              <strong>
                {formatearFechaCorta(instante)}, {formatearHora12(instante)}
              </strong>
              <span>
                {nombreDe(cambio.usuarioId)} {cambio.anterior ? 'cambió las coordenadas' : 'confirmó las coordenadas'}
              </span>
              <span>Nuevas: {describir(cambio.nueva)}</span>
              {cambio.anterior && <span>Antes: {describir(cambio.anterior)}</span>}
            </>
          ),
        }
      })}
    />
  )
}
