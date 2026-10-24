import { describe, expect, it } from 'vitest'

/**
 * Comprobaciones automáticas de reglas de código de la constitución que son fáciles de romper sin darse
 * cuenta (T-12.5): sin servicios externos (CA-10), ExcelJS aislado (D34), la hora solo por `horaColombia`
 * (R-9), y CSS de un solo dueño (R-6). Leen el código fuente con `import.meta.glob`; no ejecutan la
 * aplicación ni necesitan librerías nuevas.
 */
const FUENTES = import.meta.glob(['../../**/*.ts', '../../**/*.tsx', '!../../pruebas/**'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const ESTILOS = Object.keys(import.meta.glob('../../estilos/**/*.css', { query: '?raw', import: 'default', eager: true }))

const nombre = (ruta: string) => ruta.replace('../../', '')
const sinComentarios = (codigo: string) => codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const rutas = Object.keys(FUENTES)

describe('reglas de código verificadas sobre el código fuente', () => {
  it('lee el código fuente (guarda contra una prueba que no comprueba nada)', () => {
    expect(rutas.length).toBeGreaterThan(100)
    expect(rutas.some((ruta) => ruta.includes('/pruebas/'))).toBe(false)
  })

  it('CA-10: ningún archivo llama a servicios externos ni usa direcciones http(s) fuera de comentarios', () => {
    // Única excepción (D38): `enlaceMapa.ts` construye el enlace «Abrir en Maps» que la persona pulsa; no hace ninguna petición.
    const sospechosos = rutas.filter((ruta) => !ruta.endsWith('/utilidades/enlaceMapa.ts') && /\bfetch\s*\(|XMLHttpRequest|axios|navigator\.sendBeacon|https?:\/\//.test(sinComentarios(FUENTES[ruta])))
    expect(sospechosos.map(nombre)).toEqual([])
  })

  it('D38: el enlace a Maps solo lo usa el componente que lo muestra como enlace', () => {
    const usan = rutas.filter((ruta) => FUENTES[ruta].includes('crearEnlaceMapa') && !ruta.endsWith('enlaceMapa.ts'))
    expect(usan.map(nombre)).toEqual(['componentes/base/EnlaceUbicacion.tsx'])
  })

  it('D34: solo ExportadorExcelExceljs importa exceljs', () => {
    const importan = rutas.filter((ruta) => /(from|import\()\s*['"]exceljs['"]/.test(FUENTES[ruta]))
    expect(importan.map(nombre)).toEqual(['utilidades/exportacion/ExportadorExcelExceljs.ts'])
  })

  it('R-9: nadie pide la hora actual con new Date() o Date.now() fuera de horaColombia', () => {
    const sueltos = rutas.filter((ruta) => !ruta.endsWith('/utilidades/horaColombia.ts') && /new Date\(\s*\)|Date\.now\(\)/.test(sinComentarios(FUENTES[ruta])))
    // `identificadores.ts` usa Date.now solo como respaldo para generar un identificador, no para la hora de negocio.
    expect(sueltos.map(nombre)).toEqual(['utilidades/identificadores.ts'])
  })

  it('R-4: solo servicios/demo, repositorios y la fábrica conocen los repositorios; solo hooks, páginas y la fábrica usan los servicios concretos', () => {
    const dentroDeRepositorios = (ruta: string) => ruta.includes('/repositorios/') || ruta.includes('/servicios/demo/') || ruta.includes('/mapeadores/')
    const usanRepositorios = rutas.filter((ruta) => !dentroDeRepositorios(ruta) && /from\s+['"][^'"]*repositorios\//.test(FUENTES[ruta]))
    expect(usanRepositorios.map(nombre)).toEqual([])
    const componentesConFabrica = rutas.filter((ruta) => ruta.includes('/componentes/') && /servicios\/fabrica/.test(FUENTES[ruta]))
    expect(componentesConFabrica.map(nombre)).toEqual([])
  })

  it('R-6: cada archivo CSS lo importa un solo archivo y ninguno queda sin importar', () => {
    const cuentas = new Map<string, number>()
    for (const ruta of rutas) {
      for (const [, css] of FUENTES[ruta].matchAll(/import\s+['"][^'"]*\/([\w-]+\.css)['"]/g)) {
        cuentas.set(css, (cuentas.get(css) ?? 0) + 1)
      }
    }
    expect([...cuentas].filter(([, veces]) => veces > 1).map(([css]) => css)).toEqual([])
    const sinImportar = ESTILOS.map((ruta) => ruta.split('/').pop() ?? '').filter((css) => css !== 'index.css' && !cuentas.has(css))
    expect(sinImportar).toEqual([])
  })
})
