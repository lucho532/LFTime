import { Link } from 'react-router-dom'
import type { Trabajador } from '../../modelos/trabajador'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'
import { InsigniaEstadoTrabajador } from '../personal/InsigniaEstadoTrabajador'

const COLUMNAS: ColumnaTabla<Trabajador>[] = [
  { clave: 'nombre', titulo: 'Nombre', render: (t) => <Link to={`/personal/${t.id}`}>{t.nombreCompleto}</Link> },
  { clave: 'cargo', titulo: 'Cargo', render: (t) => t.cargo },
  { clave: 'estado', titulo: 'Estado', render: (t) => <InsigniaEstadoTrabajador estado={t.estado} /> },
]

/**
 * Personal asignado a un hospital (HU-03). Cada nombre abre la ficha del trabajador. Quien no puede
 * abrir fichas ajenas (un trabajador) no ve esta sección, porque no puede entrar a hospitales.
 */
export function PersonalDelHospital({ trabajadores }: { trabajadores: Trabajador[] }) {
  return (
    <Tabla
      columnas={COLUMNAS}
      filas={trabajadores}
      clavePorFila={(t) => t.id}
      descripcion="Personal asignado al hospital"
      vacio={<EstadoVacio titulo="Sin personal asignado" descripcion="Todavía no hay trabajadores asignados a este hospital." />}
    />
  )
}
