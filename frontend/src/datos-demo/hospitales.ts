import type { AsignacionCoordinadorDto, CambioCoordenadasDto, CoordenadasHospitalDto, HospitalDto } from '../contratos/hospital'

const ADMINISTRADOR = 'usr-admin-1'
const CONFIRMADO_EN = '2026-01-05T15:00:00.000Z'

function coordenadas(latitud: number, longitud: number, origen: CoordenadasHospitalDto['origen'], confirmadoEn = CONFIRMADO_EN): CoordenadasHospitalDto {
  return {
    latitud,
    longitud,
    confirmadas: true,
    origen,
    precisionMetros: origen === 'GPS_COORDINADOR' ? 8 : undefined,
    confirmadoPorUsuarioId: 'usr-coord-1',
    confirmadoEn,
  }
}

function cambio(hospitalId: string, orden: number, anterior: CoordenadasHospitalDto | null, nueva: CoordenadasHospitalDto): CambioCoordenadasDto {
  return { id: `cc-${hospitalId}-${orden}`, usuarioId: 'usr-coord-1', instante: nueva.confirmadoEn ?? CONFIRMADO_EN, anterior, nueva }
}

function asignacion(id: string, hospitalId: string, coordinadorId: string, desde: string, hasta?: string): AsignacionCoordinadorDto {
  return { id, hospitalId, coordinadorId, vigenteDesde: desde, vigenteHasta: hasta, asignadoPorUsuarioId: ADMINISTRADOR }
}

const COORDENADAS_01 = coordenadas(5.0689, -75.5174, 'GPS_COORDINADOR')
const COORDENADAS_02_INICIAL = coordenadas(5.0451, -75.5139, 'MANUAL')
const COORDENADAS_02 = coordenadas(5.0447, -75.5147, 'MANUAL', '2026-03-10T14:00:00.000Z')
const COORDENADAS_03 = coordenadas(4.9833, -75.6056, 'MANUAL')
const COORDENADAS_05 = coordenadas(5.6081, -75.4547, 'MANUAL')

/**
 * Hospitales ficticios de la demostración. Las coordenadas están cerca de cada municipio pero
 * no corresponden a ningún hospital real. Casos cubiertos:
 * - hosp-04: coordenadas **sin confirmar** → no admite marcaciones (D25).
 * - hosp-05: **sin coordinador responsable** → incidencias pendientes de asignación (D28).
 * - hosp-03: cambio de coordinador con historial y vigencia (D28).
 * - hosp-02: coordenadas corregidas una vez, con historial (D22).
 */
export const HOSPITALES_DEMO: HospitalDto[] = [
  {
    id: 'hosp-01',
    nombre: 'Hospital San José',
    municipioId: 'mun-manizales',
    direccion: 'Carrera 23 # 11-45, Manizales',
    coordenadas: COORDENADAS_01,
    historialCoordenadas: [cambio('hosp-01', 1, null, COORDENADAS_01)],
    radioPermitidoMetros: 100,
    precisionMaximaMetros: 25,
    asignacionesCoordinador: [asignacion('asg-01', 'hosp-01', 'usr-coord-1', '2026-01-01')],
  },
  {
    id: 'hosp-02',
    nombre: 'Hospital La Merced',
    municipioId: 'mun-villamaria',
    direccion: 'Calle 6 # 5-30, Villamaría',
    coordenadas: COORDENADAS_02,
    historialCoordenadas: [cambio('hosp-02', 1, null, COORDENADAS_02_INICIAL), cambio('hosp-02', 2, COORDENADAS_02_INICIAL, COORDENADAS_02)],
    radioPermitidoMetros: 100,
    precisionMaximaMetros: 25,
    asignacionesCoordinador: [asignacion('asg-02', 'hosp-02', 'usr-coord-1', '2026-01-01')],
  },
  {
    id: 'hosp-03',
    nombre: 'Hospital San Vicente',
    municipioId: 'mun-chinchina',
    direccion: 'Carrera 8 # 10-12, Chinchiná',
    coordenadas: COORDENADAS_03,
    historialCoordenadas: [cambio('hosp-03', 1, null, COORDENADAS_03)],
    radioPermitidoMetros: 100,
    precisionMaximaMetros: 25,
    asignacionesCoordinador: [
      asignacion('asg-03a', 'hosp-03', 'usr-coord-1', '2026-01-01', '2026-08-31'),
      asignacion('asg-03b', 'hosp-03', 'usr-coord-2', '2026-09-01'),
    ],
  },
  {
    id: 'hosp-04',
    nombre: 'Hospital Santa Sofía',
    municipioId: 'mun-pacora',
    direccion: 'Calle 4 # 3-18, Pácora',
    coordenadas: null,
    historialCoordenadas: [],
    radioPermitidoMetros: 100,
    precisionMaximaMetros: 25,
    asignacionesCoordinador: [asignacion('asg-04', 'hosp-04', 'usr-coord-2', '2026-01-01')],
  },
  {
    id: 'hosp-05',
    nombre: 'Hospital San Rafael',
    municipioId: 'mun-aguadas',
    direccion: 'Carrera 5 # 7-60, Aguadas',
    coordenadas: COORDENADAS_05,
    historialCoordenadas: [cambio('hosp-05', 1, null, COORDENADAS_05)],
    radioPermitidoMetros: 100,
    precisionMaximaMetros: 25,
    asignacionesCoordinador: [],
  },
]
