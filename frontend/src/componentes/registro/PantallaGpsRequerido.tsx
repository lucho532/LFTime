import '../../estilos/componentes/PantallaGpsRequerido.css'
import type { ReactNode } from 'react'
import { Boton } from '../base/Boton'
import { Icono } from '../iconos/Icono'
import { CajaMovil } from '../movil/CajaMovil'

interface PropiedadesPantallaGpsRequerido {
  /** Explicación del último intento fallido (por ejemplo, el permiso bloqueado), ya redactada. */
  explicacion: ReactNode
  reintentando: boolean
  onActivar: () => void
  onCancelar: () => void
}

/**
 * Pantalla «Se requiere tu ubicación»: aparece cuando el dispositivo no entregó una ubicación utilizable
 * (permiso denegado, GPS apagado, tiempo agotado, precisión insuficiente). Es un fallo técnico, no una ubicación
 * indebida (CA-14). «Activar ubicación» vuelve a pedirla al dispositivo; nunca se simula. El dibujo del mapa
 * es solo ilustrativo y no muestra la posición real.
 */
export function PantallaGpsRequerido({ explicacion, reintentando, onActivar, onCancelar }: PropiedadesPantallaGpsRequerido) {
  return (
    <section className="pantalla-gps">
      <span className="pantalla-gps__pin">
        <Icono nombre="hospitales" tamano={40} />
      </span>
      <h1>Se requiere tu ubicación</h1>
      <p>Para registrar tu entrada o salida, es obligatorio tener activado el GPS en tu dispositivo.</p>
      <svg className="pantalla-gps__mapa" viewBox="0 0 240 110" role="img" aria-label="Dibujo ilustrativo de un mapa">
        <rect width="240" height="110" rx="12" className="pantalla-gps__fondo" />
        <path d="M0 30h240M0 75h240M60 0v110M150 0v110M200 0v110" className="pantalla-gps__calles" />
        <circle cx="105" cy="58" r="34" className="pantalla-gps__radio" />
        <path d="M105 30a8 8 0 0 0-8 8c0 6 8 15 8 15s8-9 8-15a8 8 0 0 0-8-8z" className="pantalla-gps__marca" />
      </svg>
      <div className="pantalla-gps__explicacion">{explicacion}</div>
      <Boton className="pantalla-gps__boton" cargando={reintentando} onClick={onActivar}>
        {reintentando ? 'Obteniendo tu ubicación…' : 'Activar ubicación'}
      </Boton>
      <Boton variante="secundario" className="pantalla-gps__boton" disabled={reintentando} onClick={onCancelar}>
        Cancelar
      </Boton>
      <CajaMovil icono="info">Si no puedes activar el GPS, comunícate con tu coordinador.</CajaMovil>
    </section>
  )
}
