/** Devuelve el motivo si el texto no parece un correo electrónico, o `null` si es aceptable. Solo revisa la forma. */
export function validarCorreo(texto: string): string | null {
  const correo = texto.trim()
  if (!correo) return 'Escribe tu correo electrónico.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Escribe un correo válido, por ejemplo nombre@dominio.com.'
  return null
}
