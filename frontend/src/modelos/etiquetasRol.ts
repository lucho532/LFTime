import type { Rol } from '../contratos/usuario'

/** Nombre de cada rol tal como se muestra en pantalla (vocabulario de la constitución). */
export const ETIQUETA_ROL: Record<Rol, string> = {
  ADMINISTRADOR: 'Administrador',
  COORDINADOR: 'Coordinador',
  TRABAJADOR: 'Trabajador',
}
