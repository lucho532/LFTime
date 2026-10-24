import '../../estilos/componentes/EnlaceUbicacion.css'
import { Icono } from '../iconos/Icono'
import { crearEnlaceMapa, textoCoordenadas } from '../../utilidades/enlaceMapa'

interface PropiedadesEnlaceUbicacion {
  /** Ubicación capturada; si falta, se dice que no hay. */
  ubicacion?: { latitud: number; longitud: number }
  /** `compacta` muestra solo «Ver ubicación» con un pin (las coordenadas quedan en el nombre accesible y en la ayuda). */
  variante?: 'completa' | 'compacta'
}

/**
 * Muestra una ubicación capturada como coordenadas y un enlace «Abrir en Maps» que la abre en otra
 * pestaña o en la aplicación de mapas del teléfono (D38). Sin ubicación dice «Sin ubicación». Solo enlaza:
 * no consulta ningún servicio y no valida que la ubicación sea correcta (la validación real es del servidor).
 */
export function EnlaceUbicacion({ ubicacion, variante = 'completa' }: PropiedadesEnlaceUbicacion) {
  if (!ubicacion) {
    return <span>Sin ubicación</span>
  }
  const coordenadas = textoCoordenadas(ubicacion)
  if (variante === 'compacta') {
    return (
      <a className="enlace-ubicacion enlace-ubicacion--compacta" href={crearEnlaceMapa(ubicacion)} target="_blank" rel="noopener noreferrer" title={coordenadas} aria-label={`Abrir en Maps la ubicación ${coordenadas} (se abre en otra pestaña)`}>
        <Icono nombre="hospitales" tamano={16} />
        Ver ubicación
      </a>
    )
  }
  return (
    <span className="enlace-ubicacion">
      <span>{coordenadas}</span>
      <a href={crearEnlaceMapa(ubicacion)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir en Maps la ubicación ${coordenadas} (se abre en otra pestaña)`}>
        Abrir en Maps
      </a>
    </span>
  )
}
