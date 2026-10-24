import { useMemo, useState } from 'react'
import type { FiltrosInforme, TablaInforme, TipoInforme } from '../modelos/informe'
import { construirInforme } from '../reglas/informes/construirInforme'
import { validarPeriodo } from '../reglas/informes/periodo'
import { servicios } from '../servicios/fabrica'
import { hoyColombia } from '../utilidades/horaColombia'
import { useCarga } from './useCarga'

/** Informes que cubren el mes en curso al elegirlos. */
const INFORMES_MENSUALES: TipoInforme[] = ['ACUMULADO_MENSUAL', 'TIEMPO_DEBIDO']

/**
 * Estado de la pantalla de informes (HU-08): carga una vez lo registrado, guarda el informe elegido y los
 * filtros, y calcula la tabla con `construirInforme`. El periodo inicial es solo el día de hoy; los informes mensuales lo cambian al mes en curso (del día 1 a hoy). Si el periodo
 * no es válido devuelve el mensaje en lugar de la tabla. No calcula por su cuenta ni exporta.
 */
export function useInformes() {
  const carga = useCarga(() => servicios.informes.obtenerDatos(), 'No se pudieron cargar los datos de los informes.')
  const [tipo, setTipoElegido] = useState<TipoInforme>('ASISTENCIA_DIARIA')
  const [filtros, setFiltros] = useState<FiltrosInforme>(() => {
    const hoy = hoyColombia()
    return { trabajadorId: '', hospitalId: '', municipioId: '', soloConIncidencias: false, desde: hoy, hasta: hoy }
  })

  /**
   * Al elegir un informe mensual (acumulado mensual o tiempo por reponer) el periodo pasa a ser el mes en curso, del día
   * 1 a hoy. Al volver a otro informe, si el periodo sigue siendo ese mes, vuelve a ser solo hoy. Las fechas elegidas a
   * mano no se tocan.
   */
  const setTipo = (nuevo: TipoInforme) => {
    const hoy = hoyColombia()
    const mesEnCurso = { desde: `${hoy.slice(0, 8)}01`, hasta: hoy }
    setTipoElegido(nuevo)
    setFiltros((anterior) => {
      if (INFORMES_MENSUALES.includes(nuevo)) return { ...anterior, ...mesEnCurso }
      const eraElMes = anterior.desde === mesEnCurso.desde && anterior.hasta === mesEnCurso.hasta
      return INFORMES_MENSUALES.includes(tipo) && eraElMes ? { ...anterior, desde: hoy, hasta: hoy } : anterior
    })
  }

  const errorPeriodo = validarPeriodo(filtros.desde, filtros.hasta)
  const tabla = useMemo<TablaInforme | null>(
    () => (carga.datos && !errorPeriodo ? construirInforme(tipo, carga.datos, filtros) : null),
    [carga.datos, errorPeriodo, tipo, filtros],
  )

  return {
    carga,
    datos: carga.datos,
    tipo,
    setTipo,
    filtros,
    cambiarFiltro: (nombre: keyof FiltrosInforme, valor: string | boolean) => setFiltros((anterior) => ({ ...anterior, [nombre]: valor })),
    errorPeriodo,
    tabla,
  }
}
