import { sumarDias } from '../utilidades/horaColombia'
import type { EntradaAuditoriaDto } from '../contratos/auditoria'
import { construirAlerta } from './construirIncidencias'
import { construirJornadas } from './construirJornadas'
import { HOSPITALES_DEMO } from './hospitales'
import { construirHorarios } from './horarios'
import { construirIntentos } from './intentos'
import { MUNICIPIOS_DEMO } from './municipios'
import type { ContextoDemo, DatosDemo } from './tipos'
import { construirTrabajadores } from './trabajadores'
import { USUARIOS_DEMO } from './usuarios'

function construirAuditoria(hoy: string): EntradaAuditoriaDto[] {
  const instante = (dias: number, hora: string) => `${sumarDias(hoy, dias)}T${hora}:00.000Z`
  return [
    { id: 'aud-01', usuarioId: 'usr-admin-1', instante: instante(-60, '14:00'), accion: 'ASIGNAR_COORDINADOR', entidad: 'hospital', entidadId: 'hosp-03', motivo: 'Cambio de zona de coordinación' },
    { id: 'aud-02', usuarioId: 'usr-coord-1', instante: instante(-40, '15:00'), accion: 'CONFIRMAR_COORDENADAS', entidad: 'hospital', entidadId: 'hosp-01' },
    { id: 'aud-03', usuarioId: 'usr-coord-1', instante: instante(-30, '13:30'), accion: 'CAMBIAR_HORARIO', entidad: 'trabajador', entidadId: 'trab-001', motivo: 'Ajuste de turno' },
  ]
}

/**
 * Construye el conjunto completo de datos ficticios de la demostración, relativo al día actual
 * de Colombia (D33). Es determinista: el mismo día y la misma hora producen los mismos datos.
 * No lee ni escribe almacenamiento; eso corresponde a los repositorios.
 */
export function construirDatosDemo(contexto: ContextoDemo): DatosDemo {
  const trabajadores = construirTrabajadores()
  const horarios = construirHorarios(trabajadores)
  const hospitales = structuredClone(HOSPITALES_DEMO)
  const trabajadorHospital = Object.fromEntries(trabajadores.map((t) => [t.id, t.hospitalId]))

  const jornadas = construirJornadas(contexto, trabajadores, hospitales, horarios)
  const intentos = construirIntentos(contexto, hospitales, trabajadorHospital, horarios)
  const incidencias = [...jornadas.incidencias, ...intentos.incidencias]
  const ayer = sumarDias(contexto.hoy, -1)

  return {
    municipios: structuredClone(MUNICIPIOS_DEMO),
    hospitales,
    usuarios: structuredClone(USUARIOS_DEMO),
    trabajadores,
    horarios,
    marcaciones: jornadas.marcaciones,
    intentos: intentos.intentos,
    incidencias,
    alertas: incidencias.filter((i) => i.fechaOperativa >= ayer).map(construirAlerta),
    auditoria: construirAuditoria(contexto.hoy),
  }
}
