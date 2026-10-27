import { useState } from 'react'
import { servicios } from '../servicios/fabrica'
import { validarCorreo } from '../validadores/correo'

/**
 * Acciones de la recuperación de acceso: validan lo escrito y llaman al servicio. Cada acción devuelve el motivo
 * del rechazo o `null` si salió bien. No envía correos: eso es del backend (Fase 2).
 */
export function useRecuperacionAcceso() {
  const [enviando, setEnviando] = useState(false)

  async function ejecutar(accion: () => Promise<void>): Promise<string | null> {
    setEnviando(true)
    try {
      await accion()
      return null
    } catch {
      return 'No se pudo completar la solicitud. Inténtalo de nuevo.'
    } finally {
      setEnviando(false)
    }
  }

  async function solicitarEnlace(correo: string): Promise<string | null> {
    const motivo = validarCorreo(correo)
    if (motivo) return motivo
    return ejecutar(() => servicios.recuperacionAcceso.solicitarEnlace(correo.trim()))
  }

  async function restablecer(codigo: string, nueva: string, confirmacion: string): Promise<string | null> {
    if (!nueva) return 'Escribe la contraseña nueva.'
    if (nueva !== confirmacion) return 'Las dos contraseñas no coinciden.'
    return ejecutar(() => servicios.recuperacionAcceso.restablecerContrasena(codigo, nueva))
  }

  return { enviando, solicitarEnlace, restablecer }
}
