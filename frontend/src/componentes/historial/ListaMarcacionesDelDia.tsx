import '../../estilos/componentes/ListaMarcacionesDelDia.css'
import type { MarcacionDto, TipoMarcacion } from '../../contratos/marcacion'
import { NOMBRE_MARCACION } from '../../modelos/etiquetasMarcacion'
import { formatearHora12 } from '../../utilidades/horaColombia'
import { EnlaceUbicacion } from '../base/EnlaceUbicacion'
import { Icono, type NombreIconoVisible } from '../iconos/Icono'

const PRESENTACION: Record<TipoMarcacion, { icono: NombreIconoVisible; tono: 'verde' | 'ambar' | 'azul' | 'rojo' }> = {
  ENTRADA: { icono: 'entrada', tono: 'verde' },
  SALIDA_ALMUERZO: { icono: 'cubiertos', tono: 'ambar' },
  REGRESO_ALMUERZO: { icono: 'entrada', tono: 'azul' },
  SALIDA_FINAL: { icono: 'salida', tono: 'rojo' },
}

interface PropiedadesListaMarcacionesDelDia {
  /** Marcaciones del día, de la más antigua a la más reciente. */
  marcaciones: MarcacionDto[]
  nombreDeHospital: (hospitalId: string) => string
}

/**
 * Lista de los registros de un día: evento (siempre con texto además de icono y color), hora, hospital y
 * ubicación capturada como enlace (D38). Solo muestra; no modifica nada registrado (R-10).
 */
export function ListaMarcacionesDelDia({ marcaciones, nombreDeHospital }: PropiedadesListaMarcacionesDelDia) {
  return (
    <ul className="lista-marcaciones-dia" aria-label="Registros del día">
      {marcaciones.map((marcacion) => {
        const { icono, tono } = PRESENTACION[marcacion.tipo]
        return (
          <li key={marcacion.id} className="lista-marcaciones-dia__fila">
            <span className={`lista-marcaciones-dia__icono lista-marcaciones-dia__icono--${tono}`}>
              <Icono nombre={icono} />
            </span>
            <div className="lista-marcaciones-dia__datos">
              <strong>{NOMBRE_MARCACION[marcacion.tipo]}</strong>
              <span>{formatearHora12(new Date(marcacion.instante))}</span>
              <small>{nombreDeHospital(marcacion.hospitalId)}</small>
              <small>
                <EnlaceUbicacion ubicacion={marcacion.ubicacion} />
              </small>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
