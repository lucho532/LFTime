import type { MotivoRechazo, UbicacionDto } from '../contratos/marcacion'

/** Motivos por los que no se pudo obtener la ubicación (fallos técnicos, nunca prueba de ubicación indebida). */
export type MotivoFalloUbicacion = Extract<
  MotivoRechazo,
  'PERMISO_DENEGADO' | 'PERMISO_BLOQUEADO' | 'UBICACION_NO_DISPONIBLE' | 'TIEMPO_AGOTADO' | 'CONTEXTO_NO_SEGURO'
>

export type ResultadoUbicacion = { exito: true; ubicacion: UbicacionDto } | { exito: false; motivo: MotivoFalloUbicacion }

/** Lo que se necesita del navegador, para poder sustituirlo en las pruebas. */
export interface EntornoGeolocalizacion {
  esContextoSeguro: boolean
  geolocation?: Pick<Geolocation, 'getCurrentPosition'>
  permissions?: Pick<Permissions, 'query'>
}

const TIEMPO_LIMITE_POR_DEFECTO_MS = 15_000

/** Entorno real del navegador. */
export function entornoDelNavegador(): EntornoGeolocalizacion {
  return { esContextoSeguro: window.isSecureContext, geolocation: navigator.geolocation, permissions: navigator.permissions }
}

async function leerEstadoPermiso(entorno: EntornoGeolocalizacion): Promise<PermissionState | null> {
  try {
    return (await entorno.permissions?.query({ name: 'geolocation' }))?.state ?? null
  } catch {
    return null
  }
}

/**
 * Obtiene la ubicación real del dispositivo con la geolocalización del navegador (D13).
 *
 * Comprueba el contexto seguro y el permiso cada vez que se llama. Si el permiso está bloqueado
 * por el navegador devuelve `PERMISO_BLOQUEADO` sin intentar pedirlo. Nunca inventa ni sustituye
 * una ubicación: ante cualquier fallo devuelve el motivo. No valida precisión ni radio.
 */
export async function obtenerUbicacionActual(
  entorno: EntornoGeolocalizacion = entornoDelNavegador(),
  tiempoLimiteMs: number = TIEMPO_LIMITE_POR_DEFECTO_MS,
): Promise<ResultadoUbicacion> {
  if (!entorno.esContextoSeguro) {
    return { exito: false, motivo: 'CONTEXTO_NO_SEGURO' }
  }
  if (!entorno.geolocation) {
    return { exito: false, motivo: 'UBICACION_NO_DISPONIBLE' }
  }
  const geolocalizacion = entorno.geolocation
  if ((await leerEstadoPermiso(entorno)) === 'denied') {
    return { exito: false, motivo: 'PERMISO_BLOQUEADO' }
  }
  return new Promise((resolver) => {
    geolocalizacion.getCurrentPosition(
      (posicion) => {
        const { latitude, longitude, accuracy } = posicion.coords
        const valida = [latitude, longitude, accuracy].every(Number.isFinite)
        resolver(valida ? { exito: true, ubicacion: { latitud: latitude, longitud: longitude, precisionMetros: accuracy } } : { exito: false, motivo: 'UBICACION_NO_DISPONIBLE' })
      },
      async (error) => {
        if (error.code === 1) {
          const bloqueado = (await leerEstadoPermiso(entorno)) === 'denied'
          resolver({ exito: false, motivo: bloqueado ? 'PERMISO_BLOQUEADO' : 'PERMISO_DENEGADO' })
        } else {
          resolver({ exito: false, motivo: error.code === 3 ? 'TIEMPO_AGOTADO' : 'UBICACION_NO_DISPONIBLE' })
        }
      },
      { enableHighAccuracy: true, timeout: tiempoLimiteMs, maximumAge: 0 },
    )
  })
}
