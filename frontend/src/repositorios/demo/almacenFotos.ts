import { AlmacenFotosIndexedDb } from './AlmacenFotosIndexedDb'
import type { IAlmacenFotos } from './IAlmacenFotos'

/** Almacén de fotos de la demostración. Solo lo usa `FotoServicioDemo`; ningún componente debe importarlo. */
export const almacenFotos: IAlmacenFotos = new AlmacenFotosIndexedDb()
