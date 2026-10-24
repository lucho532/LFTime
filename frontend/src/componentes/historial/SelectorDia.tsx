import { useId } from 'react'
import '../../estilos/componentes/SelectorDia.css'
import { formatearFechaDia } from '../../utilidades/horaColombia'
import { Icono } from '../iconos/Icono'

interface PropiedadesSelectorDia {
  /** Fecha elegida `AAAA-MM-DD`. */
  fecha: string
  /** Última fecha que se puede elegir (hoy en Colombia). */
  maxima: string
  onCambiar: (fecha: string) => void
}

/**
 * Selector del día del historial: muestra la fecha como «27 oct. 2025» y abre el calendario del dispositivo.
 * No permite fechas futuras. No carga datos: avisa de la fecha elegida.
 */
export function SelectorDia({ fecha, maxima, onCambiar }: PropiedadesSelectorDia) {
  const idEntrada = useId()
  return (
    <label className="selector-dia" htmlFor={idEntrada}>
      <Icono nombre="jornadas" />
      <span className="selector-dia__texto">
        <small>Día</small>
        <strong>{formatearFechaDia(fecha)}</strong>
      </span>
      <input id={idEntrada} className="selector-dia__entrada" type="date" value={fecha} max={maxima} onChange={(e) => e.target.value && onCambiar(e.target.value)} aria-label="Elegir el día del historial" />
    </label>
  )
}
