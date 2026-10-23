import '../../estilos/componentes/Avatar.css'

interface PropiedadesAvatar {
  nombreCompleto: string
  urlFoto: string | null
  /** Resultado de la regla de permiso (`puedeVerFoto`). Si es falso, nunca se muestra la foto. */
  puedeVerFoto: boolean
  tamano?: 'pequeno' | 'mediano' | 'grande'
}

function iniciales(nombreCompleto: string): string {
  return nombreCompleto
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')
}

/**
 * Imagen de perfil de una persona.
 *
 * Muestra la foto solo si existe y la persona observadora tiene permiso; en cualquier otro caso
 * muestra las iniciales sobre un fondo neutro. La aplicación funciona igual sin foto. No decide
 * permisos: recibe el resultado ya calculado.
 */
export function Avatar({ nombreCompleto, urlFoto, puedeVerFoto, tamano = 'mediano' }: PropiedadesAvatar) {
  const mostrarFoto = puedeVerFoto && urlFoto !== null
  return (
    <span className={`avatar avatar--${tamano}`}>
      {mostrarFoto ? (
        <img className="avatar__imagen" src={urlFoto} alt={`Foto de ${nombreCompleto}`} />
      ) : (
        <span className="avatar__iniciales" role="img" aria-label={`Sin foto visible de ${nombreCompleto}`}>
          {iniciales(nombreCompleto)}
        </span>
      )}
    </span>
  )
}
