/** Temas de la interfaz (D32). */
export type Tema = 'claro' | 'oscuro'

/**
 * Clave de la preferencia de tema. No lleva el prefijo `lftime.demo.` a propósito: restablecer los datos
 * de demostración no debe cambiar cómo prefiere ver la aplicación la persona.
 */
export const CLAVE_PREFERENCIA_TEMA = 'lftime.preferencia.tema'

/** Tema guardado por la persona; `null` si no hay o el navegador no permite leer el almacenamiento. */
export function leerTemaGuardado(): Tema | null {
  try {
    const valor = window.localStorage.getItem(CLAVE_PREFERENCIA_TEMA)
    return valor === 'claro' || valor === 'oscuro' ? valor : null
  } catch {
    return null
  }
}

/** Tema que prefiere el sistema operativo; «claro» si el navegador no lo informa. */
export function leerTemaDelSistema(): Tema {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

/** Tema con el que arranca la aplicación: el guardado y, si no hay, el del sistema. */
export function obtenerTemaInicial(): Tema {
  return leerTemaGuardado() ?? leerTemaDelSistema()
}

/** Activa un tema en toda la interfaz (atributo `data-tema` de la raíz). No lo guarda. */
export function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.tema = tema
}

/** Guarda la preferencia de tema; si el navegador no deja guardar, el tema solo vale para esta visita. */
export function guardarTema(tema: Tema): void {
  try {
    window.localStorage.setItem(CLAVE_PREFERENCIA_TEMA, tema)
  } catch {
    // Sin almacenamiento: la preferencia no se conserva, pero el cambio sigue aplicado.
  }
}
