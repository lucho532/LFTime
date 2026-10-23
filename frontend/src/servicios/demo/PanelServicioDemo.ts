import type { AsignacionHorarioDto } from '../../contratos/horario'
import type { MarcacionDto } from '../../contratos/marcacion'
import type { TrabajadorDto } from '../../contratos/trabajador'
import { aHospital } from '../../mapeadores/hospitalMapeador'
import { aTrabajador } from '../../mapeadores/trabajadorMapeador'
import type { Hospital } from '../../modelos/hospital'
import type { FilaPersonalEnVivo, InstantaneaPanel } from '../../modelos/panel'
import { calcularDuraciones, calcularEfectivoHastaAhora, instantesDeJornada } from '../../reglas/duraciones'
import { minutosEntreInstantes, type EntradaJornada } from '../../reglas/entradaJornada'
import { calcularEstadoActual } from '../../reglas/estadoActual'
import { calcularFechaOperativa } from '../../reglas/fechaOperativa'
import { obtenerHorarioVigente } from '../../reglas/horarioVigente'
import { estaCerrada } from '../../reglas/permisosIncidencia'
import { esDiaLaborable, resolverTurno } from '../../reglas/turnoProgramado'
import { repositorios } from '../../repositorios/demo/repositorios'
import { hoyColombia, obtenerAhoraUtc } from '../../utilidades/horaColombia'
import type { IPanelServicio } from '../IPanelServicio'
import { AlertaServicioDemo } from './AlertaServicioDemo'

/**
 * Implementación de demostración de `IPanelServicio`. Reúne los datos de cada trabajador, aplica
 * `estadoActual`, `duraciones` y `turnoProgramado` y entrega las filas ya calculadas. Antes de calcular
 * deja que las reglas de detección abran las incidencias de hoy (vía las alertas). Solo lee; los tiempos
 * del día en curso son parciales y las definiciones son provisionales (D37).
 */
export class PanelServicioDemo implements IPanelServicio {
  private readonly alertas = new AlertaServicioDemo()

  async obtenerInstantanea(): Promise<InstantaneaPanel> {
    const alertas = await this.alertas.listar()
    const ahora = obtenerAhoraUtc()
    const reglas = repositorios.configuracion.obtener()
    const hoy = hoyColombia()
    const hospitales = repositorios.hospitales.listar().map((dto) => aHospital(dto, hoy))
    const horarios = repositorios.horarios.listar()
    const marcaciones = repositorios.marcaciones.listar()
    const incidencias = repositorios.incidencias.listar()

    const filas = repositorios.trabajadores.listar().flatMap((dto) => {
      const hospital = hospitales.find((h) => h.id === dto.hospitalId)
      return hospital ? [this.armarFila(dto, hospital, { ahora, reglas, horarios, marcaciones, incidencias })] : []
    })
    return { generadaEn: ahora.toISOString(), filas, hospitales, municipios: repositorios.municipios.listar(), alertas, reglas }
  }

  private armarFila(
    dto: TrabajadorDto,
    hospital: Hospital,
    contexto: Pick<EntradaJornada, 'ahora' | 'reglas'> & {
      horarios: AsignacionHorarioDto[]
      marcaciones: MarcacionDto[]
      incidencias: ReturnType<typeof repositorios.incidencias.listar>
    },
  ): FilaPersonalEnVivo {
    const { ahora, reglas } = contexto
    const trabajador = aTrabajador(dto)
    const delTrabajador = contexto.horarios.filter((h) => h.trabajadorId === dto.id)
    const fechaOperativa = calcularFechaOperativa(ahora, delTrabajador, dto.id)
    const horario = obtenerHorarioVigente(delTrabajador, dto.id, fechaOperativa)
    const deHoy = contexto.marcaciones
      .filter((m) => m.trabajadorId === dto.id && m.fechaOperativa === fechaOperativa)
      .sort((a, b) => a.instante.localeCompare(b.instante))
    const incidenciasAbiertas = contexto.incidencias.filter(
      (i) => i.trabajadorId === dto.id && i.fechaOperativa === fechaOperativa && !estaCerrada(i.estado),
    ).length
    const admiteMarcacion = hospital.coordenadasConfirmadas
    const estado = calcularEstadoActual(
      { estadoTrabajador: dto.estado, horario, fechaOperativa, marcaciones: deHoy, ahora, reglas, hospitalAdmiteMarcacion: admiteMarcacion },
      incidenciasAbiertas > 0,
    )
    const turno = horario ? resolverTurno(horario, fechaOperativa) : null
    const esperadoHoy = trabajador.estaActivo && horario !== null && admiteMarcacion && esDiaLaborable(horario, fechaOperativa)
    const { entrada } = instantesDeJornada(deHoy)
    const ultima = deHoy[deHoy.length - 1]

    return {
      trabajador,
      hospitalNombre: hospital.nombre,
      municipioNombre: repositorios.municipios.obtenerPorId(hospital.municipioId)?.nombre ?? '',
      horarioTexto: horario ? `${horario.horaEntrada} - ${horario.horaSalida}` : null,
      estado,
      esperadoHoy,
      conEntrada: entrada !== null,
      ultimaMarca: ultima ? { tipo: ultima.tipo, instante: ultima.instante } : null,
      minutosRetrasoEntrada:
        entrada && turno ? Math.max(0, Math.round(minutosEntreInstantes(turno.inicio, entrada)) - reglas.toleranciaEntradaMinutos) : 0,
      efectivoMinutos: calcularEfectivoHastaAhora(deHoy, ahora),
      almuerzoMinutos: calcularDuraciones(deHoy).almuerzoMinutos,
      efectivoProgramadoMinutos: esperadoHoy && turno ? turno.efectivoProgramadoMinutos : 0,
      almuerzoAutorizadoMinutos: horario ? horario.duracionAlmuerzoMinutos : null,
      incidenciasAbiertas,
    }
  }
}
