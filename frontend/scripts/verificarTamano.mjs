// Verifica la regla R-3 de la constitución: ningún archivo escrito a mano supera 250 líneas.
// Responsabilidad: recorrer `src/` y `scripts/` e informar los archivos que exceden el límite.
// No debe modificar archivos ni aplicar excepciones silenciosas.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const LIMITE_LINEAS = 250
const EXTENSIONES = new Set(['.ts', '.tsx', '.css', '.mjs', '.js'])
const CARPETAS = ['src', 'scripts']
const raiz = process.cwd()

function listarArchivos(carpeta) {
  const archivos = []
  for (const nombre of readdirSync(carpeta)) {
    const ruta = join(carpeta, nombre)
    if (statSync(ruta).isDirectory()) {
      archivos.push(...listarArchivos(ruta))
    } else if (EXTENSIONES.has(extname(ruta))) {
      archivos.push(ruta)
    }
  }
  return archivos
}

function contarLineas(ruta) {
  const texto = readFileSync(ruta, 'utf8')
  return texto === '' ? 0 : texto.replace(/\r?\n$/, '').split(/\r?\n/).length
}

const excedidos = []
let revisados = 0
for (const carpeta of CARPETAS) {
  for (const ruta of listarArchivos(join(raiz, carpeta))) {
    revisados += 1
    const lineas = contarLineas(ruta)
    if (lineas > LIMITE_LINEAS) {
      excedidos.push({ archivo: relative(raiz, ruta), lineas })
    }
  }
}

if (excedidos.length > 0) {
  console.error(`Archivos que superan ${LIMITE_LINEAS} líneas:`)
  for (const { archivo, lineas } of excedidos) {
    console.error(`  ${archivo}: ${lineas} líneas`)
  }
  process.exit(1)
}
console.log(`Verificación de tamaño correcta: ${revisados} archivos, ninguno supera ${LIMITE_LINEAS} líneas.`)
