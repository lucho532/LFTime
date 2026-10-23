import { describe, expect, it } from 'vitest'
import type { EstadoIncidencia } from '../../contratos/incidencia'
import { calcularAccionesPermitidas, estaCerrada, type IncidenciaParaPermisos } from '../../reglas/permisosIncidencia'

const trabajador = { id: 'usr-trab-001', rol: 'TRABAJADOR' as const, trabajadorId: 'trab-001' }
const otroTrabajador = { id: 'usr-trab-002', rol: 'TRABAJADOR' as const, trabajadorId: 'trab-002' }
const revisor = { id: 'usr-coord-1', rol: 'COORDINADOR' as const, trabajadorId: null }
const otroCoordinador = { id: 'usr-coord-2', rol: 'COORDINADOR' as const, trabajadorId: null }
const administrador = { id: 'usr-admin-1', rol: 'ADMINISTRADOR' as const, trabajadorId: null }

const incidencia = (cambios: Partial<IncidenciaParaPermisos> = {}): IncidenciaParaPermisos => ({
  trabajadorId: 'trab-001',
  estado: 'PENDIENTE',
  asignacion: 'ASIGNADA',
  revisorPrincipalId: 'usr-coord-1',
  ...cambios,
})

describe('calcularAccionesPermitidas (P-16, P-17, D26, D28, D29; solo visual)', () => {
  it('sin sesión no se puede nada', () => {
    expect(Object.values(calcularAccionesPermitidas(null, incidencia())).every((permitido) => !permitido)).toBe(true)
  })

  it('el trabajador ve y justifica solo las propias y no revisa ni resuelve', () => {
    expect(calcularAccionesPermitidas(trabajador, incidencia())).toEqual({
      ver: true, justificar: true, iniciarRevision: false, resolver: false, escalar: false, reabrir: false, asignarRevisor: false,
    })
    expect(calcularAccionesPermitidas(otroTrabajador, incidencia()).ver).toBe(false)
  })

  it('el coordinador revisor revisa, resuelve, escala y justifica en nombre del trabajador', () => {
    expect(calcularAccionesPermitidas(revisor, incidencia())).toEqual({
      ver: true, justificar: true, iniciarRevision: true, resolver: true, escalar: true, reabrir: false, asignarRevisor: false,
    })
  })

  it('otro coordinador ve todo pero no actúa sobre una incidencia que no es suya (D7, D28)', () => {
    expect(calcularAccionesPermitidas(otroCoordinador, incidencia())).toEqual({
      ver: true, justificar: false, iniciarRevision: false, resolver: false, escalar: false, reabrir: false, asignarRevisor: false,
    })
  })

  it('el administrador interviene directamente pero no justifica ni escala (D29)', () => {
    expect(calcularAccionesPermitidas(administrador, incidencia())).toMatchObject({
      ver: true, justificar: false, iniciarRevision: true, resolver: true, escalar: false, reabrir: false,
    })
  })

  it('solo el administrador asigna revisor y solo en incidencias pendientes de asignación', () => {
    const sinResponsable = incidencia({ asignacion: 'PENDIENTE_ASIGNACION', revisorPrincipalId: undefined })
    expect(calcularAccionesPermitidas(administrador, sinResponsable).asignarRevisor).toBe(true)
    expect(calcularAccionesPermitidas(administrador, incidencia()).asignarRevisor).toBe(false)
    expect(calcularAccionesPermitidas(revisor, sinResponsable).asignarRevisor).toBe(false)
  })

  it('una incidencia ya escalada no se vuelve a escalar', () => {
    const escalada = incidencia({ escalada: { motivo: 'x', escaladaPorId: 'usr-coord-1', escaladaEn: '2026-10-23T15:00:00.000Z' } })
    expect(calcularAccionesPermitidas(revisor, escalada).escalar).toBe(false)
  })

  it('una incidencia cerrada solo admite reabrirse, y por quien interviene', () => {
    for (const estado of ['JUSTIFICADA', 'NO_JUSTIFICADA'] as EstadoIncidencia[]) {
      expect(estaCerrada(estado)).toBe(true)
      expect(calcularAccionesPermitidas(revisor, incidencia({ estado }))).toEqual({
        ver: true, justificar: false, iniciarRevision: false, resolver: false, escalar: false, reabrir: true, asignarRevisor: false,
      })
      expect(calcularAccionesPermitidas(administrador, incidencia({ estado })).reabrir).toBe(true)
      expect(calcularAccionesPermitidas(trabajador, incidencia({ estado })).reabrir).toBe(false)
    }
  })

  it('«iniciar revisión» solo existe mientras está pendiente', () => {
    expect(calcularAccionesPermitidas(revisor, incidencia({ estado: 'EN_REVISION' })).iniciarRevision).toBe(false)
    expect(calcularAccionesPermitidas(revisor, incidencia({ estado: 'PENDIENTE_INFORMACION' })).resolver).toBe(true)
  })
})
