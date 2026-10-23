const RADIO_TERRESTRE_METROS = 6_371_008.8

function aRadianes(grados: number): number {
  return (grados * Math.PI) / 180
}

/** Punto de la superficie terrestre en grados. */
export interface PuntoGeografico {
  latitud: number
  longitud: number
}

/**
 * Distancia en metros entre dos puntos sobre la superficie terrestre (fórmula de Haversine, D19).
 * Función pura: no valida rangos (eso es de `validadores/coordenadas`) ni compara con ningún radio.
 */
export function calcularDistanciaMetros(origen: PuntoGeografico, destino: PuntoGeografico): number {
  const diferenciaLatitud = aRadianes(destino.latitud - origen.latitud)
  const diferenciaLongitud = aRadianes(destino.longitud - origen.longitud)
  const a =
    Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(aRadianes(origen.latitud)) * Math.cos(aRadianes(destino.latitud)) * Math.sin(diferenciaLongitud / 2) ** 2
  return 2 * RADIO_TERRESTRE_METROS * Math.asin(Math.min(1, Math.sqrt(a)))
}
