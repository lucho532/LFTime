import type { CambioCoordenadasDto, CoordenadasHospitalDto, HospitalDto, MunicipioDto } from '../../contratos/hospital'
import { aHospital } from '../../mapeadores/hospitalMapeador'
import type { DatosHospital, EntradaCoordenadas, Hospital } from '../../modelos/hospital'
import { obtenerAsignacionVigente } from '../../reglas/asignacionCoordinador'
import { repositorios } from '../../repositorios/demo/repositorios'
import { hoyColombia, obtenerAhoraUtc, sumarDias } from '../../utilidades/horaColombia'
import { crearIdentificador } from '../../utilidades/identificadores'
import { validarCoordenadas } from '../../validadores/coordenadas'
import { validarDatosHospital } from '../../validadores/hospital'
import type { IHospitalServicio } from '../IHospitalServicio'
import { registrarAuditoria } from './registrarAuditoria'

function textoCoordenadas(coordenadas: CoordenadasHospitalDto | null): string {
  return coordenadas ? `${coordenadas.latitud}, ${coordenadas.longitud}` : 'sin coordenadas'
}

/**
 * Implementación de demostración de `IHospitalServicio`: lee y escribe en el repositorio local,
 * resuelve el coordinador vigente hoy (hora de Colombia) y registra auditoría. Valida los datos de
 * forma defensiva, pero no decide permisos (D27).
 */
export class HospitalServicioDemo implements IHospitalServicio {
  async listar(): Promise<Hospital[]> {
    const hoy = hoyColombia()
    return repositorios.hospitales.listar().map((dto) => aHospital(dto, hoy))
  }

  async obtenerPorId(id: string): Promise<Hospital | null> {
    const dto = repositorios.hospitales.obtenerPorId(id)
    return dto ? aHospital(dto, hoyColombia()) : null
  }

  async listarMunicipios(): Promise<MunicipioDto[]> {
    return repositorios.municipios.listar()
  }

  async crear(datos: DatosHospital, usuarioId: string): Promise<Hospital> {
    this.exigirDatosValidos(datos)
    const reglas = repositorios.configuracion.obtener()
    const hospital: HospitalDto = {
      id: crearIdentificador('hosp'),
      nombre: datos.nombre.trim(),
      municipioId: datos.municipioId,
      direccion: datos.direccion.trim(),
      coordenadas: null,
      historialCoordenadas: [],
      radioPermitidoMetros: reglas.radioPermitidoMetros,
      precisionMaximaMetros: reglas.precisionMaximaMetros,
      asignacionesCoordinador: [],
    }
    repositorios.hospitales.guardar(hospital)
    registrarAuditoria({ usuarioId, accion: 'CREAR_HOSPITAL', entidad: 'hospital', entidadId: hospital.id, detalle: hospital.nombre })
    return aHospital(hospital, hoyColombia())
  }

  async actualizar(id: string, datos: DatosHospital, usuarioId: string): Promise<Hospital> {
    this.exigirDatosValidos(datos)
    const actual = this.exigirHospital(id)
    const actualizado: HospitalDto = { ...actual, nombre: datos.nombre.trim(), municipioId: datos.municipioId, direccion: datos.direccion.trim() }
    repositorios.hospitales.guardar(actualizado)
    registrarAuditoria({ usuarioId, accion: 'EDITAR_HOSPITAL', entidad: 'hospital', entidadId: id, detalle: actualizado.nombre })
    return aHospital(actualizado, hoyColombia())
  }

  async confirmarCoordenadas(id: string, entrada: EntradaCoordenadas, usuarioId: string): Promise<Hospital> {
    const validacion = validarCoordenadas(entrada.latitud.toFixed(8), entrada.longitud.toFixed(8))
    if (!validacion.validas) {
      throw new Error(validacion.latitud.error ?? validacion.longitud.error ?? 'Coordenadas no válidas.')
    }
    const actual = this.exigirHospital(id)
    const instante = obtenerAhoraUtc().toISOString()
    const nueva: CoordenadasHospitalDto = {
      latitud: entrada.latitud,
      longitud: entrada.longitud,
      confirmadas: true,
      origen: entrada.origen,
      precisionMetros: entrada.origen === 'GPS_COORDINADOR' ? entrada.precisionMetros : undefined,
      confirmadoPorUsuarioId: usuarioId,
      confirmadoEn: instante,
    }
    const cambio: CambioCoordenadasDto = { id: crearIdentificador('cc'), usuarioId, instante, anterior: actual.coordenadas, nueva }
    const actualizado: HospitalDto = { ...actual, coordenadas: nueva, historialCoordenadas: [...actual.historialCoordenadas, cambio] }
    repositorios.hospitales.guardar(actualizado)
    registrarAuditoria({
      usuarioId,
      accion: actual.coordenadas ? 'CAMBIAR_COORDENADAS' : 'CONFIRMAR_COORDENADAS',
      entidad: 'hospital',
      entidadId: id,
      detalle: `De ${textoCoordenadas(actual.coordenadas)} a ${textoCoordenadas(nueva)} (${entrada.origen === 'GPS_COORDINADOR' ? 'GPS del coordinador' : 'manual'})`,
    })
    return aHospital(actualizado, hoyColombia())
  }

  async asignarCoordinador(id: string, coordinadorId: string, usuarioId: string, motivo?: string): Promise<Hospital> {
    const coordinador = repositorios.usuarios.obtenerPorId(coordinadorId)
    if (coordinador?.rol !== 'COORDINADOR') {
      throw new Error('Elige una persona con rol de coordinador.')
    }
    const actual = this.exigirHospital(id)
    const hoy = hoyColombia()
    const vigente = obtenerAsignacionVigente(actual.asignacionesCoordinador, hoy)
    if (vigente?.coordinadorId === coordinadorId) {
      throw new Error('Esa persona ya es la coordinadora responsable de este hospital.')
    }
    const asignaciones = actual.asignacionesCoordinador.map((asignacion) =>
      asignacion.id === vigente?.id ? { ...asignacion, vigenteHasta: sumarDias(hoy, -1) } : asignacion,
    )
    asignaciones.push({
      id: crearIdentificador('asg'),
      hospitalId: id,
      coordinadorId,
      vigenteDesde: hoy,
      asignadoPorUsuarioId: usuarioId,
      motivo: motivo?.trim() || undefined,
    })
    const actualizado: HospitalDto = { ...actual, asignacionesCoordinador: asignaciones }
    repositorios.hospitales.guardar(actualizado)
    registrarAuditoria({ usuarioId, accion: 'ASIGNAR_COORDINADOR', entidad: 'hospital', entidadId: id, motivo: motivo?.trim() || undefined, detalle: `Nuevo responsable: ${coordinadorId}` })
    return aHospital(actualizado, hoy)
  }

  private exigirHospital(id: string): HospitalDto {
    const hospital = repositorios.hospitales.obtenerPorId(id)
    if (!hospital) {
      throw new Error('No se encontró el hospital.')
    }
    return hospital
  }

  private exigirDatosValidos(datos: DatosHospital): void {
    const errores = Object.values(validarDatosHospital(datos))
    if (errores.length > 0) {
      throw new Error(errores[0])
    }
  }
}
