import { aHospital } from '../../mapeadores/hospitalMapeador'
import { aTrabajador } from '../../mapeadores/trabajadorMapeador'
import type { DatosInformes } from '../../modelos/informe'
import { repositorios } from '../../repositorios/demo/repositorios'
import { hoyColombia, obtenerAhoraUtc } from '../../utilidades/horaColombia'
import type { IInformeServicio } from '../IInformeServicio'
import { sincronizarIncidencias } from './sincronizarIncidencias'

/**
 * Implementación de demostración de `IInformeServicio`: lee lo guardado en el almacenamiento local, tras
 * dejar que las reglas de detección abran las incidencias de hoy. Solo lee; los cálculos de los informes
 * son provisionales (P-03, P-05, P-06) y viven en `reglas/informes`.
 */
export class InformeServicioDemo implements IInformeServicio {
  async obtenerDatos(): Promise<DatosInformes> {
    sincronizarIncidencias()
    const hoy = hoyColombia()
    return {
      ahora: obtenerAhoraUtc().toISOString(),
      reglas: repositorios.configuracion.obtener(),
      trabajadores: repositorios.trabajadores.listar().map(aTrabajador),
      hospitales: repositorios.hospitales.listar().map((dto) => aHospital(dto, hoy)),
      municipios: repositorios.municipios.listar(),
      nombresUsuarios: Object.fromEntries(repositorios.usuarios.listar().map((u) => [u.id, `${u.nombres} ${u.apellidos}`])),
      horarios: repositorios.horarios.listar(),
      marcaciones: repositorios.marcaciones.listar(),
      intentos: repositorios.intentos.listar(),
      incidencias: repositorios.incidencias.listar(),
    }
  }
}
