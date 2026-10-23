import type { AlertaVisible } from '../../modelos/alerta'
import { repositorios } from '../../repositorios/demo/repositorios'
import type { IAlertaServicio } from '../IAlertaServicio'
import { sincronizarIncidencias } from './sincronizarIncidencias'

/**
 * Implementación de demostración de `IAlertaServicio`. Antes de listar evalúa las reglas de detección para
 * que las alertas del día existan. Una alerta cuya incidencia no se encuentra se omite. No borra alertas.
 */
export class AlertaServicioDemo implements IAlertaServicio {
  async listar(): Promise<AlertaVisible[]> {
    sincronizarIncidencias()
    const incidencias = new Map(repositorios.incidencias.listar().map((incidencia) => [incidencia.id, incidencia]))
    return repositorios.alertas
      .listar()
      .flatMap((alerta) => {
        const incidencia = incidencias.get(alerta.incidenciaId)
        return incidencia ? [{ ...alerta, tipo: incidencia.tipo, trabajadorId: incidencia.trabajadorId, hospitalId: incidencia.hospitalId }] : []
      })
      .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn))
  }

  async marcarRevisadaDeIncidencia(incidenciaId: string): Promise<void> {
    const alerta = repositorios.alertas.listar().find((candidata) => candidata.incidenciaId === incidenciaId)
    if (alerta && !alerta.revisada) {
      repositorios.alertas.guardar({ ...alerta, revisada: true })
    }
  }
}
