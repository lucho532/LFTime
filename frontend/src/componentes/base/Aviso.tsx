import type { ReactNode } from 'react'
import '../../estilos/componentes/Aviso.css'

type TipoAviso = 'info' | 'exito' | 'advertencia' | 'error'

const ROTULO_POR_TIPO: Record<TipoAviso, string> = {
  info: 'Información',
  exito: 'Listo',
  advertencia: 'Atención',
  error: 'Error',
}

interface PropiedadesAviso {
  tipo?: TipoAviso
  titulo?: string
  children: ReactNode
}

/**
 * Mensaje destacado dentro de una pantalla.
 *
 * El tipo se comunica siempre con un rótulo de texto además del color (R-7). Los errores se
 * anuncian como alerta; los demás, como estado. No decide cuándo mostrarse.
 */
export function Aviso({ tipo = 'info', titulo, children }: PropiedadesAviso) {
  return (
    <div className={`aviso aviso--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <strong className="aviso__rotulo">{titulo ?? ROTULO_POR_TIPO[tipo]}.</strong> <span>{children}</span>
    </div>
  )
}
