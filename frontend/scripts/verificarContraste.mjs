// Verifica el contraste (WCAG, 4.5:1 para texto normal) de los pares de colores de `src/estilos/index.css`
// en el tema claro y en el oscuro (D32, T-12.3).
// Responsabilidad: leer los tokens, calcular el contraste de cada par e informar los que no llegan.
// No debe modificar archivos. Los pares son los que usa la interfaz: texto sobre superficie, estados
// sobre su fondo y texto blanco sobre botones y barras.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const MINIMO = 4.5
const css = readFileSync(join(process.cwd(), 'src', 'estilos', 'index.css'), 'utf8')
const MARCA_TEMA_OSCURO = ":root[data-tema='oscuro']"

const leerTokens = (texto) => Object.fromEntries([...texto.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))
const inicioOscuro = css.indexOf(MARCA_TEMA_OSCURO)
const claro = leerTokens(css.slice(0, inicioOscuro))
const oscuro = { ...claro, ...leerTokens(css.slice(inicioOscuro, css.indexOf('}', inicioOscuro))) }

function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contraste(a, b) {
  const [claroLum, oscuroLum] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (claroLum + 0.05) / (oscuroLum + 0.05)
}

const PARES = [
  ['color-texto', 'color-superficie'], ['color-texto', 'color-fondo'], ['color-texto-suave', 'color-superficie'], ['color-texto-suave', 'color-fondo'],
  ['color-titulo', 'color-superficie'], ['color-titulo', 'color-fondo'], ['color-acento', 'color-superficie'], ['color-acento', 'color-fondo'],
  ['color-acento', 'color-marca-claro'], ['color-texto', 'color-marca-claro'], ['color-titulo', 'color-marca-claro'],
  ['color-texto-sobre-marca', 'color-marca-electrico'], ['color-texto-sobre-marca', 'color-peligro'], ['color-texto-sobre-marca', 'color-marca-oscuro'],
  ['color-estado-jornada', 'color-estado-jornada-fondo'], ['color-estado-almuerzo', 'color-estado-almuerzo-fondo'],
  ['color-estado-aviso', 'color-estado-aviso-fondo'], ['color-estado-critico', 'color-estado-critico-fondo'],
  ['color-estado-jornada', 'color-superficie'], ['color-estado-critico', 'color-superficie'], ['color-estado-aviso', 'color-superficie'],
  ['color-demo-texto', 'color-demo-fondo'], ['color-gris-texto', 'color-gris-fondo'], ['color-demo-texto', 'color-estado-aviso-fondo'],
  ['color-foco', 'color-superficie'],
]

let fallos = 0
for (const [nombre, paleta] of [['claro', claro], ['oscuro', oscuro]]) {
  for (const [texto, fondo] of PARES) {
    const valor = contraste(paleta[texto], paleta[fondo])
    if (valor < MINIMO) {
      fallos += 1
      console.error(`Tema ${nombre}: ${texto} (${paleta[texto]}) sobre ${fondo} (${paleta[fondo]}) tiene ${valor.toFixed(2)}:1`)
    }
  }
}

if (fallos > 0) {
  console.error(`${fallos} par(es) de colores no llegan a ${MINIMO}:1.`)
  process.exit(1)
}
console.log(`Verificación de contraste correcta: ${PARES.length} pares en los dos temas, todos con al menos ${MINIMO}:1.`)
