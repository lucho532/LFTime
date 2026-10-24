/** Latitud y longitud de una ubicación capturada. */
interface Coordenadas {
  latitud: number
  longitud: number
}

/** Coordenadas como texto legible con cinco decimales (≈ 1 m): `5.06890, -75.51740`. */
export function textoCoordenadas({ latitud, longitud }: Coordenadas): string {
  return `${latitud.toFixed(5)}, ${longitud.toFixed(5)}`
}

/**
 * Dirección que abre una ubicación en Google Maps (la aplicación del teléfono o la web). Es solo un enlace:
 * la aplicación no consulta ningún servicio de mapas; el navegador la abre cuando la persona pulsa (D38).
 */
export function crearEnlaceMapa({ latitud, longitud }: Coordenadas): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitud.toFixed(6)},${longitud.toFixed(6)}`
}
