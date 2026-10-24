import type { ReactNode } from 'react'
import '../../estilos/componentes/CajaMovil.css'
import { Icono, type NombreIconoVisible } from '../iconos/Icono'

interface PropiedadesCajaMovil {
  tono?: 'verde' | 'ambar' | 'azul' | 'neutro'
  icono?: NombreIconoVisible
  titulo?: string
  children?: ReactNode
}

/**
 * Caja de color con un icono, un título y un texto, base de los avisos y resúmenes de la aplicación móvil.
 * El color acompaña al texto, nunca lo reemplaza (R-7). No decide cuándo mostrarse.
 */
export function CajaMovil({ tono = 'neutro', icono, titulo, children }: PropiedadesCajaMovil) {
  return (
    <div className={`caja-movil caja-movil--${tono}`}>
      {icono && (
        <span className="caja-movil__icono">
          <Icono nombre={icono} />
        </span>
      )}
      <div className="caja-movil__texto">
        {titulo && <strong className="caja-movil__titulo">{titulo}</strong>}
        {children && <div className="caja-movil__detalle">{children}</div>}
      </div>
    </div>
  )
}
