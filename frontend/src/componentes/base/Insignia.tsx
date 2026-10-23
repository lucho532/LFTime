import '../../estilos/componentes/Insignia.css'

/** Tonos de color de una insignia. Solo decide el aspecto: el significado siempre lo da el texto (R-7); no se usa como único medio de informar. */
export type TonoInsignia = 'verde' | 'azul' | 'ambar' | 'rojo' | 'gris'

interface PropiedadesInsignia {
  texto: string
  tono: TonoInsignia
  /** Símbolo decorativo; el significado siempre lo da el texto. */
  icono?: string
}

/**
 * Etiqueta corta de color con texto. El texto es obligatorio: ningún significado depende solo
 * del color (R-7). No conoce los estados del negocio: para eso existe `InsigniaEstado`.
 */
export function Insignia({ texto, tono, icono }: PropiedadesInsignia) {
  return (
    <span className={`insignia insignia--${tono}`}>
      {icono && <span aria-hidden="true">{icono}</span>}
      {texto}
    </span>
  )
}
