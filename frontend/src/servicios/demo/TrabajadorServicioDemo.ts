import type { TrabajadorDto } from '../../contratos/trabajador'
import { aTrabajador } from '../../mapeadores/trabajadorMapeador'
import type { DatosTrabajador, Trabajador } from '../../modelos/trabajador'
import { repositorios } from '../../repositorios/demo/repositorios'
import { crearIdentificador } from '../../utilidades/identificadores'
import { normalizarDocumento, validarDatosTrabajador } from '../../validadores/trabajador'
import type { ITrabajadorServicio } from '../ITrabajadorServicio'
import { registrarAuditoria } from './registrarAuditoria'

function limpiar(datos: DatosTrabajador): Omit<TrabajadorDto, 'id' | 'urlFoto'> {
  const telefono = datos.telefono.trim()
  return {
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    tipoDocumento: datos.tipoDocumento,
    numeroDocumento: datos.numeroDocumento.trim(),
    cargo: datos.cargo.trim(),
    telefono: telefono === '' ? undefined : telefono,
    hospitalId: datos.hospitalId,
    estado: datos.estado,
  }
}

/**
 * Implementación de demostración de `ITrabajadorServicio`: lee y escribe en el repositorio local y
 * registra auditoría. Valida de forma defensiva y rechaza documentos repetidos. No decide permisos.
 */
export class TrabajadorServicioDemo implements ITrabajadorServicio {
  async listar(): Promise<Trabajador[]> {
    return repositorios.trabajadores.listar().map(aTrabajador)
  }

  async obtenerPorId(id: string): Promise<Trabajador | null> {
    const dto = repositorios.trabajadores.obtenerPorId(id)
    return dto ? aTrabajador(dto) : null
  }

  async crear(datos: DatosTrabajador, usuarioId: string): Promise<Trabajador> {
    this.exigirValidos(datos, null)
    const dto: TrabajadorDto = { id: crearIdentificador('trab'), urlFoto: null, ...limpiar(datos) }
    repositorios.trabajadores.guardar(dto)
    registrarAuditoria({ usuarioId, accion: 'CREAR_TRABAJADOR', entidad: 'trabajador', entidadId: dto.id, detalle: `${dto.nombres} ${dto.apellidos}` })
    return aTrabajador(dto)
  }

  async actualizar(id: string, datos: DatosTrabajador, usuarioId: string): Promise<Trabajador> {
    const actual = repositorios.trabajadores.obtenerPorId(id)
    if (!actual) {
      throw new Error('No se encontró el trabajador.')
    }
    this.exigirValidos(datos, id)
    const dto: TrabajadorDto = { ...limpiar(datos), id, urlFoto: actual.urlFoto }
    repositorios.trabajadores.guardar(dto)
    const cambios = [
      actual.estado !== dto.estado ? `Estado: ${actual.estado} → ${dto.estado}` : null,
      actual.hospitalId !== dto.hospitalId ? `Hospital: ${actual.hospitalId} → ${dto.hospitalId}` : null,
    ].filter(Boolean)
    registrarAuditoria({ usuarioId, accion: 'EDITAR_TRABAJADOR', entidad: 'trabajador', entidadId: id, detalle: cambios.join('; ') || 'Datos actualizados' })
    return aTrabajador(dto)
  }

  private exigirValidos(datos: DatosTrabajador, idActual: string | null): void {
    const errores = Object.values(validarDatosTrabajador(datos))
    if (errores.length > 0) {
      throw new Error(errores[0])
    }
    const documento = normalizarDocumento(datos.numeroDocumento)
    const repetido = repositorios.trabajadores.listar().some((t) => t.id !== idActual && normalizarDocumento(t.numeroDocumento) === documento)
    if (repetido) {
      throw new Error('Ya hay un trabajador con ese número de documento.')
    }
  }
}
