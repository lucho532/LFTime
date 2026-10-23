import { createContext } from 'react'
import type { Usuario } from '../modelos/usuario'

/** Lo que comparte la sesión simulada con el resto de la interfaz. */
export interface ValorSesion {
  /** Usuario con sesión iniciada; `null` si no hay. */
  usuario: Usuario | null
  /** Verdadero mientras se recupera la sesión guardada al abrir la aplicación. */
  cargando: boolean
  ingresar: (usuarioId: string) => Promise<Usuario>
  salir: () => Promise<void>
}

/** Contexto de la sesión. Se provee con `ProveedorSesion` y se consume con `useSesion`. */
export const ContextoSesion = createContext<ValorSesion | null>(null)
