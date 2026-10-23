import { describe, expect, it } from 'vitest'
import { validarCoordenadas, validarLatitud, validarLongitud } from '../../validadores/coordenadas'
import { validarDatosHospital } from '../../validadores/hospital'

describe('validarLatitud / validarLongitud (CA-7)', () => {
  it.each([
    ['5.0689', 5.0689],
    ['-75.5174', -75.5174],
    ['5,0689', 5.0689],
    [' 4.98 ', 4.98],
    ['90', 90],
    ['-90', -90],
    ['0', 0],
  ])('acepta la latitud %s', (texto, esperado) => {
    expect(validarLatitud(texto)).toEqual({ valor: esperado, error: null })
  })

  it.each(['90.0001', '-90.0001', '91', '-100', '1000'])('rechaza la latitud %s por salir de rango', (texto) => {
    expect(validarLatitud(texto).error).toBe('La latitud debe estar entre -90 y 90.')
  })

  it.each([['180', 180], ['-180', -180], ['-75.5', -75.5]])('acepta la longitud %s', (texto, esperado) => {
    expect(validarLongitud(texto)).toEqual({ valor: esperado, error: null })
  })

  it.each(['180.5', '-181', '999'])('rechaza la longitud %s por salir de rango', (texto) => {
    expect(validarLongitud(texto).error).toBe('La longitud debe estar entre -180 y 180.')
  })

  it.each(['', '   '])('el valor vacío %j es obligatorio', (texto) => {
    expect(validarLatitud(texto).error).toBe('La latitud es obligatoria.')
    expect(validarLongitud(texto).error).toBe('La longitud es obligatoria.')
  })

  it.each(['abc', '5.0.6', '5..0', '--5', '1e2', '5°', 'NaN', 'Infinity', '5 6', '+5'])('rechaza el texto no numérico %j', (texto) => {
    expect(validarLatitud(texto).error).toMatch(/debe ser un número/)
  })

  it('valida el par y muestra todos los errores juntos', () => {
    const resultado = validarCoordenadas('abc', '200')
    expect(resultado.validas).toBe(false)
    expect(resultado.latitud.error).toMatch(/número/)
    expect(resultado.longitud.error).toMatch(/entre -180 y 180/)
    expect(validarCoordenadas('5.07', '-75.5').validas).toBe(true)
  })
})

describe('validarDatosHospital', () => {
  const validos = { nombre: 'Hospital San José', municipioId: 'mun-manizales', direccion: 'Carrera 23 # 11-45' }

  it('no devuelve errores si todo es válido', () => {
    expect(validarDatosHospital(validos)).toEqual({})
  })

  it('exige nombre, municipio y dirección, ignorando espacios', () => {
    expect(validarDatosHospital({ nombre: '   ', municipioId: '', direccion: ' ' })).toEqual({
      nombre: 'Escribe el nombre del hospital.',
      municipioId: 'Elige el municipio del hospital.',
      direccion: 'Escribe la dirección del hospital.',
    })
  })

  it('limita el largo de nombre y dirección', () => {
    const errores = validarDatosHospital({ ...validos, nombre: 'x'.repeat(121), direccion: 'y'.repeat(161) })
    expect(errores.nombre).toMatch(/120/)
    expect(errores.direccion).toMatch(/160/)
  })
})
