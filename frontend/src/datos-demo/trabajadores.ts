import type { TrabajadorDto } from '../contratos/trabajador'
import { crearGenerador, elegir } from './generadorAleatorio'
import { TRABAJADORES_BASE } from './trabajadoresBase'

/** Cantidad de trabajadores generados automáticamente por hospital, para completar 48 en total. */
const CUPOS_RELLENO: Record<string, number> = {
  'hosp-01': 10,
  'hosp-02': 7,
  'hosp-03': 6,
  'hosp-04': 0,
  'hosp-05': 8,
}

const NOMBRES = ['Camila', 'Andrés', 'Laura', 'Felipe', 'Sofía', 'Mateo', 'Juliana', 'Santiago', 'Isabella', 'Nicolás', 'Carolina', 'Alejandro', 'Mariana', 'Daniel', 'Paola', 'Ricardo', 'Lina', 'Jorge', 'Viviana', 'Cristian', 'Angélica', 'Mauricio', 'Yesenia', 'Fabián']
const APELLIDOS = ['Gutiérrez', 'Hoyos', 'Mejía', 'Salazar', 'Quintero', 'Zapata', 'Restrepo', 'Orozco', 'Duque', 'Franco', 'Ocampo', 'Villegas', 'Marulanda', 'Botero', 'Naranjo', 'Montoya', 'Cárdenas', 'Patiño', 'Henao', 'Arango', 'Gallego', 'Jaramillo', 'Rendón', 'Álvarez']
const CARGOS = ['Enfermera', 'Enfermero', 'Auxiliar de enfermería', 'Médico general', 'Técnico en salud', 'Auxiliar de enfermería']

/** Documento ficticio con puntos de miles, derivado del orden del trabajador. No corresponde a ninguna persona real. */
function documentoFicticio(indice: number): string {
  const numero = 1_050_000_000 + indice * 2_345_678
  return String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function idDeIndice(indice: number): string {
  return `trab-${String(indice).padStart(3, '0')}`
}

/**
 * Construye los 48 trabajadores de la demostración: los escritos a mano (que cubren los
 * escenarios) más los generados de forma determinista para completar cada hospital.
 */
export function construirTrabajadores(): TrabajadorDto[] {
  const trabajadores: TrabajadorDto[] = TRABAJADORES_BASE.map((base, posicion) => ({
    ...base,
    tipoDocumento: 'CC',
    numeroDocumento: documentoFicticio(posicion + 1),
  }))

  const generador = crearGenerador(2026)
  let indice = TRABAJADORES_BASE.length
  for (const [hospitalId, cupo] of Object.entries(CUPOS_RELLENO)) {
    for (let i = 0; i < cupo; i += 1) {
      indice += 1
      trabajadores.push({
        id: idDeIndice(indice),
        nombres: elegir(generador, NOMBRES),
        apellidos: `${elegir(generador, APELLIDOS)} ${elegir(generador, APELLIDOS)}`,
        tipoDocumento: 'CC',
        numeroDocumento: documentoFicticio(indice),
        cargo: elegir(generador, CARGOS),
        hospitalId,
        estado: 'ACTIVO',
      })
    }
  }
  return trabajadores
}
