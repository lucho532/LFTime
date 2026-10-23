/**
 * Identificadores de los textos de ayuda y de error de un campo de formulario, derivados del
 * identificador del control, para enlazarlos con `aria-describedby`.
 */
export function idsDeCampo(id: string) {
  return { ayuda: `${id}-ayuda`, error: `${id}-error` }
}
