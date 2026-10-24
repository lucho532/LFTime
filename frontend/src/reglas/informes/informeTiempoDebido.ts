import { TEXTO_TIPO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import type { DatosInformes, DiaDeDeuda, FiltrosInforme, TablaInforme } from '../../modelos/informe'
import { detalleDeDiferencia } from './detalleDiferencia'
import { textoDiferencia } from './formatoInforme'
import { construirJornadas } from './jornadasDelPeriodo'
import { textoPeriodo } from './periodo'

/** Columnas provisionales del informe de tiempo por reponer (P-23). */
export const COLUMNAS_TIEMPO_DEBIDO = [
  'Trabajador', 'Debe en total', 'Aporte de la entrada', 'Aporte del almuerzo', 'Aporte de la salida', 'Días por debajo de lo programado', 'Jornadas completas', 'Hospital', 'Documento',
]

/**
 * Informe «Tiempo por reponer»: los trabajadores cuyo acumulado del periodo quedó por debajo de lo programado y
 * **de dónde sale ese tiempo**: cuánto aporta la entrada (llegar tarde resta), el almuerzo (más largo resta) y la
 * salida (salir antes resta); los tres suman el total. Cada fila abre el desglose día por día con sus incidencias.
 * Solo cuenta jornadas completas (no se estima lo que falta, D16) y ordena primero a quien más debe. Provisional
 * (P-03 y P-05 abiertos): no es una sanción ni un descuento y no decide si el almuerzo se paga.
 */
export function informeTiempoDebido(datos: DatosInformes, filtros: FiltrosInforme): TablaInforme {
  const porTrabajador = new Map<string, { dias: DiaDeDeuda[]; nombre: string; documento: string; hospital: string }>()
  for (const jornada of construirJornadas(datos, filtros)) {
    const detalle = detalleDeDiferencia(jornada)
    if (!detalle) continue
    const [entrada, almuerzo, salida] = detalle.aportes
    const dia: DiaDeDeuda = {
      fecha: jornada.fecha,
      entradaMinutos: entrada.aporteMinutos,
      almuerzoMinutos: almuerzo.aporteMinutos,
      salidaMinutos: salida.aporteMinutos,
      totalMinutos: detalle.diferenciaMinutos,
      incidencias: jornada.incidencias.map((i) => ({ id: i.id, texto: TEXTO_TIPO_INCIDENCIA[i.tipo] })),
    }
    const actual = porTrabajador.get(jornada.trabajador.id)
    porTrabajador.set(jornada.trabajador.id, {
      dias: [...(actual?.dias ?? []), dia],
      nombre: jornada.trabajador.nombreCompleto,
      documento: jornada.trabajador.numeroDocumento,
      hospital: jornada.hospital.nombre,
    })
  }
  const suma = (dias: DiaDeDeuda[], valor: (d: DiaDeDeuda) => number) => dias.reduce((total, d) => total + valor(d), 0)
  const deudores = [...porTrabajador.entries()]
    .map(([id, datosTrabajador]) => ({ id, ...datosTrabajador, total: suma(datosTrabajador.dias, (d) => d.totalMinutos) }))
    .filter((t) => t.total < 0)
    .sort((a, b) => a.total - b.total || a.nombre.localeCompare(b.nombre))
  const filas = deudores.map((t) => [
    t.nombre,
    textoDiferencia(t.total),
    textoDiferencia(suma(t.dias, (d) => d.entradaMinutos)),
    textoDiferencia(suma(t.dias, (d) => d.almuerzoMinutos)),
    textoDiferencia(suma(t.dias, (d) => d.salidaMinutos)),
    t.dias.filter((d) => d.totalMinutos < 0).length,
    t.dias.length,
    t.hospital,
    t.documento,
  ])
  const enlaces = deudores.map((t) => ({ trabajadorId: t.id, nombre: t.nombre, dias: t.dias.sort((a, b) => a.fecha.localeCompare(b.fecha)) }))
  return { tipo: 'TIEMPO_DEBIDO', periodo: textoPeriodo(filtros.desde, filtros.hasta), columnas: COLUMNAS_TIEMPO_DEBIDO, filas, enlaces }
}
