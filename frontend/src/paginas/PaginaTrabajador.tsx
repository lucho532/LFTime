import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import '../estilos/paginas/PaginaTrabajador.css'
import { Boton } from '../componentes/base/Boton'
import { Modal } from '../componentes/base/Modal'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { Confirmacion } from '../componentes/estados/Confirmacion'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { PanelHorarioTrabajador } from '../componentes/jornadas/PanelHorarioTrabajador'
import { DatosDelTrabajador } from '../componentes/personal/DatosDelTrabajador'
import { FormularioTrabajador } from '../componentes/personal/FormularioTrabajador'
import { SelectorFoto } from '../componentes/personal/SelectorFoto'
import { AvatarPersona } from '../componentes/personal/AvatarPersona'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import type { DatosHorario } from '../modelos/horario'
import type { DatosTrabajador } from '../modelos/trabajador'
import { PaginaAccesoRestringido } from './PaginaAccesoRestringido'
import { puedeEditarHorarios, puedeCambiarFoto, puedeGestionarPersonal, puedeVerFichaDe } from '../reglas/permisosPersonal'
import { servicios } from '../servicios/fabrica'
import { crearNombreDe } from '../utilidades/nombresUsuarios'

/**
 * Ficha de un trabajador (HU-02): foto, datos, estado y horario vigente con su historial. Quien gestiona
 * el personal edita los datos; el coordinador asigna horarios; solo la propia persona cambia su foto (D14).
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
    const [trabajador, hospitales, municipios, horarios, usuarios] = await Promise.all([
      servicios.trabajadores.obtenerPorId(trabajadorId),
      servicios.hospitales.listar(),
      servicios.hospitales.listarMunicipios(),
      servicios.horarios.listarPorTrabajador(trabajadorId),
      servicios.usuarios.listar(),
    ])
    return { trabajador, hospitales, municipios, horarios, usuarios }
  }, 'No se pudo cargar la ficha del trabajador.', [trabajadorId])

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
      <header className="pagina-trabajador__encabezado">
        <AvatarPersona nombreCompleto={trabajador.nombreCompleto} propietario={propietarioFoto} tieneFoto={trabajador.urlFoto !== null} tamano="grande" />
        <h1>{trabajador.nombreCompleto}</h1>
        {puedeGestionarPersonal(usuario) && (
          <Boton variante="secundario" onClick={() => setEditando(true)}>
            Editar datos
          </Boton>
        )}
      </header>
      {mensaje && <Confirmacion mensaje={mensaje} onCerrar={() => setMensaje(null)} />}
      <div className="pagina-trabajador__rejilla">
        <Tarjeta titulo="Datos">
          <DatosDelTrabajador trabajador={trabajador} hospital={hospital} municipio={datos.municipios.find((m) => m.id === hospital?.municipioId)} />
        </Tarjeta>
        <Tarjeta titulo="Foto de perfil">
          {puedeCambiarFoto(usuario, propietarioFoto) ? (
            <SelectorFoto nombreCompleto={trabajador.nombreCompleto} propietario={propietarioFoto} tieneFoto={trabajador.urlFoto !== null} onCambio={carga.recargar} />
          ) : (
            <p>La foto de perfil la cambia únicamente cada persona.</p>
          )}
        </Tarjeta>
        <Tarjeta titulo="Horario">
          <PanelHorarioTrabajador trabajadorId={trabajador.id} horarios={datos.horarios} puedeEditar={puedeEditarHorarios(usuario)} nombreDe={crearNombreDe(datos.usuarios)} onAsignar={asignarHorario} />
        </Tarjeta>
      </div>
      <Modal abierto={editando} titulo="Editar trabajador" onCerrar={() => setEditando(false)}>
        <FormularioTrabajador
          inicial={{ nombres: trabajador.nombres, apellidos: trabajador.apellidos, tipoDocumento: trabajador.tipoDocumento, numeroDocumento: trabajador.numeroDocumento, cargo: trabajador.cargo, telefono: trabajador.telefono ?? '', hospitalId: trabajador.hospitalId, estado: trabajador.estado }}
          hospitales={datos.hospitales}
          onGuardar={guardarDatos}
          onCancelar={() => setEditando(false)}
        />
      </Modal>
    </section>
  )
}
