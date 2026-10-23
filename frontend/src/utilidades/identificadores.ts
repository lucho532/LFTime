/**
 * Genera identificadores únicos con un prefijo legible (por ejemplo `hosp-3f2a…`).
 * Solo se usa en la demostración, donde no hay un servidor que asigne identificadores.
 */
export function crearIdentificador(prefijo: string): string {
  const aleatorio = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  return `${prefijo}-${aleatorio.slice(0, 8)}`
}
