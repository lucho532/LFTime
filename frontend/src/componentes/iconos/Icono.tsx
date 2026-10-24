import type { NombreIcono } from '../../reglas/permisosRuta'

/** Iconos que no son entradas del menú: flechas, acciones y los de la aplicación móvil del trabajador. */
export type NombreIconoSuelto = 'flecha' | 'menu' | 'campana' | 'lapiz' | 'camara' | 'cubiertos' | 'salida' | 'entrada' | 'atras' | 'derecha' | 'info' | 'verificado' | 'usuario'

/** Nombre de cualquier icono disponible. */
export type NombreIconoVisible = NombreIcono | NombreIconoSuelto

/** Trazados SVG (cuadrícula de 24 × 24) de los iconos. Son propios; no hay librería de iconos. */
const TRAZADOS: Record<NombreIconoVisible, string> = {
  inicio: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  personal: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7.5 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5zm14.5-4.8c3 .1 5.5 1.8 5.5 4.8h-4.5c0-1.9-.4-3.6-1-4.8z',
  hospitales: 'M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z',
  jornadas: 'M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zM5 9h14v11H5zm3 2v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2z',
  registro: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v5.4l3.6 2.1-1 1.7L11 13V7z',
  incidencias: 'M12 2 1 21h22zm-1 7h2v6h-2zm0 8h2v2h-2z',
  reportes: 'M4 20V10h4v10zm6 0V4h4v16zm6 0v-7h4v7z',
  configuracion: 'M19.4 13a7.7 7.7 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3h-4l-.4 3a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.4L6.6 11a7.7 7.7 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 3h4l.4-3a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z',
  flecha: 'M7 10l5 5 5-5z',
  menu: 'M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z',
  lapiz: 'M3 17.25V21h3.75L17.8 9.94l-3.75-3.75zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z',
  campana: 'M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22zm7-6v-5a7 7 0 0 0-5.5-6.8V3.5a1.5 1.5 0 0 0-3 0v.7A7 7 0 0 0 5 11v5l-2 2v1h18v-1z',
  camara: 'M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3zm3 14.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  cubiertos: 'M7 2v6H5V2H3v7a3 3 0 0 0 2.5 3v10h2V12A3 3 0 0 0 10 9V2H8v6H7zm10 0c-2 1.500-3 4-3 7v5h3v8h2V2z',
  salida: 'M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5zm6.500 4-1.400 1.400 2.600 2.600H9v2h8.700l-2.600 2.600 1.400 1.400 5-5z',
  entrada: 'M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5v-2h5V5h-5zM9.500 7 8.100 8.400 10.700 11H2v2h8.700l-2.600 2.600L9.500 17l5-5z',
  atras: 'M20 11H7.800l5.600-5.600L12 4l-8 8 8 8 1.400-1.400L7.800 13H20z',
  derecha: 'M9 6l6 6-6 6-1.400-1.400L12.200 12 7.600 7.400z',
  info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z',
  verificado: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.500 14.500L6 12l1.400-1.400 3.100 3.100 6.100-6.100L18 9z',
  usuario: 'M12 12a4.500 4.500 0 1 0 0-9 4.500 4.500 0 0 0 0 9zm0 2c-4.400 0-8 2.200-8 5v2h16v-2c0-2.800-3.600-5-8-5z',
}

interface PropiedadesIcono {
  nombre: NombreIconoVisible
  /** Tamaño en píxeles; por defecto 22. */
  tamano?: number
}

/** Icono decorativo (`aria-hidden`): el significado siempre lo da el texto que lo acompaña. */
export function Icono({ nombre, tamano = 22 }: PropiedadesIcono) {
  return (
    <svg className="icono" viewBox="0 0 24 24" width={tamano} height={tamano} aria-hidden="true" focusable="false">
      <path d={TRAZADOS[nombre]} fill="currentColor" />
    </svg>
  )
}
