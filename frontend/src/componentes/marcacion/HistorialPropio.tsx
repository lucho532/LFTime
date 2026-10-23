import type { IntentoMarcacionDto, MarcacionDto } from '../../contratos/marcacion'
import { NOMBRE_MARCACION, TEXTO_MOTIVO_RECHAZO } from '../../modelos/etiquetasMarcacion'
import type { HistorialMarcaciones } from '../../modelos/jornada'
import { formatearFechaCorta, formatearHora12 } from '../../utilidades/horaColombia'
import '../../estilos/componentes/HistorialPropio.css'
import { Aviso } from '../base/Aviso'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'

const MAXIMO_FILAS = 20

const cuando = (instante: string) => `${formatearFechaCorta(new Date(instante))} · ${formatearHora12(new Date(instante))}`
const metros = (valor?: number) => (valor === undefined ? 'Sin ubicación' : `${Math.round(valor)} m`)

const COLUMNAS_MARCACIONES: ColumnaTabla<MarcacionDto>[] = [
  { clave: 'cuando', titulo: 'Fecha y hora', render: (m) => cuando(m.instante) },
  { clave: 'evento', titulo: 'Evento', render: (m) => NOMBRE_MARCACION[m.tipo] },
  { clave: 'distancia', titulo: 'Distancia al hospital', render: (m) => metros(m.distanciaAlHospitalMetros), alineacion: 'derecha' },
]

const COLUMNAS_INTENTOS: ColumnaTabla<IntentoMarcacionDto>[] = [
  { clave: 'cuando', titulo: 'Fecha y hora', render: (i) => cuando(i.instante) },
  { clave: 'evento', titulo: 'Evento', render: (i) => NOMBRE_MARCACION[i.tipo] },
  { clave: 'motivo', titulo: 'Motivo', render: (i) => TEXTO_MOTIVO_RECHAZO[i.motivo] },
  { clave: 'distancia', titulo: 'Distancia al hospital', render: (i) => metros(i.distanciaAlHospitalMetros), alineacion: 'derecha' },
]

/**
 * Historial propio del trabajador (HU-05, CA-5): las marcaciones registradas y, **aparte**, los intentos
 * rechazados, con su motivo. Aclara que la ubicación es «capturada, no validada por el servidor» (D13).
 * Solo muestra los más recientes; no modifica nada.
 */
export function HistorialPropio({ historial }: { historial: HistorialMarcaciones }) {
  return (
    <div className="historial-propio">
      <Aviso tipo="info">Las ubicaciones se capturan en tu dispositivo y no están validadas por el servidor: esta es una demostración.</Aviso>
      <h3>Marcaciones registradas</h3>
      <Tabla
        columnas={COLUMNAS_MARCACIONES}
        filas={historial.marcaciones.slice(0, MAXIMO_FILAS)}
        clavePorFila={(m) => m.id}
        descripcion="Tus marcaciones registradas, de la más reciente a la más antigua"
        vacio={<EstadoVacio titulo="Sin marcaciones" descripcion="Aún no tienes marcaciones registradas." />}
      />
      <h3>Intentos rechazados</h3>
      <Tabla
        columnas={COLUMNAS_INTENTOS}
        filas={historial.intentos.slice(0, MAXIMO_FILAS)}
        clavePorFila={(i) => i.id}
        descripcion="Tus intentos de marcación rechazados, del más reciente al más antiguo"
        vacio={<EstadoVacio titulo="Sin intentos rechazados" descripcion="No tienes intentos rechazados." />}
      />
    </div>
  )
}
