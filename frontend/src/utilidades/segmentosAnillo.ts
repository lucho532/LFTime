/** Un tramo de un gráfico de anillo, en la escala de 0 a 100 de la circunferencia (`pathLength={100}`). */
export interface SegmentoAnillo<Clave extends string = string> {
  /** Identificador del grupo al que pertenece el tramo. */
  clave: Clave
  /** Largo del tramo: su parte del total, entre 0 y 100. */
  largo: number
  /** Posición donde empieza el tramo (suma de los largos anteriores). */
  inicio: number
}

/**
 * Reparte una circunferencia entre grupos en proporción a su cantidad, para dibujar un gráfico de anillo.
 * Los grupos sin cantidad no ocupan espacio y, si el total es cero, no hay tramos. Solo hace la geometría:
 * no sabe qué representa cada grupo ni su color.
 */
export function calcularSegmentosAnillo<Clave extends string>(grupos: Array<{ clave: Clave; cantidad: number }>): Array<SegmentoAnillo<Clave>> {
  const total = grupos.reduce((suma, grupo) => suma + grupo.cantidad, 0)
  if (total <= 0) {
    return []
  }
  let inicio = 0
  return grupos
    .filter((grupo) => grupo.cantidad > 0)
    .map((grupo) => {
      const largo = (grupo.cantidad / total) * 100
      const segmento = { clave: grupo.clave, largo, inicio }
      inicio += largo
      return segmento
    })
}
