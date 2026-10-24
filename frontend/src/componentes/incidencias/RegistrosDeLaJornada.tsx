import type { MarcacionDto } from '../../contratos/marcacion'
import { NOMBRE_MARCACION } from '../../modelos/etiquetasMarcacion'
import { formatearHora12 } from '../../utilidades/horaColombia'
import { EnlaceUbicacion } from '../base/EnlaceUbicacion'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'

const COLUMNAS: ColumnaTabla<MarcacionDto>[] = [
  { clave: 'evento', titulo: 'Evento', render: (m) => NOMBRE_MARCACION[m.tipo] },
  { clave: 'hora', titulo: 'Hora', render: (m) => formatearHora12(new Date(m.instante)) },
  { clave: 'ubicacion', titulo: 'Ubicación', render: (m) => <EnlaceUbicacion ubicacion={m.ubicacion} /> },
]

/**
 * Registros válidos de la jornada de la incidencia (HU-06): qué eventos se marcaron, a qué hora y desde
 * qué ubicación, para que quien revisa tenga el contexto. La ubicación es «capturada», no validada por un
 * servidor (D13). Solo muestra; los intentos rechazados se listan aparte (CA-5).
 */
export function RegistrosDeLaJornada({ marcaciones }: { marcaciones: MarcacionDto[] }) {
  return (
    <Tabla
      columnas={COLUMNAS}
      filas={marcaciones}
      clavePorFila={(m) => m.id}
      descripcion="Registros de la jornada de la incidencia"
      vacio={<EstadoVacio titulo="Sin registros ese día" descripcion="La persona no tiene marcaciones válidas en esta jornada." />}
    />
  )
}
