import { describe, expect, it } from 'vitest'
import type { IncidenciaDto } from '../../contratos/incidencia'
import type { IntentoMarcacionDto } from '../../contratos/marcacion'
import { agruparIntentos, claveDeAgrupacion, resolverAgrupacion } from '../../reglas/agruparIntentos'

function intento(id: string, cambios: Partial<IntentoMarcacionDto> = {}): IntentoMarcacionDto {
  return {
    id,
    trabajadorId: 'trab-1',
    hospitalId: 'hosp-1',
    tipo: 'ENTRADA',
    instante: '2026-10-21T12:00:00.000Z',
    fechaOperativa: '2026-10-21',
    motivo: 'FUERA_DE_RADIO',
    esFalloTecnico: false,
    distanciaAlHospitalMetros: 450,
    ...cambios,
  }
}

function incidenciaUbicacion(intentosIds: string[]): IncidenciaDto {
  return {
    id: 'inc-1',
    tipo: 'UBICACION_NO_AUTORIZADA',
    estado: 'PENDIENTE',
    trabajadorId: 'trab-1',
    hospitalId: 'hosp-1',
    fechaOperativa: '2026-10-21',
    detectadaEn: '2026-10-21T12:00:00.000Z',
    asignacion: 'ASIGNADA',
    intentosIds,
    justificaciones: [],
    historial: [],
  }
}

describe('agruparIntentos (D26, CA-12, CA-14)', () => {
  it('varios intentos fuera de radio del mismo trabajador, jornada y hospital forman un solo grupo (CA-12)', () => {
    const grupos = agruparIntentos([
      intento('i-2', { instante: '2026-10-21T12:10:00.000Z' }),
      intento('i-1'),
      intento('i-3', { instante: '2026-10-21T12:20:00.000Z', tipo: 'SALIDA_ALMUERZO' }),
    ])
    expect(grupos).toHaveLength(1)
    expect(grupos[0].intentosIds).toEqual(['i-1', 'i-2', 'i-3'])
    expect(grupos[0].primerInstante).toBe('2026-10-21T12:00:00.000Z')
  })

  it('separa por trabajador, por fecha operativa y por hospital', () => {
    const grupos = agruparIntentos([
      intento('a'),
      intento('b', { trabajadorId: 'trab-2' }),
      intento('c', { fechaOperativa: '2026-10-22' }),
      intento('d', { hospitalId: 'hosp-2' }),
    ])
    expect(grupos.map((g) => g.intentosIds)).toEqual([['a'], ['b'], ['c'], ['d']])
  })

  it('los fallos técnicos nunca forman parte de un grupo (CA-14)', () => {
    const grupos = agruparIntentos([
      intento('tecnico-1', { motivo: 'PERMISO_DENEGADO', esFalloTecnico: true, distanciaAlHospitalMetros: undefined }),
      intento('tecnico-2', { motivo: 'PRECISION_INSUFICIENTE', esFalloTecnico: true }),
    ])
    expect(grupos).toEqual([])
  })

  it('no modifica los intentos originales', () => {
    const original = [intento('i-1'), intento('i-2', { instante: '2026-10-21T12:05:00.000Z' })]
    const copia = JSON.parse(JSON.stringify(original))
    agruparIntentos(original)
    expect(original).toEqual(copia)
  })
})

describe('resolverAgrupacion', () => {
  const grupos = agruparIntentos([intento('i-1'), intento('i-2', { instante: '2026-10-21T12:10:00.000Z' })])

  it('sin incidencia previa indica abrir una con todos los intentos', () => {
    const [accion] = resolverAgrupacion(grupos, [])
    expect(accion.incidenciaExistente).toBeNull()
    expect(accion.intentosNuevosIds).toEqual(['i-1', 'i-2'])
  })

  it('con incidencia previa añade solo los intentos que aún no lista, sin crear otra (CA-12)', () => {
    const existente = incidenciaUbicacion(['i-1'])
    const [accion] = resolverAgrupacion(grupos, [existente])
    expect(accion.incidenciaExistente).toBe(existente)
    expect(accion.intentosNuevosIds).toEqual(['i-2'])
  })

  it('ignora incidencias de otro tipo o de otra combinación', () => {
    const otraFecha = { ...incidenciaUbicacion([]), fechaOperativa: '2026-10-20' }
    const otroTipo: IncidenciaDto = { ...incidenciaUbicacion([]), tipo: 'ENTRADA_TARDIA' }
    expect(resolverAgrupacion(grupos, [otraFecha, otroTipo])[0].incidenciaExistente).toBeNull()
  })

  it('la clave identifica trabajador, fecha operativa y hospital', () => {
    expect(claveDeAgrupacion('t', '2026-10-21', 'h')).toBe('t|2026-10-21|h')
  })
})
