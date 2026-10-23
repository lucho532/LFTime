import type { IntentoMarcacionDto } from '../../contratos/marcacion'
import { NOMBRE_MARCACION, TEXTO_MOTIVO_RECHAZO } from '../../modelos/etiquetasMarcacion'
import { formatearFechaCorta, formatearHora12 } from '../../utilidades/horaColombia'
import { Tabla, type ColumnaTabla } from '../base/Tabla'

const metros = (valor?: number) => (valor === undefined ? 'Sin dato' : `${Math.round(valor)} m`)

const COLUMNAS: ColumnaTabla<IntentoMarcacionDto>[] = [
  { clave: 'cuando', titulo: 'Fecha y hora', render: (i) => `${formatearFechaCorta(new Date(i.instante))} · ${formatearHora12(new Date(i.instante))}` },
  { clave: 'evento', titulo: 'Evento', render: (i) => NOMBRE_MARCACION[i.tipo] },
  { clave: 'distancia', titulo: 'Distancia al hospital', render: (i) => metros(i.distanciaAlHospitalMetros), alineacion: 'derecha' },
  { clave: 'precision', titulo: 'Precisión', render: (i) => (i.ubicacion ? `± ${Math.round(i.ubicacion.precisionMetros)} m` : 'Sin dato'), alineacion: 'derecha' },
  {
    clave: 'coordenadas',
    titulo: 'Coordenadas',
    render: (i) => (i.ubicacion ? `${i.ubicacion.latitud.toFixed(5)}, ${i.ubicacion.longitud.toFixed(5)}` : 'Sin ubicación'),
  },
  { clave: 'motivo', titulo: 'Motivo', render: (i) => TEXTO_MOTIVO_RECHAZO[i.motivo] },
]

/**
 * Todos los intentos rechazados asociados a una incidencia de ubicación no autorizada (D26, CA-12): hora,
 * evento, distancia, precisión, coordenadas y motivo. Los intentos son el registro original: resolver o
 * escalar la incidencia no los cambia (CA-13). Solo muestra.
 */
export function IntentosDeIncidencia({ intentos }: { intentos: IntentoMarcacionDto[] }) {
  return <Tabla columnas={COLUMNAS} filas={intentos} clavePorFila={(i) => i.id} descripcion="Intentos rechazados asociados a la incidencia" />
}
