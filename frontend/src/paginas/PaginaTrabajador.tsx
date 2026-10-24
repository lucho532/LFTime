import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import '../estilos/paginas/PaginaTrabajador.css'
import { BotonEditar } from '../componentes/base/BotonEditar'
import { Modal } from '../componentes/base/Modal'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { Confirmacion } from '../componentes/estados/Confirmacion'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { PanelHorarioTrabajador } from '../componentes/jornadas/PanelHorarioTrabajador'
import { JornadaDelDiaTrabajador } from '../componentes/personal/JornadaDelDiaTrabajador'
import { DatosDelTrabajador } from '../componentes/personal/DatosDelTrabajador'
import { FormularioTrabajador } from '../componentes/personal/FormularioTrabajador'
import { AccionesDeCuenta } from '../componentes/personal/AccionesDeCuenta'
import { EncabezadoFicha } from '../componentes/personal/EncabezadoFicha'
import { useCarga } from '../hooks/useCarga'
import { useHoraColombia } from '../hooks/useHoraColombia'
import { useSesion } from '../hooks/useSesion'
import type { DatosHorario } from '../modelos/horario'
import type { DatosTrabajador } from '../modelos/trabajador'
import { PaginaAccesoRestringido } from './PaginaAccesoRestringido'
import { puedeEditarDatosDeTrabajador, puedeEditarHorarios, puedeCambiarFoto, puedeGestionarPersonal, puedeVerFichaDe } from '../reglas/permisosPersonal'
import { servicios } from '../servicios/fabrica'
import { crearNombreDe } from '../utilidades/nombresUsuarios'

/** Cada cuántos segundos se vuelve a leer la jornada de hoy para que la ficha refleje marcaciones nuevas. */
const SEGUNDOS_ENTRE_ACTUALIZACIONES = 30

/**
 * Ficha de un trabajador (HU-02): foto, datos, estado y horario vigente con su historial. Cada trabajador edita
 * sus datos personales con el lápiz de la tarjeta, y quien gestiona el personal edita los de todos (y el
 * hospital y el estado); muestra la jornada de hoy con un cronómetro en vivo; el coordinador asigna horarios; solo la propia persona cambia su foto (D14), desde el botón de la cámara de la cabecera, que es el único lugar donde se ve y edita (D41). Quien abre su propia ficha tiene además sus accesos de cuenta (horario, incidencias, tema y cerrar sesión).
 * Un trabajador solo abre su ficha. Los permisos son solo visuales (D27). Los historiales de jornadas e
 * incidencias se añaden cuando existan esos módulos (hitos 8 y 9).
 */
export function PaginaTrabajador() {
  const { trabajadorId = '' } = useParams()
  const ubicacion = useLocation()
  const { usuario } = useSesion()
  const [editando, setEditando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>((ubicacion.state as { creado?: boolean } | null)?.creado ? 'Trabajador creado en esta demostración. Asígnale un horario para que pueda registrar su jornada.' : null)

  const carga = useCarga(async () => {
    const [trabajador, hospitales, municipios, horarios, usuarios, jornada] = await Promise.all([
      servicios.trabajadores.obtenerPorId(trabajadorId),
      servicios.hospitales.listar(),
      servicios.hospitales.listarMunicipios(),
      servicios.horarios.listarPorTrabajador(trabajadorId),
      servicios.usuarios.listar(),
      servicios.marcaciones.obtenerJornadaActual(trabajadorId),
    ])
    return { trabajador, hospitales, municipios, horarios, usuarios, jornada }
  }, 'No se pudo cargar la ficha del trabajador.', [trabajadorId])

  const ahora = useHoraColombia(1)
  const { recargar } = carga
  useEffect(() => {
    const temporizador = window.setInterval(recargar, SEGUNDOS_ENTRE_ACTUALIZACIONES * 1000)
    return () => window.clearInterval(temporizador)
  }, [recargar])

  if (!puedeVerFichaDe(usuario, trabajadorId)) {
    return <PaginaAccesoRestringido />
  }
  const datos = carga.datos
  if (carga.cargando && !datos) {
    return <EstadoCarga mensaje="Cargando ficha…" />
  }
  if (carga.error || !datos) {
    return <EstadoError mensaje={carga.error ?? 'No se pudo cargar la ficha.'} onReintentar={carga.recargar} />
  }
  if (!datos.trabajador) {
    return (
      <section>
        <EstadoError mensaje="No se encontró este trabajador. Puede que se haya restablecido la demostración." />
        <Link to="/personal">Volver a personal</Link>
      </section>
    )
  }

  const trabajador = datos.trabajador
  const hospital = datos.hospitales.find((h) => h.id === trabajador.hospitalId)
  const propietarioFoto = { trabajadorId: trabajador.id }

  async function guardarDatos(nuevos: DatosTrabajador) {
    await servicios.trabajadores.actualizar(trabajador.id, nuevos, usuario!.id)
    setEditando(false)
    setMensaje('Datos del trabajador guardados en esta demostración.')
    carga.recargar()
  }

  async function asignarHorario(horario: DatosHorario) {
    await servicios.horarios.asignar(trabajador.id, horario, usuario!.id)
    setMensaje('Horario asignado en esta demostración. Los horarios anteriores se conservan en el historial.')
    carga.recargar()
  }

  return (
    <section className="pagina-trabajador">
      {puedeGestionarPersonal(usuario) && <Link to="/personal">← Personal</Link>}
      <EncabezadoFicha
        nombreCompleto={trabajador.nombreCompleto}
        propietario={propietarioFoto}
        tieneFoto={trabajador.urlFoto !== null}
        puedeCambiarFoto={puedeCambiarFoto(usuario, propietarioFoto)}
        subtitulo={trabajador.cargo}
        onCambioFoto={carga.recargar}
      />
      {mensaje && <Confirmacion mensaje={mensaje} onCerrar={() => setMensaje(null)} />}
      <div className="pagina-trabajador__rejilla">
        <div className="pagina-trabajador__datos">
          <Tarjeta titulo="Datos" acciones={puedeEditarDatosDeTrabajador(usuario, trabajador.id) ? <BotonEditar etiqueta="Editar datos personales" onClick={() => setEditando(true)} /> : undefined}>
            <DatosDelTrabajador trabajador={trabajador} hospital={hospital} municipio={datos.municipios.find((m) => m.id === hospital?.municipioId)} />
          </Tarjeta>
        </div>
        <div className="pagina-trabajador__jornada">
          <Tarjeta titulo="Jornada de hoy">
            <JornadaDelDiaTrabajador jornada={datos.jornada} ahora={ahora} />
          </Tarjeta>
        </div>
        <div className="pagina-trabajador__horario">
          <Tarjeta titulo="Horario">
            <PanelHorarioTrabajador trabajadorId={trabajador.id} horarios={datos.horarios} puedeEditar={puedeEditarHorarios(usuario)} nombreDe={crearNombreDe(datos.usuarios)} onAsignar={asignarHorario} />
          </Tarjeta>
        </div>
      </div>
      {usuario?.trabajadorId === trabajador.id && <AccionesDeCuenta />}
      <Modal abierto={editando} titulo="Editar trabajador" onCerrar={() => setEditando(false)}>
        <FormularioTrabajador
          inicial={{ nombres: trabajador.nombres, apellidos: trabajador.apellidos, tipoDocumento: trabajador.tipoDocumento, numeroDocumento: trabajador.numeroDocumento, cargo: trabajador.cargo, telefono: trabajador.telefono ?? '', hospitalId: trabajador.hospitalId, estado: trabajador.estado }}
          hospitales={datos.hospitales}
          onGuardar={guardarDatos}
          onCancelar={() => setEditando(false)}
          soloDatosPersonales={!puedeGestionarPersonal(usuario)}
        />
      </Modal>
    </section>
  )
}
