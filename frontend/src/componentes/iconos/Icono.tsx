import type { NombreIcono } from '../../reglas/permisosRuta'

/** Trazados SVG (cuadrícula de 24 × 24) de los iconos del menú. Son propios; no hay librería de iconos. */
const TRAZADOS: Record<NombreIcono | 'flecha' | 'menu', string> = {
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
}

interface PropiedadesIcono {
  nombre: NombreIcono | 'flecha' | 'menu'
}

/** Icono decorativo (`aria-hidden`): el significado siempre lo da el texto que lo acompaña. */
export function Icono({ nombre }: PropiedadesIcono) {
  return (
    <svg className="icono" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path d={TRAZADOS[nombre]} fill="currentColor" />
    </svg>
  )
}
