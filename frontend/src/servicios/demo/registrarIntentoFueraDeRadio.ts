import type { HospitalDto } from '../../contratos/hospital'
import type { IncidenciaDto } from '../../contratos/incidencia'
import type { IntentoMarcacionDto } from '../../contratos/marcacion'
import { agruparIntentos, claveDeAgrupacion, resolverAgrupacion } from '../../reglas/agruparIntentos'
import { repositorios } from '../../repositorios/demo/repositorios'
import { crearIdentificador } from '../../utilidades/identificadores'
import { abrirIncidencia } from './abrirIncidencia'

const SISTEMA = 'sistema'

/**
 * Asocia un intento fuera de radio a su incidencia de ubicación no autorizada (D26, CA-12): si ya hay una
 * para ese trabajador, fecha operativa y hospital, le añade el intento; si no, abre una nueva con su alerta
 * (P-19). Sin coordinador responsable queda pendiente de asignación (D28). Devuelve el id de la incidencia.
 *
 * Solo añade: nunca modifica ni borra intentos ni historial (R-10). La incidencia no es una sanción.
 */
export function asociarIntentoAIncidencia(intento: IntentoMarcacionDto, hospital: HospitalDto): string {
  const todos = [...repositorios.intentos.listar(), intento]
  const clave = claveDeAgrupacion(intento.trabajadorId, intento.fechaOperativa, intento.hospitalId)
  const grupos = agruparIntentos(todos).filter((grupo) => grupo.clave === clave)
  const [accion] = resolverAgrupacion(grupos, repositorios.incidencias.listar())

  if (accion.incidenciaExistente) {
    const incidencia = accion.incidenciaExistente
    const actualizada: IncidenciaDto = {
      ...incidencia,
      intentosIds: [...(incidencia.intentosIds ?? []), ...accion.intentosNuevosIds],
      historial: [
        ...incidencia.historial,
        ...accion.intentosNuevosIds.map((id) => ({
          id: crearIdentificador('his'),
          accion: 'INTENTO_ANADIDO' as const,
          usuarioId: SISTEMA,
          instante: intento.instante,
          motivo: id === intento.id ? undefined : 'Intento anterior asociado',
        })),
      ],
    }
    repositorios.incidencias.guardar(actualizada)
    return incidencia.id
  }

  return abrirIncidencia({
    tipo: 'UBICACION_NO_AUTORIZADA',
    trabajadorId: intento.trabajadorId,
    hospital,
    fechaOperativa: intento.fechaOperativa,
    detectadaEn: intento.instante,
    intentosIds: accion.grupo.intentosIds,
  }).id
}
