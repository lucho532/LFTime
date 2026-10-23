import type { AsignacionHorarioDto } from '../contratos/horario'
import type { HospitalDto } from '../contratos/hospital'
import type { EstadoIncidencia, IncidenciaDto, TipoIncidencia } from '../contratos/incidencia'
import type { MarcacionDto } from '../contratos/marcacion'
import type { TrabajadorDto } from '../contratos/trabajador'
import { obtenerHorarioVigente } from '../reglas/horarioVigente'
import { sumarDias } from '../utilidades/horaColombia'
import { construirIncidencia } from './construirIncidencias'
import { construirMarcacionesDelDia, instantesBase, sumarMinutos } from './construirMarcaciones'
import { escenarioDeHoy, PLANES_BASE, type PlanDia } from './escenarios'
import { crearGenerador, enteroEntre, semillaDeTexto, type Generador } from './generadorAleatorio'
import { tieneIntentoEseDia } from './intentos'
import type { ContextoDemo } from './tipos'

/** Días anteriores a hoy con historial de demostración. */
const DIAS_DE_HISTORIAL = 7
const MINUTOS_SIN_SALIDA = 60

/** Anomalía que puede traer un día pasado de demostración. */
type Anomalia = Extract<TipoIncidencia, 'ENTRADA_TARDIA' | 'ALMUERZO_EXCEDIDO' | 'SALIDA_ANTICIPADA' | 'SIN_SALIDA'>

interface DiaPasado {
  plan: PlanDia
  anomalia: Anomalia | null
}

function planNormal(generador: Generador): PlanDia {
  return {
    entrada: -enteroEntre(generador, 1, 8),
    almuerzoSalida: enteroEntre(generador, 0, 12),
    almuerzoDuracion: enteroEntre(generador, 52, 60),
    salida: enteroEntre(generador, 0, 6),
  }
}

/** Decide, de forma determinista, si un día pasado tiene una anomalía (≈12 % de los días). */
function planDePasado(generador: Generador): DiaPasado {
  const plan = planNormal(generador)
  const tirada = generador()
  if (tirada < 0.06) {
    return { plan: { ...plan, entrada: enteroEntre(generador, 6, 45) }, anomalia: 'ENTRADA_TARDIA' }
  }
  if (tirada < 0.09) {
    return { plan: { ...plan, almuerzoDuracion: enteroEntre(generador, 75, 100) }, anomalia: 'ALMUERZO_EXCEDIDO' }
  }
  if (tirada < 0.11) {
    return { plan: { ...plan, salida: -enteroEntre(generador, 20, 60) }, anomalia: 'SALIDA_ANTICIPADA' }
  }
  if (tirada < 0.12) {
    return { plan: { ...plan, salida: null }, anomalia: 'SIN_SALIDA' }
  }
  return { plan, anomalia: null }
}

function planDeHoy(trabajadorId: string, generador: Generador): PlanDia {
  const base = PLANES_BASE[escenarioDeHoy(trabajadorId)]
  if (escenarioDeHoy(trabajadorId) !== 'NORMAL') {
    return base
  }
  const variacion = planNormal(generador)
  return tieneIntentoEseDia(trabajadorId, 0) ? { ...variacion, entrada: 3 } : variacion
}

function estadoParaDia(generador: Generador, diasAtras: number): EstadoIncidencia {
  const tirada = generador()
  if (diasAtras <= 1) {
    return tirada < 0.5 ? 'PENDIENTE' : 'EN_REVISION'
  }
  if (tirada < 0.15) return 'PENDIENTE'
  if (tirada < 0.25) return 'EN_REVISION'
  if (tirada < 0.4) return 'PENDIENTE_INFORMACION'
  return tirada < 0.75 ? 'JUSTIFICADA' : 'NO_JUSTIFICADA'
}

function instanteDeteccion(anomalia: Anomalia, marcaciones: MarcacionDto[], horario: AsignacionHorarioDto, fecha: string): Date | null {
  const { inicio, duracionMinutos } = instantesBase(horario, fecha)
  const buscar = (tipo: MarcacionDto['tipo']) => marcaciones.find((m) => m.tipo === tipo)?.instante
  const instante = {
    ENTRADA_TARDIA: buscar('ENTRADA'),
    ALMUERZO_EXCEDIDO: buscar('REGRESO_ALMUERZO'),
    SALIDA_ANTICIPADA: buscar('SALIDA_FINAL'),
    SIN_SALIDA: sumarMinutos(inicio, duracionMinutos + MINUTOS_SIN_SALIDA).toISOString(),
  }[anomalia]
  return instante ? new Date(instante) : null
}

/** Marcaciones e incidencias del historial y del día de hoy. */
export interface ResultadoJornadas {
  marcaciones: MarcacionDto[]
  incidencias: IncidenciaDto[]
}

/**
 * Construye las marcaciones de los últimos días y de hoy (solo hasta el instante actual) y las
 * incidencias de los días pasados. Las incidencias de **hoy** no se siembran: dependen de la hora y
 * las detectarán las reglas (hito 7). Los trabajadores no activos, o de hospitales que no admiten
 * marcaciones (D25), no tienen marcaciones.
 */
export function construirJornadas(
  contexto: ContextoDemo,
  trabajadores: TrabajadorDto[],
  hospitales: HospitalDto[],
  horarios: AsignacionHorarioDto[],
): ResultadoJornadas {
  const marcaciones: MarcacionDto[] = []
  const incidencias: IncidenciaDto[] = []

  for (const trabajador of trabajadores) {
    const hospital = hospitales.find((h) => h.id === trabajador.hospitalId)
    if (trabajador.estado !== 'ACTIVO' || !hospital?.coordenadas?.confirmadas) {
      continue
    }
    for (let diasAtras = DIAS_DE_HISTORIAL; diasAtras >= 0; diasAtras -= 1) {
      const fecha = sumarDias(contexto.hoy, -diasAtras)
      const horario = obtenerHorarioVigente(horarios, trabajador.id, fecha)
      if (!horario) {
        continue
      }
      const generador = crearGenerador(semillaDeTexto(`${trabajador.id}:${fecha}`))
      const esHoy = diasAtras === 0
      const dia: DiaPasado = esHoy
        ? { plan: planDeHoy(trabajador.id, generador), anomalia: null }
        : planDePasado(generador)
      if (!esHoy && tieneIntentoEseDia(trabajador.id, diasAtras)) {
        dia.plan = { ...dia.plan, entrada: 3 }
        dia.anomalia = dia.anomalia === 'ENTRADA_TARDIA' ? null : dia.anomalia
      }

      const delDia = construirMarcacionesDelDia({ trabajadorId: trabajador.id, hospital, horario, fechaOperativa: fecha, plan: dia.plan, generador })
      marcaciones.push(...delDia.filter((m) => new Date(m.instante).getTime() <= contexto.ahora.getTime()))

      const deteccion = dia.anomalia ? instanteDeteccion(dia.anomalia, delDia, horario, fecha) : null
      if (dia.anomalia && deteccion && deteccion.getTime() <= contexto.ahora.getTime()) {
        incidencias.push(construirIncidencia({
          tipo: dia.anomalia,
          trabajadorId: trabajador.id,
          hospital,
          fechaOperativa: fecha,
          detectadaEn: deteccion,
          estado: estadoParaDia(generador, diasAtras),
          generador,
        }))
      }
    }
  }
  return { marcaciones, incidencias }
}
