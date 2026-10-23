import { describe, expect, it, vi } from 'vitest'
import { obtenerUbicacionActual, type EntornoGeolocalizacion } from '../../utilidades/geolocalizacion'
import { mensajeDeFalloUbicacion } from '../../utilidades/mensajesUbicacion'
import { proyectarPuntos } from '../../utilidades/proyeccionMapa'

function entorno(opciones: {
  seguro?: boolean
  permiso?: PermissionState | 'sinApi' | 'falla'
  posicion?: { latitude: number; longitude: number; accuracy: number }
  error?: number
}): EntornoGeolocalizacion {
  const { seguro = true, permiso = 'prompt', posicion, error } = opciones
  return {
    esContextoSeguro: seguro,
    permissions:
      permiso === 'sinApi'
        ? undefined
        : { query: vi.fn(async () => { if (permiso === 'falla') throw new Error('no soportado'); return { state: permiso } as PermissionStatus }) },
    geolocation: {
      getCurrentPosition: vi.fn((exito, fallo) => {
        if (error !== undefined) {
          fallo?.({ code: error, message: '' } as GeolocationPositionError)
        } else {
          exito({ coords: posicion } as GeolocationPosition)
        }
      }),
    },
  }
}

describe('obtenerUbicacionActual (D13)', () => {
  it('devuelve la ubicación real con latitud, longitud y precisión', async () => {
    const resultado = await obtenerUbicacionActual(entorno({ posicion: { latitude: 5.0689, longitude: -75.5174, accuracy: 8 } }))
    expect(resultado).toEqual({ exito: true, ubicacion: { latitud: 5.0689, longitud: -75.5174, precisionMetros: 8 } })
  })

  it('pide alta precisión y no reutiliza ubicaciones antiguas', async () => {
    const e = entorno({ posicion: { latitude: 1, longitude: 1, accuracy: 5 } })
    await obtenerUbicacionActual(e, 7000)
    expect(e.geolocation!.getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 })
  })

  it('sin contexto seguro no intenta pedir la ubicación', async () => {
    const e = entorno({ seguro: false })
    expect(await obtenerUbicacionActual(e)).toEqual({ exito: false, motivo: 'CONTEXTO_NO_SEGURO' })
    expect(e.geolocation!.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('sin API de geolocalización informa ubicación no disponible', async () => {
    expect(await obtenerUbicacionActual({ esContextoSeguro: true })).toEqual({ exito: false, motivo: 'UBICACION_NO_DISPONIBLE' })
  })

  it('con el permiso bloqueado por el navegador no insiste y da instrucciones', async () => {
    const e = entorno({ permiso: 'denied' })
    expect(await obtenerUbicacionActual(e)).toEqual({ exito: false, motivo: 'PERMISO_BLOQUEADO' })
    expect(e.geolocation!.getCurrentPosition).not.toHaveBeenCalled()
    expect(mensajeDeFalloUbicacion('PERMISO_BLOQUEADO')).toMatch(/Configuración del sitio/)
  })

  it('vuelve a comprobar el permiso en cada intento', async () => {
    const e = entorno({ posicion: { latitude: 1, longitude: 1, accuracy: 5 } })
    await obtenerUbicacionActual(e)
    await obtenerUbicacionActual(e)
    expect(e.permissions!.query).toHaveBeenCalledTimes(2)
  })

  it('si la persona rechaza el aviso del navegador, distingue «denegado» de «bloqueado»', async () => {
    expect(await obtenerUbicacionActual(entorno({ permiso: 'prompt', error: 1 }))).toEqual({ exito: false, motivo: 'PERMISO_DENEGADO' })
  })

  it.each([
    [2, 'UBICACION_NO_DISPONIBLE'],
    [3, 'TIEMPO_AGOTADO'],
  ])('el error %i del navegador se traduce a %s', async (codigo, motivo) => {
    expect(await obtenerUbicacionActual(entorno({ error: codigo }))).toEqual({ exito: false, motivo })
  })

  it('funciona si el navegador no soporta consultar permisos', async () => {
    for (const permiso of ['sinApi', 'falla'] as const) {
      const resultado = await obtenerUbicacionActual(entorno({ permiso, posicion: { latitude: 2, longitude: 3, accuracy: 4 } }))
      expect(resultado.exito).toBe(true)
    }
  })

  it('nunca inventa una ubicación: una posición no numérica es un fallo', async () => {
    const resultado = await obtenerUbicacionActual(entorno({ posicion: { latitude: Number.NaN, longitude: 1, accuracy: 5 } }))
    expect(resultado).toEqual({ exito: false, motivo: 'UBICACION_NO_DISPONIBLE' })
  })

  it('cada fallo tiene un mensaje que dice qué hacer', () => {
    for (const motivo of ['PERMISO_DENEGADO', 'PERMISO_BLOQUEADO', 'UBICACION_NO_DISPONIBLE', 'TIEMPO_AGOTADO', 'CONTEXTO_NO_SEGURO'] as const) {
      expect(mensajeDeFalloUbicacion(motivo).length).toBeGreaterThan(30)
    }
  })
})

describe('proyectarPuntos (mapa esquemático local)', () => {
  const puntos = [
    { id: 'norte', latitud: 5.6, longitud: -75.45 },
    { id: 'sur', latitud: 4.98, longitud: -75.6 },
    { id: 'este', latitud: 5.04, longitud: -75.3 },
  ]

  it('conserva el orden: lo más al norte queda más arriba y lo más al este más a la derecha', () => {
    const mapa = proyectarPuntos(puntos, 520, 320, 56)
    expect(mapa.get('norte')!.y).toBeLessThan(mapa.get('sur')!.y)
    expect(mapa.get('este')!.x).toBeGreaterThan(mapa.get('sur')!.x)
  })

  it('mantiene todos los puntos dentro del lienzo, respetando el margen', () => {
    for (const { x, y } of proyectarPuntos(puntos, 520, 320, 56).values()) {
      expect(x).toBeGreaterThanOrEqual(56 - 0.001)
      expect(x).toBeLessThanOrEqual(520 - 56 + 0.001)
      expect(y).toBeGreaterThanOrEqual(56 - 0.001)
      expect(y).toBeLessThanOrEqual(320 - 56 + 0.001)
    }
  })

  it('un solo punto queda en el centro y sin puntos no devuelve nada', () => {
    expect(proyectarPuntos([puntos[0]], 520, 320, 56).get('norte')).toEqual({ x: 260, y: 160 })
    expect(proyectarPuntos([], 520, 320, 56).size).toBe(0)
  })

  it('dos puntos a la misma latitud quedan a la misma altura', () => {
    const mapa = proyectarPuntos([{ id: 'a', latitud: 5, longitud: -75 }, { id: 'b', latitud: 5, longitud: -74 }], 520, 320, 56)
    expect(mapa.get('a')!.y).toBe(mapa.get('b')!.y)
    expect(mapa.get('b')!.x).toBeGreaterThan(mapa.get('a')!.x)
  })
})
