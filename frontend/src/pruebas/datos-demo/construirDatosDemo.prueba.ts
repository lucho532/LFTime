import { beforeAll, describe, expect, it } from 'vitest'
import { construirDatosDemo } from '../../datos-demo/construirDatosDemo'
import type { DatosDemo } from '../../datos-demo/tipos'
import { hoyColombia, obtenerAhoraUtc, establecerRelojParaPruebas } from '../../utilidades/horaColombia'

/** 2026-10-23 16:30 en Colombia: los turnos diurnos ya terminaron y el nocturno de ayer ya cerró. */
const AHORA = new Date('2026-10-23T21:30:00Z')

function generar(): DatosDemo {
  establecerRelojParaPruebas(() => AHORA)
  return construirDatosDemo({ hoy: hoyColombia(), ahora: obtenerAhoraUtc() })
}

function marcacionesDe(datos: DatosDemo, trabajadorId: string, fecha: string) {
  return datos.marcaciones.filter((m) => m.trabajadorId === trabajadorId && m.fechaOperativa === fecha)
}

function minutosEntre(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60_000)
}

describe('construirDatosDemo', () => {
  let datos: DatosDemo
  beforeAll(() => {
    datos = generar()
  })

  it('es determinista: el mismo momento produce los mismos datos', () => {
    expect(generar()).toEqual(datos)
  })

  it('genera 48 trabajadores repartidos por hospital: 15, 11, 10, 2 y 10', () => {
    expect(datos.trabajadores).toHaveLength(48)
    const cuenta = (hospitalId: string) => datos.trabajadores.filter((t) => t.hospitalId === hospitalId).length
    expect(['hosp-01', 'hosp-02', 'hosp-03', 'hosp-04', 'hosp-05'].map(cuenta)).toEqual([15, 11, 10, 2, 10])
  })

  it('no usa documentos ni identificadores repetidos', () => {
    expect(new Set(datos.trabajadores.map((t) => t.numeroDocumento)).size).toBe(48)
    expect(new Set(datos.trabajadores.map((t) => t.id)).size).toBe(48)
    expect(new Set(datos.marcaciones.map((m) => m.id)).size).toBe(datos.marcaciones.length)
  })

  it('nunca genera eventos posteriores al instante actual', () => {
    const futuros = [...datos.marcaciones, ...datos.intentos].filter((e) => new Date(e.instante) > AHORA)
    expect(futuros).toEqual([])
  })

  it('un hospital sin coordenadas confirmadas no tiene marcaciones (D25)', () => {
    expect(datos.hospitales.find((h) => h.id === 'hosp-04')?.coordenadas).toBeNull()
    expect(datos.marcaciones.filter((m) => m.hospitalId === 'hosp-04')).toEqual([])
  })

  it('un hospital sin coordinador deja sus incidencias pendientes de asignación (D28)', () => {
    const sinResponsable = datos.incidencias.filter((i) => i.hospitalId === 'hosp-05')
    expect(sinResponsable.length).toBeGreaterThan(0)
    expect(sinResponsable.every((i) => i.asignacion === 'PENDIENTE_ASIGNACION' && !i.revisorPrincipalId)).toBe(true)
    const conResponsable = datos.incidencias.filter((i) => i.hospitalId !== 'hosp-05')
    expect(conResponsable.every((i) => i.asignacion === 'ASIGNADA' && i.revisorPrincipalId)).toBe(true)
  })

  it('conserva el historial de cambio de coordinador de un hospital (D28)', () => {
    const asignaciones = datos.hospitales.find((h) => h.id === 'hosp-03')!.asignacionesCoordinador
    expect(asignaciones).toHaveLength(2)
    expect(asignaciones[0].vigenteHasta).toBe('2026-08-31')
    expect(asignaciones[1].vigenteHasta).toBeUndefined()
  })

  it('los trabajadores no activos no tienen marcaciones', () => {
    expect(datos.marcaciones.filter((m) => m.trabajadorId === 'trab-014' || m.trabajadorId === 'trab-015')).toEqual([])
  })

  it('las marcaciones de cada día respetan la secuencia y quedan dentro del radio', () => {
    const orden = ['ENTRADA', 'SALIDA_ALMUERZO', 'REGRESO_ALMUERZO', 'SALIDA_FINAL']
    const porJornada = new Map<string, string[]>()
    for (const m of datos.marcaciones) {
      expect(m.distanciaAlHospitalMetros).toBeLessThanOrEqual(100)
      expect(m.ubicacion.precisionMetros).toBeLessThanOrEqual(25)
      porJornada.set(`${m.trabajadorId}:${m.fechaOperativa}`, [...(porJornada.get(`${m.trabajadorId}:${m.fechaOperativa}`) ?? []), m.tipo])
    }
    for (const tipos of porJornada.values()) {
      expect(tipos).toEqual(orden.slice(0, tipos.length))
    }
  })

  describe('escenarios de hoy', () => {
    const hoy = '2026-10-23'

    it('jornada normal: las cuatro marcaciones', () => {
      expect(marcacionesDe(datos, 'trab-001', hoy).map((m) => m.tipo)).toEqual(['ENTRADA', 'SALIDA_ALMUERZO', 'REGRESO_ALMUERZO', 'SALIDA_FINAL'])
    })

    it('retraso: entra 28 minutos después de la hora programada (06:00)', () => {
      const entrada = marcacionesDe(datos, 'trab-004', hoy)[0]
      expect(entrada.tipo).toBe('ENTRADA')
      expect(entrada.instante).toBe('2026-10-23T11:28:00.000Z')
    })

    it('sin entrada: no hay ninguna marcación hoy', () => {
      expect(marcacionesDe(datos, 'trab-005', hoy)).toEqual([])
    })

    it('no regresó del almuerzo: salida al almuerzo sin regreso ni salida final', () => {
      expect(marcacionesDe(datos, 'trab-007', hoy).map((m) => m.tipo)).toEqual(['ENTRADA', 'SALIDA_ALMUERZO'])
    })

    it('almuerzo excedido: el almuerzo dura 85 minutos', () => {
      const [, salida, regreso] = marcacionesDe(datos, 'trab-009', hoy)
      expect(minutosEntre(salida.instante, regreso.instante)).toBe(85)
    })

    it('salida anticipada: sale 45 minutos antes de las 16:00', () => {
      const final = marcacionesDe(datos, 'trab-010', hoy).find((m) => m.tipo === 'SALIDA_FINAL')!
      expect(final.instante).toBe('2026-10-23T20:15:00.000Z')
    })

    it('turno nocturno: la jornada de ayer cruza la medianoche y termina a las 04:00 de hoy', () => {
      const ayer = marcacionesDe(datos, 'trab-011', '2026-10-22')
      expect(ayer.map((m) => m.tipo)).toEqual(['ENTRADA', 'SALIDA_ALMUERZO', 'REGRESO_ALMUERZO', 'SALIDA_FINAL'])
      expect(ayer[3].instante.startsWith('2026-10-23T09:')).toBe(true)
    })

    it('intentos fuera de radio: dos intentos, una sola incidencia agrupada que los lista (D26)', () => {
      const intentos = datos.intentos.filter((i) => i.trabajadorId === 'trab-012' && i.fechaOperativa === hoy)
      expect(intentos).toHaveLength(2)
      expect(intentos.every((i) => i.motivo === 'FUERA_DE_RADIO' && !i.esFalloTecnico && i.ubicacion)).toBe(true)
      const incidencias = datos.incidencias.filter((i) => i.tipo === 'UBICACION_NO_AUTORIZADA' && i.trabajadorId === 'trab-012' && i.fechaOperativa === hoy)
      expect(incidencias).toHaveLength(1)
      expect(incidencias[0].intentosIds).toEqual(intentos.map((i) => i.id))
      expect(incidencias[0].historial.map((h) => h.accion)).toContain('INTENTO_ANADIDO')
      expect(intentos.every((i) => i.incidenciaId === incidencias[0].id)).toBe(true)
    })

    it('los intentos rechazados no alteran la secuencia de marcaciones válidas', () => {
      expect(marcacionesDe(datos, 'trab-012', hoy)[0].tipo).toBe('ENTRADA')
      expect(marcacionesDe(datos, 'trab-012', hoy)).toHaveLength(4)
    })

    it('fallo técnico: queda como intento sin ubicación y sin incidencia de ubicación indebida', () => {
      const intento = datos.intentos.find((i) => i.trabajadorId === 'trab-013')!
      expect(intento).toMatchObject({ motivo: 'PERMISO_DENEGADO', esFalloTecnico: true })
      expect(intento.ubicacion).toBeUndefined()
      expect(intento.incidenciaId).toBeUndefined()
      expect(datos.incidencias.some((i) => i.tipo === 'UBICACION_NO_AUTORIZADA' && i.trabajadorId === 'trab-013')).toBe(false)
    })
  })

  it('cubre incidencias en los cinco estados y ninguna implica una sanción', () => {
    const estados = new Set(datos.incidencias.map((i) => i.estado))
    for (const estado of ['PENDIENTE', 'EN_REVISION', 'PENDIENTE_INFORMACION', 'JUSTIFICADA', 'NO_JUSTIFICADA']) {
      expect(estados).toContain(estado)
    }
    expect(JSON.stringify(datos.incidencias).toLowerCase()).not.toContain('sanci')
  })

  it('el historial de cada incidencia empieza con la detección', () => {
    for (const incidencia of datos.incidencias) {
      expect(incidencia.historial[0].accion).toBe('DETECTADA')
    }
  })

  it('genera una alerta por incidencia reciente y no inventa alertas de incidencias inexistentes', () => {
    const ids = new Set(datos.incidencias.map((i) => i.id))
    expect(datos.alertas.length).toBeGreaterThan(0)
    expect(datos.alertas.every((a) => ids.has(a.incidenciaId))).toBe(true)
  })

  it('es coherente a cualquier hora del día: sin eventos futuros, secuencia válida y sin errores', () => {
    const orden = ['ENTRADA', 'SALIDA_ALMUERZO', 'REGRESO_ALMUERZO', 'SALIDA_FINAL']
    for (let hora = 0; hora < 24; hora += 1) {
      const ahora = new Date(Date.UTC(2026, 9, 23, hora, 7))
      const generados = construirDatosDemo({ hoy: '2026-10-23', ahora })
      expect([...generados.marcaciones, ...generados.intentos].filter((e) => new Date(e.instante) > ahora)).toEqual([])
      const porJornada = new Map<string, string[]>()
      for (const m of generados.marcaciones) {
        const clave = `${m.trabajadorId}:${m.fechaOperativa}`
        porJornada.set(clave, [...(porJornada.get(clave) ?? []), m.tipo])
      }
      for (const tipos of porJornada.values()) {
        expect(tipos).toEqual(orden.slice(0, tipos.length))
      }
      for (const incidencia of generados.incidencias) {
        expect(new Date(incidencia.detectadaEn) <= ahora).toBe(true)
        expect(incidencia.historial.every((h) => new Date(h.instante) <= new Date(ahora.getTime() + 36 * 3_600_000))).toBe(true)
      }
    }
  })

  it('incluye un horario anterior con vigencia distinta para mostrar el historial de cambios', () => {
    const horarios = datos.horarios.filter((h) => h.trabajadorId === 'trab-001')
    expect(horarios.map((h) => h.vigenteDesde).sort()).toEqual(['2026-01-01', '2026-09-01'])
  })
})
