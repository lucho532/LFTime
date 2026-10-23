import type { AccionHistorialIncidencia, EstadoIncidencia, IncidenciaDto } from '../../contratos/incidencia'
import type { IntentoMarcacionDto } from '../../contratos/marcacion'
import { estaCerrada, type ResolucionIncidencia } from '../../reglas/permisosIncidencia'
import { repositorios } from '../../repositorios/demo/repositorios'
import { obtenerAhoraUtc } from '../../utilidades/horaColombia'
import { crearIdentificador } from '../../utilidades/identificadores'
import type { IIncidenciaServicio } from '../IIncidenciaServicio'
import { registrarAuditoria } from './registrarAuditoria'
import { sincronizarIncidencias } from './sincronizarIncidencias'

const LARGO_MAXIMO_TEXTO = 1000

/** Cambios que una acción hace sobre la incidencia, además de añadir su entrada de historial. */
interface Cambio {
  accion: AccionHistorialIncidencia
  usuarioId: string
  motivo?: string
  estadoNuevo?: EstadoIncidencia
  modificar?: (incidencia: IncidenciaDto) => IncidenciaDto
}

function exigirTexto(valor: string | undefined, nombre: string): string {
  const limpio = (valor ?? '').trim()
  if (limpio === '') {
    throw new Error(`${nombre} es obligatorio.`)
  }
  if (limpio.length > LARGO_MAXIMO_TEXTO) {
    throw new Error(`${nombre} no puede superar ${LARGO_MAXIMO_TEXTO} caracteres.`)
  }
  return limpio
}

function leer(id: string): IncidenciaDto {
  const incidencia = repositorios.incidencias.obtenerPorId(id)
  if (!incidencia) {
    throw new Error('No se encontró la incidencia.')
  }
  return incidencia
}

function exigirAbierta(incidencia: IncidenciaDto): void {
  if (estaCerrada(incidencia.estado)) {
    throw new Error('La incidencia está cerrada: reábrela con un motivo para continuar.')
  }
}

/** Aplica un cambio: añade la entrada de historial (quién, cuándo, qué y por qué) y guarda. Nada se borra. */
function aplicar(incidencia: IncidenciaDto, cambio: Cambio): IncidenciaDto {
  const base = cambio.modificar ? cambio.modificar(incidencia) : incidencia
  const actualizada: IncidenciaDto = {
    ...base,
    estado: cambio.estadoNuevo ?? base.estado,
    historial: [
      ...base.historial,
      {
        id: crearIdentificador('his'),
        accion: cambio.accion,
        usuarioId: cambio.usuarioId,
        instante: obtenerAhoraUtc().toISOString(),
        motivo: cambio.motivo,
        estadoAnterior: incidencia.estado,
        estadoNuevo: cambio.estadoNuevo,
      },
    ],
  }
  repositorios.incidencias.guardar(actualizada)
  return actualizada
}

/**
 * Implementación de demostración de `IIncidenciaServicio`. Usa los repositorios locales, abre las
 * incidencias nuevas con `sincronizarIncidencias` y registra auditoría de resoluciones, reaperturas,
 * escaladas y asignaciones. Valida las transiciones y los textos de forma defensiva; no decide permisos.
 */
export class IncidenciaServicioDemo implements IIncidenciaServicio {
  async sincronizar(): Promise<number> {
    return sincronizarIncidencias()
  }

  async listar(): Promise<IncidenciaDto[]> {
    sincronizarIncidencias()
    return repositorios.incidencias.listar().sort((a, b) => b.detectadaEn.localeCompare(a.detectadaEn))
  }

  async obtenerPorId(id: string): Promise<IncidenciaDto | null> {
    return repositorios.incidencias.obtenerPorId(id)
  }

  async listarIntentos(incidenciaId: string): Promise<IntentoMarcacionDto[]> {
    const ids = new Set(repositorios.incidencias.obtenerPorId(incidenciaId)?.intentosIds ?? [])
    return repositorios.intentos.listar().filter((intento) => ids.has(intento.id)).sort((a, b) => a.instante.localeCompare(b.instante))
  }

  async justificar(id: string, texto: string, usuarioId: string, motivo?: string): Promise<IncidenciaDto> {
    const incidencia = leer(id)
    exigirAbierta(incidencia)
    const limpio = exigirTexto(texto, 'La justificación')
    const enNombreDe = repositorios.usuarios.obtenerPorId(usuarioId)?.trabajadorId !== incidencia.trabajadorId
    const motivoLimpio = enNombreDe ? exigirTexto(motivo, 'El motivo de justificar en nombre del trabajador') : undefined
    const instante = obtenerAhoraUtc().toISOString()
    // Una justificación que llega con información pendiente devuelve el caso a revisión.
    const vuelveARevision = incidencia.estado === 'PENDIENTE_INFORMACION'
    return aplicar(incidencia, {
      accion: 'JUSTIFICADA',
      usuarioId,
      motivo: motivoLimpio,
      estadoNuevo: vuelveARevision ? 'EN_REVISION' : undefined,
      modificar: (actual) => ({ ...actual, justificaciones: [...actual.justificaciones, { id: crearIdentificador('jus'), autorId: usuarioId, texto: limpio, creadaEn: instante }] }),
    })
  }

  async iniciarRevision(id: string, usuarioId: string): Promise<IncidenciaDto> {
    const incidencia = leer(id)
    if (incidencia.estado !== 'PENDIENTE') {
      throw new Error('Solo una incidencia pendiente puede pasar a revisión.')
    }
    return aplicar(incidencia, { accion: 'REVISADA', usuarioId, estadoNuevo: 'EN_REVISION' })
  }

  async resolver(id: string, resolucion: ResolucionIncidencia, motivo: string, usuarioId: string): Promise<IncidenciaDto> {
    const incidencia = leer(id)
    exigirAbierta(incidencia)
    const motivoLimpio = exigirTexto(motivo, 'El motivo de la resolución')
    const resuelta = aplicar(incidencia, { accion: 'RESUELTA', usuarioId, motivo: motivoLimpio, estadoNuevo: resolucion })
    registrarAuditoria({ usuarioId, accion: 'RESOLVER_INCIDENCIA', entidad: 'incidencia', entidadId: id, motivo: motivoLimpio, detalle: `${incidencia.estado} → ${resolucion}` })
    return resuelta
  }

  async reabrir(id: string, motivo: string, usuarioId: string): Promise<IncidenciaDto> {
    const incidencia = leer(id)
    if (!estaCerrada(incidencia.estado)) {
      throw new Error('Solo se puede reabrir una incidencia cerrada.')
    }
    const motivoLimpio = exigirTexto(motivo, 'El motivo de reabrir')
    const reabierta = aplicar(incidencia, { accion: 'REABIERTA', usuarioId, motivo: motivoLimpio, estadoNuevo: 'EN_REVISION' })
    registrarAuditoria({ usuarioId, accion: 'REABRIR_INCIDENCIA', entidad: 'incidencia', entidadId: id, motivo: motivoLimpio, detalle: `${incidencia.estado} → EN_REVISION` })
    return reabierta
  }

  async escalar(id: string, motivo: string, usuarioId: string): Promise<IncidenciaDto> {
    const incidencia = leer(id)
    exigirAbierta(incidencia)
    if (incidencia.escalada) {
      throw new Error('La incidencia ya fue escalada al administrador.')
    }
    const motivoLimpio = exigirTexto(motivo, 'El motivo de la escalada')
    const escalada = aplicar(incidencia, {
      accion: 'ESCALADA',
      usuarioId,
      motivo: motivoLimpio,
      modificar: (actual) => ({ ...actual, escalada: { motivo: motivoLimpio, escaladaPorId: usuarioId, escaladaEn: obtenerAhoraUtc().toISOString() } }),
    })
    registrarAuditoria({ usuarioId, accion: 'ESCALAR_INCIDENCIA', entidad: 'incidencia', entidadId: id, motivo: motivoLimpio, detalle: 'Escalada manual al administrador' })
    return escalada
  }

  async asignarRevisor(id: string, coordinadorId: string, usuarioId: string, motivo?: string): Promise<IncidenciaDto> {
    const incidencia = leer(id)
    exigirAbierta(incidencia)
    const coordinador = repositorios.usuarios.obtenerPorId(coordinadorId)
    if (coordinador?.rol !== 'COORDINADOR') {
      throw new Error('El revisor debe ser un coordinador.')
    }
    const motivoLimpio = motivo?.trim() || undefined
    const asignada = aplicar(incidencia, {
      accion: 'ASIGNADA',
      usuarioId,
      motivo: motivoLimpio,
      modificar: (actual) => ({ ...actual, revisorPrincipalId: coordinadorId, asignacion: 'ASIGNADA' }),
    })
    registrarAuditoria({ usuarioId, accion: 'ASIGNAR_REVISOR_INCIDENCIA', entidad: 'incidencia', entidadId: id, motivo: motivoLimpio, detalle: `Revisor: ${coordinador.nombres} ${coordinador.apellidos}` })
    return asignada
  }
}
