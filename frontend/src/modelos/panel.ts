import type { ReglasProvisionalesDto } from '../contratos/configuracion'
import type { MunicipioDto } from '../contratos/hospital'
import type { TipoMarcacion } from '../contratos/marcacion'
import type { AlertaVisible } from './alerta'
import type { EstadoVisible } from './estadoVisible'
import type { Hospital } from './hospital'
import type { Trabajador } from './trabajador'

/**
 * Situación de un trabajador hoy, lista para el panel (HU-01). El servicio la arma con las reglas de
 * `reglas/`; los componentes solo la muestran. Los tiempos van separados (D21) y son parciales mientras
 * la jornada está abierta: no son los tiempos oficiales.
 */
export interface FilaPersonalEnVivo {
  trabajador: Trabajador
  hospitalNombre: string
  municipioNombre: string
  /** Horario del día como `07:00 - 16:00`; `null` si no tiene horario vigente. */
  horarioTexto: string | null
  /** Estado visible ahora (D31); `null` si hoy no se espera nada de la persona. */
  estado: EstadoVisible | null
  /** Activo, con horario laborable hoy y en un hospital que admite marcar. */
  esperadoHoy: boolean
  conEntrada: boolean
  ultimaMarca: { tipo: TipoMarcacion; instante: string } | null
  /** Minutos de la entrada posterior a la hora programada (tolerancia de `configuracion`); 0 si no hubo retraso. */
  minutosRetrasoEntrada: number
  /** Efectivo acumulado hasta ahora; `null` sin entrada. */
  efectivoMinutos: number | null
  /** Almuerzo completo (salida y regreso); `null` si no lo hay. */
  almuerzoMinutos: number | null
  /** Efectivo programado del día; 0 si no se espera a la persona. */
  efectivoProgramadoMinutos: number
  almuerzoAutorizadoMinutos: number | null
  /** Incidencias de hoy aún sin cerrar (una incidencia no es una sanción). */
  incidenciasAbiertas: number
}

/** Foto del panel en un instante: todo lo que muestra la pantalla de Inicio, coherente entre sí. */
export interface InstantaneaPanel {
  /** Instante UTC en que se calculó; es la «última actualización» que ve la persona. */
  generadaEn: string
  filas: FilaPersonalEnVivo[]
  hospitales: Hospital[]
  municipios: MunicipioDto[]
  alertas: AlertaVisible[]
  reglas: ReglasProvisionalesDto
}
