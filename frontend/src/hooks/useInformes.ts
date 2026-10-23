import { useMemo, useState } from 'react'
import type { FiltrosInforme, TablaInforme, TipoInforme } from '../modelos/informe'
import { construirInforme } from '../reglas/informes/construirInforme'
import { validarPeriodo } from '../reglas/informes/periodo'
import { servicios } from '../servicios/fabrica'
import { hoyColombia, sumarDias } from '../utilidades/horaColombia'
import { useCarga } from './useCarga'

/** Días que cubre el periodo al abrir la pantalla: la última semana, hoy incluido. */
const DIAS_PERIODO_INICIAL = 7

/**
 * Estado de la pantalla de informes (HU-08): carga una vez lo registrado, guarda el informe elegido y los
 * filtros, y calcula la tabla con `construirInforme`. El periodo inicial es la última semana. Si el periodo
 * no es válido devuelve el mensaje en lugar de la tabla. No calcula por su cuenta ni exporta.
 */
export function useInformes() {
  const carga = useCarga(() => servicios.informes.obtenerDatos(), 'No se pudieron cargar los datos de los informes.')
  const [tipo, setTipo] = useState<TipoInforme>('ASISTENCIA_DIARIA')
  const [filtros, setFiltros] = useState<FiltrosInforme>(() => {
    const hoy = hoyColombia()
    return { trabajadorId: '', hospitalId: '', municipioId: '', desde: sumarDias(hoy, 1 - DIAS_PERIODO_INICIAL), hasta: hoy }
  })

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
    cambiarFiltro: (nombre: keyof FiltrosInforme, valor: string) => setFiltros((anterior) => ({ ...anterior, [nombre]: valor })),
    errorPeriodo,
    tabla,
  }
}
