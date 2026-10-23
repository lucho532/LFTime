import type { EntradaAuditoriaDto } from '../../contratos/auditoria'
import { repositorios } from '../../repositorios/demo/repositorios'
import { crearIdentificador } from '../../utilidades/identificadores'
import { obtenerAhoraUtc } from '../../utilidades/horaColombia'

/**
 * Añade una entrada al registro de auditoría de la demostración (quién, cuándo, qué y por qué).
 * El registro solo crece: nunca se edita ni se borra una entrada. No decide qué auditar.
 */
export function registrarAuditoria(datos: Omit<EntradaAuditoriaDto, 'id' | 'instante'>): EntradaAuditoriaDto {
  const entrada: EntradaAuditoriaDto = { id: crearIdentificador('aud'), instante: obtenerAhoraUtc().toISOString(), ...datos }
  repositorios.auditoria.guardar(entrada)
  return entrada
}
