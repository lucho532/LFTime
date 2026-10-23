/**
 * Resultado calculado de una jornada. No es un dato almacenado: lo producen las reglas.
 * Un valor `null` significa cómputo incompleto; nunca se muestra una duración estimada (D16).
 */
export interface JornadaCalculadaDto {
  trabajadorId: string
  fechaOperativa: string
  programadaMinutos: number
  efectivoMinutos: number | null
  almuerzoMinutos: number | null
  totalMinutos: number | null
  completa: boolean
  estadoActual: string
}
