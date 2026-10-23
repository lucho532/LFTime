import type { HospitalDto } from '../contratos/hospital'
import type { Hospital } from '../modelos/hospital'
import { obtenerAsignacionVigente } from '../reglas/asignacionCoordinador'

/**
 * Convierte un `HospitalDto` (contrato) en el modelo interno `Hospital`.
 * `fechaReferencia` (`AAAA-MM-DD`) determina qué asignación de coordinador está vigente.
 * Deriva datos de presentación; no decide permisos ni modifica el contrato.
 */
export function aHospital(dto: HospitalDto, fechaReferencia: string): Hospital {
  const confirmadas = dto.coordenadas?.confirmadas === true
  return {
    id: dto.id,
    nombre: dto.nombre,
    municipioId: dto.municipioId,
    direccion: dto.direccion,
    coordenadas: dto.coordenadas,
    historialCoordenadas: dto.historialCoordenadas,
    coordenadasConfirmadas: confirmadas,
    admiteMarcaciones: confirmadas,
    radioPermitidoMetros: dto.radioPermitidoMetros,
    precisionMaximaMetros: dto.precisionMaximaMetros,
    asignacionesCoordinador: dto.asignacionesCoordinador,
    coordinadorResponsableId: obtenerAsignacionVigente(dto.asignacionesCoordinador, fechaReferencia)?.coordinadorId ?? null,
  }
}

/** Convierte el modelo interno `Hospital` en el contrato `HospitalDto`, sin los datos derivados. */
export function aHospitalDto(hospital: Hospital): HospitalDto {
  return {
    id: hospital.id,
    nombre: hospital.nombre,
    municipioId: hospital.municipioId,
    direccion: hospital.direccion,
    coordenadas: hospital.coordenadas,
    historialCoordenadas: hospital.historialCoordenadas,
    radioPermitidoMetros: hospital.radioPermitidoMetros,
    precisionMaximaMetros: hospital.precisionMaximaMetros,
    asignacionesCoordinador: hospital.asignacionesCoordinador,
  }
}
