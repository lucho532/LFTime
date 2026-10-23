import type { AsignacionHorarioDto } from '../../contratos/horario'
import type { DatosHorario } from '../../modelos/horario'
import { repositorios } from '../../repositorios/demo/repositorios'
import { obtenerHorarioVigente } from '../../reglas/horarioVigente'
import { hoyColombia } from '../../utilidades/horaColombia'
import { crearIdentificador } from '../../utilidades/identificadores'
import { validarDatosHorario } from '../../validadores/horario'
import type { IHorarioServicio } from '../IHorarioServicio'
import { registrarAuditoria } from './registrarAuditoria'

/**
 * Implementación de demostración de `IHorarioServicio`. Usa la regla provisional `obtenerHorarioVigente`
 * y valida de forma defensiva con `validarDatosHorario`. Un horario nuevo se añade; nunca se edita ni se
 * borra uno existente (R-10). No calcula jornadas.
 */
export class HorarioServicioDemo implements IHorarioServicio {
  async listarPorTrabajador(trabajadorId: string): Promise<AsignacionHorarioDto[]> {
    return repositorios.horarios
      .listar()
      .filter((horario) => horario.trabajadorId === trabajadorId)
      .sort((a, b) => b.vigenteDesde.localeCompare(a.vigenteDesde))
  }

  async obtenerVigente(trabajadorId: string, fecha: string): Promise<AsignacionHorarioDto | null> {
    return obtenerHorarioVigente(repositorios.horarios.listar(), trabajadorId, fecha)
  }

  async listarTodos(): Promise<AsignacionHorarioDto[]> {
    return repositorios.horarios.listar()
  }

  async asignar(trabajadorId: string, datos: DatosHorario, usuarioId: string): Promise<AsignacionHorarioDto> {
    if (!repositorios.trabajadores.obtenerPorId(trabajadorId)) {
      throw new Error('No se encontró el trabajador.')
    }
    const existentes = (await this.listarPorTrabajador(trabajadorId)).map((horario) => horario.vigenteDesde)
    const errores = Object.values(validarDatosHorario(datos, { hoy: hoyColombia(), vigenciasExistentes: existentes }))
    if (errores.length > 0) {
      throw new Error(errores[0])
    }
    const horario: AsignacionHorarioDto = {
      id: crearIdentificador('hor'),
      trabajadorId,
      vigenteDesde: datos.vigenteDesde,
      diasLaborables: [...datos.diasLaborables].sort((a, b) => a - b),
      horaEntrada: datos.horaEntrada,
      horaSalida: datos.horaSalida,
      ventanaAlmuerzoDesde: datos.ventanaAlmuerzoDesde,
      ventanaAlmuerzoHasta: datos.ventanaAlmuerzoHasta,
      duracionAlmuerzoMinutos: datos.duracionAlmuerzoMinutos,
      asignadoPorUsuarioId: usuarioId,
    }
    repositorios.horarios.guardar(horario)
    registrarAuditoria({
      usuarioId,
      accion: 'CAMBIAR_HORARIO',
      entidad: 'trabajador',
      entidadId: trabajadorId,
      detalle: `Desde ${horario.vigenteDesde}: ${horario.horaEntrada}–${horario.horaSalida}, almuerzo ${horario.ventanaAlmuerzoDesde}–${horario.ventanaAlmuerzoHasta} (${horario.duracionAlmuerzoMinutos} min)`,
    })
    return horario
  }
}
