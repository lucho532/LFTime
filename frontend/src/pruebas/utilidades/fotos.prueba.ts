import { describe, expect, it, vi } from 'vitest'
import { LIMITE_BYTES_FOTO } from '../../configuracion/limitesFotos'
import { prepararFoto, type MotorImagen } from '../../utilidades/comprimirFoto'
import { MENSAJE_FORMATO_NO_ADMITIDO, validarFormatoFoto } from '../../validadores/foto'

function archivo(nombre: string, tipo: string, bytes: number): File {
  return new File([new Uint8Array(bytes)], nombre, { type: tipo })
}

/** Motor simulado: cada combinación de lado y calidad produce una imagen del tamaño que indique `tamano`. */
function motorSimulado(tamano: (lado: number, calidad: number) => number): MotorImagen & { llamadas: Array<[number, number]> } {
  const llamadas: Array<[number, number]> = []
  return {
    llamadas,
    redimensionar: vi.fn(async (_archivo: Blob, lado: number, calidad: number) => {
      llamadas.push([lado, calidad])
      return new Blob([new Uint8Array(tamano(lado, calidad))], { type: 'image/webp' })
    }),
  }
}

describe('validarFormatoFoto (D24)', () => {
  it.each([
    ['foto.jpg', 'image/jpeg'],
    ['foto.jpeg', 'image/jpeg'],
    ['FOTO.JPG', 'image/jpeg'],
    ['foto.png', 'image/png'],
    ['foto.webp', 'image/webp'],
  ])('admite %s (%s)', (nombre, tipo) => {
    expect(validarFormatoFoto({ name: nombre, type: tipo })).toBeNull()
  })

  it.each([
    ['foto.gif', 'image/gif'],
    ['foto.svg', 'image/svg+xml'],
    ['foto.bmp', 'image/bmp'],
    ['documento.pdf', 'application/pdf'],
    ['virus.exe', 'application/octet-stream'],
    ['foto.exe', 'image/jpeg'],
    ['foto.txt', 'text/plain'],
  ])('rechaza %s (%s) con un mensaje claro', (nombre, tipo) => {
    expect(validarFormatoFoto({ name: nombre, type: tipo })).toBe(MENSAJE_FORMATO_NO_ADMITIDO)
  })

  it('si el navegador no informa el tipo, decide por la extensión', () => {
    expect(validarFormatoFoto({ name: 'foto.webp', type: '' })).toBeNull()
    expect(validarFormatoFoto({ name: 'foto.gif', type: '' })).toBe(MENSAJE_FORMATO_NO_ADMITIDO)
    expect(validarFormatoFoto({ name: 'sinextension', type: '' })).toBe(MENSAJE_FORMATO_NO_ADMITIDO)
  })
})

describe('prepararFoto (D24, CA-8)', () => {
  it('una foto que cabe en 2 MB se devuelve sin tocar', async () => {
    const motor = motorSimulado(() => 1)
    const original = archivo('foto.jpg', 'image/jpeg', 500_000)
    const resultado = await prepararFoto(original, motor)
    expect(resultado).toEqual({ exito: true, foto: original, fueComprimida: false })
    expect(motor.redimensionar).not.toHaveBeenCalled()
  })

  it('el límite es 2 MB inclusive: justo 2 MB no se comprime y un byte más sí', async () => {
    const motor = motorSimulado(() => 100_000)
    expect((await prepararFoto(archivo('a.png', 'image/png', LIMITE_BYTES_FOTO), motor)).exito && motor.llamadas.length).toBe(0)
    const resultado = await prepararFoto(archivo('a.png', 'image/png', LIMITE_BYTES_FOTO + 1), motor)
    expect(resultado).toMatchObject({ exito: true, fueComprimida: true })
    expect(motor.llamadas.length).toBe(1)
  })

  it('una foto pesada se comprime probando tamaños y calidades cada vez menores hasta que cabe', async () => {
    const motor = motorSimulado((lado, calidad) => (lado <= 1200 && calidad <= 0.7 ? 900_000 : 3_000_000))
    const resultado = await prepararFoto(archivo('movil.jpg', 'image/jpeg', 6_000_000), motor)
    expect(resultado.exito).toBe(true)
    expect(motor.llamadas).toEqual([[1600, 0.85], [1600, 0.7], [1600, 0.55], [1600, 0.4], [1200, 0.85], [1200, 0.7]])
    if (resultado.exito) {
      expect(resultado.fueComprimida).toBe(true)
      expect(resultado.foto.size).toBeLessThanOrEqual(LIMITE_BYTES_FOTO)
    }
  })

  it('nunca devuelve una foto que supere el límite: si nada cabe, lo dice', async () => {
    const motor = motorSimulado(() => LIMITE_BYTES_FOTO + 1)
    const resultado = await prepararFoto(archivo('enorme.png', 'image/png', 9_000_000), motor)
    expect(resultado).toMatchObject({ exito: false, motivo: 'NO_SE_PUDO_COMPRIMIR' })
    expect(motor.llamadas).toHaveLength(16)
  })

  it('una imagen dañada o ilegible informa el problema en lugar de fallar', async () => {
    const motor: MotorImagen = { redimensionar: vi.fn().mockRejectedValue(new Error('imagen dañada')) }
    const resultado = await prepararFoto(archivo('rota.jpg', 'image/jpeg', 3_000_000), motor)
    expect(resultado).toMatchObject({ exito: false, motivo: 'ARCHIVO_NO_LEGIBLE' })
  })

  it('un archivo vacío es ilegible', async () => {
    expect(await prepararFoto(archivo('vacia.jpg', 'image/jpeg', 0), motorSimulado(() => 1))).toMatchObject({ exito: false, motivo: 'ARCHIVO_NO_LEGIBLE' })
  })

  it('un formato no admitido se rechaza sin intentar comprimir', async () => {
    const motor = motorSimulado(() => 1)
    const resultado = await prepararFoto(archivo('animada.gif', 'image/gif', 5_000_000), motor)
    expect(resultado).toEqual({ exito: false, motivo: 'FORMATO_NO_ADMITIDO', mensaje: MENSAJE_FORMATO_NO_ADMITIDO })
    expect(motor.redimensionar).not.toHaveBeenCalled()
  })
})
