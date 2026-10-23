import { ConfiguracionServicioDemo } from './demo/ConfiguracionServicioDemo'
import { DatosDemoServicioDemo } from './demo/DatosDemoServicioDemo'
import { FotoServicioDemo } from './demo/FotoServicioDemo'
import { HorarioServicioDemo } from './demo/HorarioServicioDemo'
import { MarcacionServicioDemo } from './demo/MarcacionServicioDemo'
import { PanelServicioDemo } from './demo/PanelServicioDemo'
import { AlertaServicioDemo } from './demo/AlertaServicioDemo'
import { HospitalServicioDemo } from './demo/HospitalServicioDemo'
import { InformeServicioDemo } from './demo/InformeServicioDemo'
import { IncidenciaServicioDemo } from './demo/IncidenciaServicioDemo'
import { SesionServicioDemo } from './demo/SesionServicioDemo'
import { TrabajadorServicioDemo } from './demo/TrabajadorServicioDemo'
import { UsuarioServicioDemo } from './demo/UsuarioServicioDemo'
import type { IAlertaServicio } from './IAlertaServicio'
import type { IConfiguracionServicio } from './IConfiguracionServicio'
import type { IDatosDemoServicio } from './IDatosDemoServicio'
import type { IFotoServicio } from './IFotoServicio'
import type { IHorarioServicio } from './IHorarioServicio'
import type { IHospitalServicio } from './IHospitalServicio'
import type { IInformeServicio } from './IInformeServicio'
import type { IIncidenciaServicio } from './IIncidenciaServicio'
import type { IMarcacionServicio } from './IMarcacionServicio'
import type { IPanelServicio } from './IPanelServicio'
import type { ISesionServicio } from './ISesionServicio'
import type { ITrabajadorServicio } from './ITrabajadorServicio'
import type { IUsuarioServicio } from './IUsuarioServicio'

/** Conjunto de servicios que usa la interfaz. */
export interface Servicios {
  trabajadores: ITrabajadorServicio
  hospitales: IHospitalServicio
  horarios: IHorarioServicio
  marcaciones: IMarcacionServicio
  incidencias: IIncidenciaServicio
  alertas: IAlertaServicio
  panel: IPanelServicio
  informes: IInformeServicio
  usuarios: IUsuarioServicio
  sesion: ISesionServicio
  fotos: IFotoServicio
  configuracion: IConfiguracionServicio
  datosDemo: IDatosDemoServicio
}

/**
 * Único punto donde se elige la implementación de cada servicio. En la Fase 1 son las
 * implementaciones de demostración; en la Fase 2 se sustituyen por llamadas HTTP aquí,
 * sin tocar páginas, hooks ni componentes.
 */
export const servicios: Servicios = {
  trabajadores: new TrabajadorServicioDemo(),
  hospitales: new HospitalServicioDemo(),
  horarios: new HorarioServicioDemo(),
  marcaciones: new MarcacionServicioDemo(),
  incidencias: new IncidenciaServicioDemo(),
  alertas: new AlertaServicioDemo(),
  panel: new PanelServicioDemo(),
  informes: new InformeServicioDemo(),
  usuarios: new UsuarioServicioDemo(),
  sesion: new SesionServicioDemo(),
  fotos: new FotoServicioDemo(),
  configuracion: new ConfiguracionServicioDemo(),
  datosDemo: new DatosDemoServicioDemo(),
}
