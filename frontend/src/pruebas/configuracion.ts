/**
 * Configuración común de las pruebas: habilita las comprobaciones de DOM
 * (`toBeInTheDocument`, etc.) de Testing Library, limpia el DOM entre pruebas y suple las
 * direcciones temporales de archivos (`URL.createObjectURL`), que jsdom no implementa.
 * No debe contener datos de prueba ni lógica de negocio.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:foto-de-prueba'
  URL.revokeObjectURL = () => undefined
}

afterEach(() => cleanup())
