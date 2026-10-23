import { useMemo, useState } from 'react'
import type { TipoMarcacion } from '../contratos/marcacion'
import type { ResultadoRegistro } from '../modelos/jornada'
import { calcularDuraciones, instantesDeJornada } from '../reglas/duraciones'
import { calcularEstadoActual } from '../reglas/estadoActual'
import { siguienteMarcacion } from '../reglas/secuencia'
import { servicios } from '../servicios/fabrica'
import { obtenerAhoraUtc } from '../utilidades/horaColombia'
import { useCarga } from './useCarga'
import { useUbicacion } from './useUbicacion'

/**
 * Hook de la pantalla de registro del trabajador (HU-05). Carga su jornada, su hospital y las reglas
 * provisionales; calcula con las reglas qué acción corresponde, las duraciones y el estado; y ejecuta el
 * flujo de marcación: pedir la ubicación real del dispositivo (cada intento vuelve a comprobar el permiso)
 * y entregársela al servicio. Nunca sustituye la ubicación ni marca sin coordenadas. No decide reglas.
 */
export function useRegistroJornada(trabajadorId: string | null) {
  const ubicacion = useUbicacion()
  const [registrando, setRegistrando] = useState(false)
  const [ultimo, setUltimo] = useState<ResultadoRegistro | null>(null)
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null)

  const carga = useCarga(
    async () => {
      if (!trabajadorId) return null
      const trabajador = await servicios.trabajadores.obtenerPorId(trabajadorId)
      const [hospital, jornada, reglas, historial] = await Promise.all([
        trabajador ? servicios.hospitales.obtenerPorId(trabajador.hospitalId) : null,
        servicios.marcaciones.obtenerJornadaActual(trabajadorId),
        servicios.configuracion.obtenerReglas(),
        servicios.marcaciones.listarHistorial(trabajadorId),
      ])
      return { trabajador, hospital, jornada, reglas, historial }
    },
    'No se pudo cargar tu jornada.',
    [trabajadorId],
  )

  const derivados = useMemo(() => {
    const datos = carga.datos
    if (!datos) return null
    const { jornada } = datos
    const instantes = instantesDeJornada(jornada.marcaciones)
    return {
      siguiente: siguienteMarcacion(jornada.marcaciones.map((m) => m.tipo)),
      duraciones: calcularDuraciones(jornada.marcaciones),
      jornadaAbierta: instantes.entrada !== null && instantes.salidaFinal === null,
      instanteEntrada: instantes.entrada,
      estado: datos.trabajador
        ? calcularEstadoActual({
            estadoTrabajador: datos.trabajador.estado,
            horario: jornada.horario,
            fechaOperativa: jornada.fechaOperativa,
            marcaciones: jornada.marcaciones,
            ahora: obtenerAhoraUtc(),
            reglas: datos.reglas,
            hospitalAdmiteMarcacion: datos.hospital?.admiteMarcaciones ?? false,
          })
        : null,
    }
  }, [carga.datos])

  async function marcar(tipo: TipoMarcacion) {
    if (!trabajadorId || registrando) return
    setRegistrando(true)
    setUltimo(null)
    setErrorRegistro(null)
    try {
      const obtenida = await ubicacion.solicitar()
      const intento = obtenida.exito ? { ubicacion: obtenida.ubicacion } : { falloTecnico: obtenida.motivo }
      setUltimo(await servicios.marcaciones.registrar(trabajadorId, tipo, intento))
      carga.recargar()
    } catch {
      setErrorRegistro('No se pudo guardar el registro en esta demostración. Inténtalo de nuevo.')
    } finally {
      setRegistrando(false)
    }
  }

  return { carga, derivados, registrando, ultimo, errorRegistro, marcar, obteniendoUbicacion: ubicacion.estado === 'obteniendo' }
}
