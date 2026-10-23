import type { TrabajadorDto } from '../contratos/trabajador'
import type { Trabajador } from '../modelos/trabajador'

/**
 * Convierte un `TrabajadorDto` (contrato) en el modelo interno `Trabajador`.
 * No contiene reglas de negocio: solo deriva datos de presentación.
 */
export function aTrabajador(dto: TrabajadorDto): Trabajador {
  return {
    ...dto,
    nombreCompleto: `${dto.nombres} ${dto.apellidos}`,
    estaActivo: dto.estado === 'ACTIVO',
    urlFoto: dto.urlFoto ?? null,
  }
}

/** Convierte el modelo interno `Trabajador` en el contrato `TrabajadorDto`, sin los datos derivados. */
export function aTrabajadorDto(trabajador: Trabajador): TrabajadorDto {
  const { nombreCompleto: _nombreCompleto, estaActivo: _estaActivo, ...resto } = trabajador
  return resto
}
