import { useCallback, useState } from 'react'
import { aplicarTema, guardarTema, obtenerTemaInicial, type Tema } from '../utilidades/tema'

/**
 * Tema actual de la interfaz (D32) y la acción de alternarlo entre claro y oscuro. Al alternar lo aplica a
 * toda la pantalla y guarda la preferencia. El tema inicial se aplica al arrancar (`main.tsx`). No decide
 * cómo se ve cada componente: eso lo hacen los tokens de `index.css`.
 */
export function useTema() {
  const [tema, setTema] = useState<Tema>(() => {
    const aplicado = document.documentElement.dataset.tema
    return aplicado === 'oscuro' || aplicado === 'claro' ? aplicado : obtenerTemaInicial()
  })
  const alternar = useCallback(() => {
    const siguiente: Tema = tema === 'claro' ? 'oscuro' : 'claro'
    aplicarTema(siguiente)
    guardarTema(siguiente)
    setTema(siguiente)
  }, [tema])
  return { tema, alternar }
}
