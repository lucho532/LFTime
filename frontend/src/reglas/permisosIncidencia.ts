import type { EstadoIncidencia, IncidenciaDto } from '../contratos/incidencia'
import type { Usuario } from '../modelos/usuario'

/** Resoluciones que puede registrar quien revisa (P-17, provisional). Ninguna implica una sanción (P-18). */
export type ResolucionIncidencia = Extract<EstadoIncidencia, 'JUSTIFICADA' | 'NO_JUSTIFICADA' | 'PENDIENTE_INFORMACION'>

/** Lo mínimo de una incidencia que las reglas de permiso necesitan. */
export type IncidenciaParaPermisos = Pick<IncidenciaDto, 'trabajadorId' | 'estado' | 'asignacion' | 'revisorPrincipalId' | 'escalada'>

type UsuarioParaPermisos = Pick<Usuario, 'id' | 'rol' | 'trabajadorId'> | null

/** Acciones que una persona puede ejecutar sobre una incidencia. */
export interface AccionesPermitidas {
  ver: boolean
  justificar: boolean
  iniciarRevision: boolean
  resolver: boolean
  escalar: boolean
  reabrir: boolean
  asignarRevisor: boolean
}

/** Una incidencia cerrada (justificada o no justificada) solo admite reabrirse con motivo (P-17). */
export function estaCerrada(estado: EstadoIncidencia): boolean {
  return estado === 'JUSTIFICADA' || estado === 'NO_JUSTIFICADA'
}

const SIN_PERMISOS: AccionesPermitidas = {
  ver: false,
  justificar: false,
  iniciarRevision: false,
  resolver: false,
  escalar: false,
  reabrir: false,
  asignarRevisor: false,
}

/**
 * Regla provisional (D26, D28, D29; plan §13, P-16, P-17, P-21): qué puede hacer cada persona con una
 * incidencia.
 *
 * - Trabajador: ve y justifica solo las propias.
 * - Coordinador: ve todas (D7); como **revisor principal** de la incidencia revisa, resuelve, reabre,
 *   escala con motivo y justifica en nombre del trabajador.
 * - Administrador: ve todas e interviene directamente (revisa, resuelve, reabre) y asigna revisor a las
 *   pendientes de asignación.
 *
 * Es solo visual en la demostración (D27): el control real corresponde al backend. No ejecuta nada.
 */
export function calcularAccionesPermitidas(usuario: UsuarioParaPermisos, incidencia: IncidenciaParaPermisos): AccionesPermitidas {
  if (!usuario) {
    return SIN_PERMISOS
  }
  const cerrada = estaCerrada(incidencia.estado)
  const esPropia = usuario.rol === 'TRABAJADOR' && usuario.trabajadorId === incidencia.trabajadorId
  const esRevisor = usuario.rol === 'COORDINADOR' && incidencia.revisorPrincipalId === usuario.id
  const esAdministrador = usuario.rol === 'ADMINISTRADOR'
  if (usuario.rol === 'TRABAJADOR' && !esPropia) {
    return SIN_PERMISOS
  }
  const interviene = esRevisor || esAdministrador
  return {
    ver: true,
    justificar: !cerrada && (esPropia || esRevisor),
    iniciarRevision: incidencia.estado === 'PENDIENTE' && interviene,
    resolver: !cerrada && interviene,
    escalar: !cerrada && esRevisor && !incidencia.escalada,
    reabrir: cerrada && interviene,
    asignarRevisor: !cerrada && esAdministrador && incidencia.asignacion === 'PENDIENTE_ASIGNACION',
  }
}
