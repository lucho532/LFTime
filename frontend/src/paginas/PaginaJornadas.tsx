import { useState } from 'react'
import '../estilos/paginas/PaginaJornadas.css'
import { Aviso } from '../componentes/base/Aviso'
import { Modal } from '../componentes/base/Modal'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { Confirmacion } from '../componentes/estados/Confirmacion'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { PanelHorarioTrabajador } from '../componentes/jornadas/PanelHorarioTrabajador'
import { TablaHorarios } from '../componentes/jornadas/TablaHorarios'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import type { DatosHorario } from '../modelos/horario'
import type { Trabajador } from '../modelos/trabajador'
import { puedeEditarHorarios } from '../reglas/permisosPersonal'
import { servicios } from '../servicios/fabrica'
import { crearNombreDe } from '../utilidades/nombresUsuarios'

/**
 * Pantalla de jornadas y horarios (HU-04). El coordinador asigna y edita el horario y el almuerzo de cada
 * trabajador (D15); el administrador consulta; el trabajador ve únicamente el suyo. Muestra lo planificado,
 * nunca lo registrado. Los permisos son solo visuales (D27). No contiene reglas de negocio.
 */
export function PaginaJornadas() {
  const { usuario } = useSesion()
  const [abierto, setAbierto] = useState<Trabajador | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const esTrabajador = usuario?.rol === 'TRABAJADOR'
  const puedeEditar = puedeEditarHorarios(usuario)

  const carga = useCarga(async () => {
    const [trabajadores, hospitales, horarios, usuarios] = await Promise.all([
      servicios.trabajadores.listar(),
      servicios.hospitales.listar(),
      servicios.horarios.listarTodos(),
      servicios.usuarios.listar(),
    ])
    return { trabajadores, hospitales, horarios, usuarios }
  }, 'No se pudieron cargar los horarios.')

  async function asignar(trabajador: Trabajador, datos: DatosHorario) {
    await servicios.horarios.asignar(trabajador.id, datos, usuario!.id)
    setMensaje(`Horario de ${trabajador.nombreCompleto} asignado en esta demostración. Los anteriores se conservan en el historial.`)
    carga.recargar()
  }

  if (carga.cargando && !carga.datos) {
    return <EstadoCarga mensaje="Cargando horarios…" />
  }
  if (carga.error || !carga.datos) {
    return <EstadoError mensaje={carga.error ?? 'No se pudieron cargar los horarios.'} onReintentar={carga.recargar} />
  }

  const { trabajadores, hospitales, horarios, usuarios } = carga.datos
  const nombreDe = crearNombreDe(usuarios)
  const propio = esTrabajador ? trabajadores.find((t) => t.id === usuario?.trabajadorId) : undefined
  const horariosDe = (trabajadorId: string) => horarios.filter((h) => h.trabajadorId === trabajadorId)

  return (
    <section className="pagina-jornadas">
      <header>
        <h1>{esTrabajador ? 'Mi horario' : 'Jornadas'}</h1>
        <p>{esTrabajador ? 'Tu horario planificado. Lo asigna tu coordinador.' : 'Horario y almuerzo planificados de cada trabajador. Lo registrado se consulta en las marcaciones.'}</p>
      </header>
      {mensaje && <Confirmacion mensaje={mensaje} onCerrar={() => setMensaje(null)} />}
      {esTrabajador ? (
        propio ? (
          <Tarjeta titulo={propio.nombreCompleto}>
            <PanelHorarioTrabajador trabajadorId={propio.id} horarios={horariosDe(propio.id)} puedeEditar={false} nombreDe={nombreDe} onAsignar={async () => undefined} />
          </Tarjeta>
        ) : (
          <Aviso tipo="advertencia">Tu cuenta no está asociada a un trabajador, por eso no hay horario que mostrar.</Aviso>
        )
      ) : (
        <Tarjeta titulo="Horarios del personal">
          <TablaHorarios trabajadores={trabajadores} hospitales={hospitales} horarios={horarios} textoAccion={puedeEditar ? 'Editar horario' : 'Ver horario'} onAbrir={setAbierto} />
        </Tarjeta>
      )}
      <Modal abierto={abierto !== null} titulo={abierto ? `Horario de ${abierto.nombreCompleto}` : 'Horario'} onCerrar={() => setAbierto(null)}>
        {abierto && (
          <PanelHorarioTrabajador
            trabajadorId={abierto.id}
            horarios={horariosDe(abierto.id)}
            puedeEditar={puedeEditar}
            nombreDe={nombreDe}
            onAsignar={(datos) => asignar(abierto, datos)}
          />
        )}
      </Modal>
    </section>
  )
}
