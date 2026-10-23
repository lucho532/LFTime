import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LIMITE_BYTES_FOTO } from '../../configuracion/limitesFotos'
import { ErrorAlmacenFotos } from '../../repositorios/demo/ErrorAlmacenFotos'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { claveDeFoto } from '../../servicios/demo/FotoServicioDemo'
import { almacenFotos } from '../../repositorios/demo/almacenFotos'
import { puedeCambiarFoto, puedeEditarHorarios, puedeGestionarPersonal, puedeVerFichaDe } from '../../reglas/permisosPersonal'
import { aUsuario } from '../../mapeadores/usuarioMapeador'
import { USUARIOS_DEMO } from '../../datos-demo/usuarios'
import type { AlmacenFotosEnMemoria } from '../ayudas/almacenFotosEnMemoria'

vi.mock('../../repositorios/demo/almacenFotos', async () => {
  const { AlmacenFotosEnMemoria } = await import('../ayudas/almacenFotosEnMemoria')
  return { almacenFotos: new AlmacenFotosEnMemoria() }
})

const almacen = almacenFotos as unknown as AlmacenFotosEnMemoria
const foto = (bytes = 100) => new Blob([new Uint8Array(bytes)], { type: 'image/webp' })

describe('FotoServicioDemo (D14, D24, D35)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    almacen.vaciar()
  })

  it('la clave es la del trabajador si lo hay; si no, la de la cuenta; sin propietario falla', () => {
    expect(claveDeFoto({ trabajadorId: 'trab-001', usuarioId: 'usr-trab-001' })).toBe('trabajador:trab-001')
    expect(claveDeFoto({ usuarioId: 'usr-admin-1' })).toBe('usuario:usr-admin-1')
    expect(() => claveDeFoto({})).toThrow('necesita un propietario')
  })

  it('guardar deja la foto en el almacén y marca la referencia en el registro del trabajador y de su cuenta', async () => {
    await servicios.fotos.guardar({ trabajadorId: 'trab-001', usuarioId: 'usr-trab-001' }, foto())
    expect(await almacen.obtener('trabajador:trab-001')).not.toBeNull()
    expect(repositorios.trabajadores.obtenerPorId('trab-001')?.urlFoto).toBe('trabajador:trab-001')
    expect(repositorios.usuarios.obtenerPorId('usr-trab-001')?.urlFoto).toBe('trabajador:trab-001')
  })

  it('una cuenta sin trabajador (administración) guarda su foto bajo su propio usuario', async () => {
    await servicios.fotos.guardar({ usuarioId: 'usr-admin-1' }, foto())
    expect(await almacen.obtener('usuario:usr-admin-1')).not.toBeNull()
    expect(repositorios.usuarios.obtenerPorId('usr-admin-1')?.urlFoto).toBe('usuario:usr-admin-1')
  })

  it('rechaza una foto de más de 2 MB aunque quien llama no la haya comprimido', async () => {
    await expect(servicios.fotos.guardar({ trabajadorId: 'trab-001' }, foto(LIMITE_BYTES_FOTO + 1))).rejects.toMatchObject({ motivo: 'TAMANO_EXCEDIDO' })
    expect(await almacen.contar()).toBe(0)
    await expect(servicios.fotos.guardar({ trabajadorId: 'trab-001' }, foto(LIMITE_BYTES_FOTO))).resolves.toBeUndefined()
  })

  it('si el almacén falla, el error lleva el motivo y no se marca ninguna referencia', async () => {
    almacen.falloAlGuardar = new ErrorAlmacenFotos('CUOTA_EXCEDIDA')
    await expect(servicios.fotos.guardar({ trabajadorId: 'trab-001' }, foto())).rejects.toMatchObject({ motivo: 'CUOTA_EXCEDIDA' })
    expect(repositorios.trabajadores.obtenerPorId('trab-001')?.urlFoto ?? null).toBeNull()
  })

  it('obtenerUrl entrega una dirección si hay foto y null si no hay o si el almacén falla', async () => {
    expect(await servicios.fotos.obtenerUrl({ trabajadorId: 'trab-001' })).toBeNull()
    await servicios.fotos.guardar({ trabajadorId: 'trab-001' }, foto())
    expect(await servicios.fotos.obtenerUrl({ trabajadorId: 'trab-001' })).toMatch(/^blob:/)
    vi.spyOn(almacen, 'obtener').mockRejectedValueOnce(new ErrorAlmacenFotos('ALMACENAMIENTO_NO_DISPONIBLE'))
    expect(await servicios.fotos.obtenerUrl({ trabajadorId: 'trab-001' })).toBeNull()
  })

  it('retirar elimina solo la imagen y la referencia: el historial de asistencia no se toca (D24)', async () => {
    await servicios.fotos.guardar({ trabajadorId: 'trab-001' }, foto())
    const marcaciones = repositorios.marcaciones.listar().length
    const intentos = repositorios.intentos.listar().length
    const incidencias = repositorios.incidencias.listar().length
    await servicios.fotos.retirar({ trabajadorId: 'trab-001' })
    expect(await almacen.obtener('trabajador:trab-001')).toBeNull()
    expect(repositorios.trabajadores.obtenerPorId('trab-001')?.urlFoto ?? null).toBeNull()
    expect(repositorios.marcaciones.listar()).toHaveLength(marcaciones)
    expect(repositorios.intentos.listar()).toHaveLength(intentos)
    expect(repositorios.incidencias.listar()).toHaveLength(incidencias)
    expect(marcaciones).toBeGreaterThan(0)
  })

  it('restablecer la demostración borra también las fotos', async () => {
    await servicios.fotos.guardar({ trabajadorId: 'trab-001' }, foto())
    await servicios.datosDemo.restablecer()
    expect(await almacen.contar()).toBe(0)
    expect(repositorios.trabajadores.obtenerPorId('trab-001')?.urlFoto ?? null).toBeNull()
  })

  it('si el navegador no deja borrar las fotos, restablecer igualmente restablece lo demás', async () => {
    vi.spyOn(almacen, 'eliminarTodas').mockRejectedValueOnce(new ErrorAlmacenFotos('ALMACENAMIENTO_NO_DISPONIBLE'))
    await expect(servicios.datosDemo.restablecer()).resolves.toBe('RECIEN_INICIALIZADOS')
  })
})

describe('permisos de personal y de foto (provisionales, solo visuales)', () => {
  const por = Object.fromEntries(USUARIOS_DEMO.map((dto) => [dto.id, aUsuario(dto)]))

  it('administración y coordinación gestionan el personal; el trabajador no', () => {
    expect(puedeGestionarPersonal(por['usr-admin-1'])).toBe(true)
    expect(puedeGestionarPersonal(por['usr-coord-1'])).toBe(true)
    expect(puedeGestionarPersonal(por['usr-trab-001'])).toBe(false)
    expect(puedeGestionarPersonal(null)).toBe(false)
  })

  it('solo el coordinador asigna y edita horarios (D15)', () => {
    expect(puedeEditarHorarios(por['usr-coord-1'])).toBe(true)
    expect(puedeEditarHorarios(por['usr-admin-1'])).toBe(false)
    expect(puedeEditarHorarios(por['usr-trab-001'])).toBe(false)
  })

  it('un trabajador solo abre su propia ficha', () => {
    expect(puedeVerFichaDe(por['usr-trab-001'], 'trab-001')).toBe(true)
    expect(puedeVerFichaDe(por['usr-trab-001'], 'trab-002')).toBe(false)
    expect(puedeVerFichaDe(por['usr-coord-1'], 'trab-002')).toBe(true)
    expect(puedeVerFichaDe(null, 'trab-001')).toBe(false)
  })

  it('cada persona cambia solo su propia foto: ni administración ni coordinación cambian la de otros (D14)', () => {
    expect(puedeCambiarFoto(por['usr-trab-001'], { trabajadorId: 'trab-001' })).toBe(true)
    expect(puedeCambiarFoto(por['usr-admin-1'], { usuarioId: 'usr-admin-1' })).toBe(true)
    expect(puedeCambiarFoto(por['usr-coord-1'], { trabajadorId: 'trab-001' })).toBe(false)
    expect(puedeCambiarFoto(por['usr-admin-1'], { trabajadorId: 'trab-001' })).toBe(false)
    expect(puedeCambiarFoto(null, { usuarioId: 'usr-admin-1' })).toBe(false)
    expect(puedeCambiarFoto(por['usr-trab-004'], {})).toBe(false)
  })
})
