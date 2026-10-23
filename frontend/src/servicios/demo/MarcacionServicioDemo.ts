import type { IntentoMarcacionDto, MarcacionDto, TipoMarcacion } from '../../contratos/marcacion'
import type { HistorialMarcaciones, JornadaDelDia, ResultadoRegistro } from '../../modelos/jornada'
import { calcularFechaOperativa } from '../../reglas/fechaOperativa'
import { evaluarMarcacion, type IntentoDeUbicacion } from '../../reglas/evaluarMarcacion'
import { obtenerHorarioVigente } from '../../reglas/horarioVigente'
import { validarSecuencia } from '../../reglas/secuencia'
import { repositorios } from '../../repositorios/demo/repositorios'
import { obtenerAhoraUtc } from '../../utilidades/horaColombia'
import { crearIdentificador } from '../../utilidades/identificadores'
import type { IMarcacionServicio } from '../IMarcacionServicio'
import { asociarIntentoAIncidencia } from './registrarIntentoFueraDeRadio'

const masRecientePrimero = (a: { instante: string }, b: { instante: string }) => b.instante.localeCompare(a.instante)

function ubicacionFinita(intento: IntentoDeUbicacion) {
  if (!('ubicacion' in intento)) return undefined
  const { latitud, longitud, precisionMetros } = intento.ubicacion
  return [latitud, longitud, precisionMetros].every(Number.isFinite) ? intento.ubicacion : undefined
}

/**
 * Implementación de demostración de `IMarcacionServicio`. Orquesta las reglas de `reglas/` (fecha
 * operativa, secuencia, evaluación de ubicación, agrupación) y guarda el resultado en el almacenamiento
 * local. La «validación» ocurre en el navegador y **no equivale a una verificación del servidor**. No
 * simula ubicaciones, no corrige marcaciones y no modifica lo ya guardado (R-10).
 */
export class MarcacionServicioDemo implements IMarcacionServicio {
  async obtenerJornadaActual(trabajadorId: string): Promise<JornadaDelDia> {
    const horarios = repositorios.horarios.listar().filter((horario) => horario.trabajadorId === trabajadorId)
    const fechaOperativa = calcularFechaOperativa(obtenerAhoraUtc(), horarios, trabajadorId)
    const delTrabajador = <T extends { trabajadorId: string; fechaOperativa: string }>(elementos: T[]) =>
      elementos.filter((e) => e.trabajadorId === trabajadorId && e.fechaOperativa === fechaOperativa)
    return {
      fechaOperativa,
      horario: obtenerHorarioVigente(horarios, trabajadorId, fechaOperativa),
      marcaciones: delTrabajador(repositorios.marcaciones.listar()).sort((a, b) => a.instante.localeCompare(b.instante)),
      intentos: delTrabajador(repositorios.intentos.listar()).sort((a, b) => a.instante.localeCompare(b.instante)),
    }
  }

  async listarHistorial(trabajadorId: string): Promise<HistorialMarcaciones> {
    return {
      marcaciones: repositorios.marcaciones.listar().filter((m) => m.trabajadorId === trabajadorId).sort(masRecientePrimero),
      intentos: repositorios.intentos.listar().filter((i) => i.trabajadorId === trabajadorId).sort(masRecientePrimero),
    }
  }

  async registrar(trabajadorId: string, tipo: TipoMarcacion, intento: IntentoDeUbicacion): Promise<ResultadoRegistro> {
    const trabajador = repositorios.trabajadores.obtenerPorId(trabajadorId)
    const hospital = trabajador ? repositorios.hospitales.obtenerPorId(trabajador.hospitalId) : null
    if (!trabajador || !hospital) {
      throw new Error('No se encontró al trabajador o a su hospital.')
    }
    const evaluacion = evaluarMarcacion(hospital, intento, {
      radioPermitidoMetros: hospital.radioPermitidoMetros,
      precisionMaximaMetros: hospital.precisionMaximaMetros,
    })
    if (evaluacion.resultado === 'HOSPITAL_SIN_COORDENADAS') {
      return { resultado: 'HOSPITAL_SIN_COORDENADAS' }
    }
    const ahora = obtenerAhoraUtc()
    const jornada = await this.obtenerJornadaActual(trabajadorId)
    const secuencia = validarSecuencia(jornada.marcaciones.map((m) => m.tipo), tipo)
    if (!secuencia.permitida) {
      return { resultado: 'SECUENCIA_INVALIDA', motivo: secuencia.motivo }
    }
    const base = { trabajadorId, hospitalId: hospital.id, tipo, instante: ahora.toISOString(), fechaOperativa: jornada.fechaOperativa }

    if (evaluacion.resultado === 'VALIDA' && 'ubicacion' in intento) {
      const marcacion: MarcacionDto = {
        id: crearIdentificador('mar'),
        ...base,
        ubicacion: intento.ubicacion,
        distanciaAlHospitalMetros: evaluacion.distanciaMetros,
        origen: 'TRABAJADOR',
      }
      repositorios.marcaciones.guardar(marcacion)
      return { resultado: 'REGISTRADA', marcacion }
    }
    if (evaluacion.resultado !== 'RECHAZADA') {
      throw new Error('Resultado de evaluación inesperado.')
    }
    const rechazado: IntentoMarcacionDto = {
      id: crearIdentificador('int'),
      ...base,
      motivo: evaluacion.motivo,
      esFalloTecnico: evaluacion.esFalloTecnico,
      ubicacion: ubicacionFinita(intento),
      distanciaAlHospitalMetros: evaluacion.distanciaMetros,
    }
    if (!evaluacion.esFalloTecnico) {
      rechazado.incidenciaId = asociarIntentoAIncidencia(rechazado, hospital)
    }
    repositorios.intentos.guardar(rechazado)
    return { resultado: 'RECHAZADA', intento: rechazado, abrioIncidencia: !evaluacion.esFalloTecnico }
  }
}
