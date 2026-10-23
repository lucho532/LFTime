import { useSesion } from '../../hooks/useSesion'
import { useUrlFoto } from '../../hooks/useUrlFoto'
import { puedeVerFoto, type PropietarioFoto } from '../../reglas/permisoFoto'
import { Avatar } from '../base/Avatar'

interface PropiedadesAvatarPersona {
  nombreCompleto: string
  propietario: PropietarioFoto
  /** Pista de que la persona tiene foto; si es `false` no se busca. Si se omite, se busca siempre. */
  tieneFoto?: boolean
  tamano?: 'pequeno' | 'mediano' | 'grande'
}

/**
 * Avatar de una persona conectado a la sesión: calcula con la regla `puedeVerFoto` si quien mira puede ver
 * la foto, la carga solo en ese caso y la muestra; si no, muestra las iniciales. No guarda ni cambia fotos.
 */
export function AvatarPersona({ nombreCompleto, propietario, tieneFoto, tamano }: PropiedadesAvatarPersona) {
  const { usuario } = useSesion()
  const permitido = puedeVerFoto(usuario, propietario)
  const url = useUrlFoto(propietario, permitido && tieneFoto !== false)
  return <Avatar nombreCompleto={nombreCompleto} urlFoto={url} puedeVerFoto={permitido} tamano={tamano} />
}
