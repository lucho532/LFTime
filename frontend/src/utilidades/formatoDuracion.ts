/**
 * Muestra minutos como «8 h 05 min». Un valor `null` es un cómputo incompleto y se muestra como tal:
 * nunca se presenta una duración estimada como definitiva (D16).
 */
export function formatearDuracion(minutos: number | null): string {
  if (minutos === null) {
    return 'Incompleto'
  }
  const total = Math.max(0, Math.round(minutos))
  const horas = Math.floor(total / 60)
  const resto = String(total % 60).padStart(2, '0')
  return horas > 0 ? `${horas} h ${resto} min` : `${total} min`
}

/** Muestra segundos como «02:15:07» (contador de referencia, no oficial). */
export function formatearContador(segundos: number): string {
  const total = Math.max(0, Math.floor(segundos))
  const parte = (valor: number) => String(valor).padStart(2, '0')
  return `${parte(Math.floor(total / 3600))}:${parte(Math.floor((total % 3600) / 60))}:${parte(total % 60)}`
}
