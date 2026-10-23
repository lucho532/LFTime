import type { AlertaDto } from '../../contratos/alerta'
import type { EntradaAuditoriaDto } from '../../contratos/auditoria'
import type { AsignacionHorarioDto } from '../../contratos/horario'
import type { HospitalDto, MunicipioDto } from '../../contratos/hospital'
import type { IncidenciaDto } from '../../contratos/incidencia'
import type { IntentoMarcacionDto, MarcacionDto } from '../../contratos/marcacion'
import type { TrabajadorDto } from '../../contratos/trabajador'
import type { UsuarioDto } from '../../contratos/usuario'
import { RepositorioColeccionDemo } from './RepositorioColeccionDemo'
import { RepositorioConfiguracionDemo } from './RepositorioConfiguracionDemo'

/**
 * Repositorios de demostración de cada colección. Solo los usan los servicios de `servicios/demo`;
 * ningún componente ni hook debe importarlos.
 */
export const repositorios = {
  municipios: new RepositorioColeccionDemo<MunicipioDto>('municipios'),
  hospitales: new RepositorioColeccionDemo<HospitalDto>('hospitales'),
  usuarios: new RepositorioColeccionDemo<UsuarioDto>('usuarios'),
  trabajadores: new RepositorioColeccionDemo<TrabajadorDto>('trabajadores'),
  horarios: new RepositorioColeccionDemo<AsignacionHorarioDto>('horarios'),
  marcaciones: new RepositorioColeccionDemo<MarcacionDto>('marcaciones'),
  intentos: new RepositorioColeccionDemo<IntentoMarcacionDto>('intentos'),
  incidencias: new RepositorioColeccionDemo<IncidenciaDto>('incidencias'),
  alertas: new RepositorioColeccionDemo<AlertaDto>('alertas'),
  auditoria: new RepositorioColeccionDemo<EntradaAuditoriaDto>('auditoria'),
  configuracion: new RepositorioConfiguracionDemo(),
}
