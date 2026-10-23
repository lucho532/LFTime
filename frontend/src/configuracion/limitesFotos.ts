/**
 * Límites de las fotos de perfil de la demostración (spec D24, D35). No son reglas laborales: son
 * límites técnicos de la demostración, sujetos a la validación legal de producción (P-13).
 */

/** Tamaño máximo final de una foto: 2 MB. Una foto más pesada se comprime automáticamente. */
export const LIMITE_BYTES_FOTO = 2 * 1024 * 1024

/** Máximo de fotos guardadas en el navegador durante la demostración (hay 48 trabajadores y 8 usuarios). */
export const MAXIMO_FOTOS_DEMO = 100

/** Lados máximos (en píxeles) que se prueban, de mayor a menor, al comprimir una foto. */
export const LADOS_MAXIMOS_PRUEBA = [1600, 1200, 800, 512]

/** Calidades de compresión que se prueban, de mayor a menor, para cada lado máximo. */
export const CALIDADES_PRUEBA = [0.85, 0.7, 0.55, 0.4]

/** Formatos admitidos: tipo MIME y extensiones aceptadas. */
export const FORMATOS_FOTO: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
}
