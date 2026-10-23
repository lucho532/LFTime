/**
 * Proyección del mapa esquemático (spec D18): coloca puntos geográficos en un lienzo.
 *
 * Es ilustrativa, no cartográfica: solo conserva el orden relativo norte-sur y este-oeste y las
 * proporciones aproximadas. No consulta ningún servicio externo.
 */

export interface PuntoGeografico {
  id: string
  latitud: number
  longitud: number
}

/** Posición en píxeles de un punto dentro del lienzo del mapa esquemático. Es ilustrativa, no cartográfica. */
export interface PuntoEnLienzo {
  x: number
  y: number
}

/**
 * Proyecta los puntos dentro de un lienzo de `ancho` × `alto` con un `margen` interior. Mantiene la
 * proporción (una sola escala para ambos ejes, corrigiendo la longitud por la latitud). Un solo punto
 * queda en el centro; sin puntos no devuelve nada.
 */
export function proyectarPuntos(puntos: PuntoGeografico[], ancho: number, alto: number, margen: number): Map<string, PuntoEnLienzo> {
  const resultado = new Map<string, PuntoEnLienzo>()
  if (puntos.length === 0) {
    return resultado
  }
  const latitudes = puntos.map((p) => p.latitud)
  const latitudMedia = (Math.min(...latitudes) + Math.max(...latitudes)) / 2
  const factorLongitud = Math.cos((latitudMedia * Math.PI) / 180)
  const xs = puntos.map((p) => p.longitud * factorLongitud)
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)]
  const [minY, maxY] = [Math.min(...latitudes), Math.max(...latitudes)]
  const utilAncho = ancho - 2 * margen
  const utilAlto = alto - 2 * margen
  const rangoX = maxX - minX
  const rangoY = maxY - minY
  const escala = rangoX === 0 && rangoY === 0 ? 0 : Math.min(rangoX === 0 ? Infinity : utilAncho / rangoX, rangoY === 0 ? Infinity : utilAlto / rangoY)
  const desplazamientoX = margen + (utilAncho - rangoX * escala) / 2
  const desplazamientoY = margen + (utilAlto - rangoY * escala) / 2

  puntos.forEach((punto, indice) => {
    resultado.set(punto.id, {
      x: desplazamientoX + (xs[indice] - minX) * escala,
      y: desplazamientoY + (maxY - punto.latitud) * escala,
    })
  })
  return resultado
}
