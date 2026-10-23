import { calcularFechaOperativa } from '../../reglas/fechaOperativa'
import { detectarIncidencias } from '../../reglas/detectarIncidencias'
import { obtenerHorarioVigente } from '../../reglas/horarioVigente'
import { repositorios } from '../../repositorios/demo/repositorios'
import { obtenerAhoraUtc } from '../../utilidades/horaColombia'
import { abrirIncidencia } from './abrirIncidencia'

/**
 * Evalúa las reglas de detección (`reglas/detectarIncidencias`) sobre la jornada actual de cada trabajador
 * y abre las incidencias y alertas que aún no existen. Devuelve cuántas abrió.
 *
 * Solo mira la fecha operativa de «ahora»: los días anteriores ya traen sus incidencias de la semilla. Es
 * idempotente y solo añade (R-10). En la Fase 1 corre en el navegador cuando alguien abre una pantalla;
 * en la Fase 2 lo hará el servidor de forma continua. No impone ninguna consecuencia (P-18).
 */
export function sincronizarIncidencias(): number {
  const ahora = obtenerAhoraUtc()
  const reglas = repositorios.configuracion.obtener()
  const hospitales = repositorios.hospitales.listar()
  const horarios = repositorios.horarios.listar()
  const marcaciones = repositorios.marcaciones.listar()
  let abiertas = 0

  for (const trabajador of repositorios.trabajadores.listar()) {
    const hospital = hospitales.find((h) => h.id === trabajador.hospitalId)
    if (!hospital) continue
    const horariosDelTrabajador = horarios.filter((h) => h.trabajadorId === trabajador.id)
    const fechaOperativa = calcularFechaOperativa(ahora, horariosDelTrabajador, trabajador.id)
    const detectadas = detectarIncidencias({
      estadoTrabajador: trabajador.estado,
      horario: obtenerHorarioVigente(horariosDelTrabajador, trabajador.id, fechaOperativa),
      fechaOperativa,
      marcaciones: marcaciones.filter((m) => m.trabajadorId === trabajador.id && m.fechaOperativa === fechaOperativa),
      ahora,
      reglas,
      hospitalAdmiteMarcacion: hospital.coordenadas?.confirmadas === true,
    })
    for (const detectada of detectadas) {
      const antes = repositorios.incidencias.listar().length
      abrirIncidencia({
        tipo: detectada.tipo,
        trabajadorId: trabajador.id,
        hospital,
        fechaOperativa,
        detectadaEn: detectada.detectadaEn.toISOString(),
      })
      abiertas += repositorios.incidencias.listar().length - antes
    }
  }
  return abiertas
}
