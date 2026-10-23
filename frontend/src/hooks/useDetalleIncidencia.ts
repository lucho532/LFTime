import { useMemo, useState } from 'react'
import type { Usuario } from '../modelos/usuario'
import { calcularAccionesPermitidas, type ResolucionIncidencia } from '../reglas/permisosIncidencia'
import { servicios } from '../servicios/fabrica'
import { crearNombreDe } from '../utilidades/nombresUsuarios'
import { useCarga } from './useCarga'

/** Acciones que la pantalla puede ejecutar. Si una lanza un error, su mensaje se muestra a la persona. */
export interface AccionesIncidencia {
  iniciarRevision: () => Promise<void>
  justificar: (texto: string, motivo?: string) => Promise<void>
  resolver: (resolucion: ResolucionIncidencia, motivo: string) => Promise<void>
  reabrir: (motivo: string) => Promise<void>
  escalar: (motivo: string) => Promise<void>
  asignarRevisor: (coordinadorId: string, motivo?: string) => Promise<void>
}

/**
 * Hook del detalle de una incidencia (HU-06, HU-07). Carga la incidencia con sus intentos y los nombres,
 * marca su alerta como revisada al abrirla quien revisa (P-19), calcula los permisos con
 * `reglas/permisosIncidencia` y expone las acciones del flujo. Recarga tras cada acción. No decide reglas.
 */
export function useDetalleIncidencia(incidenciaId: string, usuario: Usuario | null) {
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const carga = useCarga(
    async () => {
      const incidencia = await servicios.incidencias.obtenerPorId(incidenciaId)
      if (!incidencia) return null
      const [intentos, trabajadores, hospitales, usuarios] = await Promise.all([
        servicios.incidencias.listarIntentos(incidenciaId),
        servicios.trabajadores.listar(),
        servicios.hospitales.listar(),
        servicios.usuarios.listar(),
      ])
      if (usuario && usuario.rol !== 'TRABAJADOR') {
        await servicios.alertas.marcarRevisadaDeIncidencia(incidenciaId)
      }
      return { incidencia, intentos, trabajadores, hospitales, usuarios }
    },
    'No se pudo cargar la incidencia.',
    [incidenciaId],
  )

  const datos = carga.datos
  const nombreDe = useMemo(() => {
    const porUsuario = crearNombreDe(datos?.usuarios ?? [])
    const trabajadores = new Map((datos?.trabajadores ?? []).map((t) => [t.id, t.nombreCompleto]))
    // Las justificaciones sembradas guardan el identificador del trabajador como autor.
    return (id: string) => trabajadores.get(id) ?? porUsuario(id)
  }, [datos])

  async function ejecutar(accion: () => Promise<unknown>, exito: string) {
    setMensaje(null)
    setErrorAccion(null)
    await accion()
    setMensaje(exito)
    carga.recargar()
  }

  const acciones: AccionesIncidencia | null = usuario
    ? {
        iniciarRevision: async () => {
          try {
            await ejecutar(() => servicios.incidencias.iniciarRevision(incidenciaId, usuario.id), 'Revisión iniciada. Queda en el historial.')
          } catch (fallo) {
            setErrorAccion(fallo instanceof Error ? fallo.message : 'No se pudo iniciar la revisión.')
          }
        },
        justificar: (texto, motivo) => ejecutar(() => servicios.incidencias.justificar(incidenciaId, texto, usuario.id, motivo), 'Justificación guardada en esta demostración.'),
        resolver: (resolucion, motivo) => ejecutar(() => servicios.incidencias.resolver(incidenciaId, resolucion, motivo, usuario.id), 'Resolución registrada y auditada. Los intentos originales no cambian.'),
        reabrir: (motivo) => ejecutar(() => servicios.incidencias.reabrir(incidenciaId, motivo, usuario.id), 'Incidencia reabierta. Queda en el historial.'),
        escalar: (motivo) => ejecutar(() => servicios.incidencias.escalar(incidenciaId, motivo, usuario.id), 'Incidencia escalada al administrador y auditada.'),
        asignarRevisor: (coordinadorId, motivo) => ejecutar(() => servicios.incidencias.asignarRevisor(incidenciaId, coordinadorId, usuario.id, motivo), 'Revisor asignado y auditado.'),
      }
    : null

  const permisos = datos ? calcularAccionesPermitidas(usuario, datos.incidencia) : null
  return { carga, datos, permisos, acciones, nombreDe, mensaje, cerrarMensaje: () => setMensaje(null), errorAccion }
}
