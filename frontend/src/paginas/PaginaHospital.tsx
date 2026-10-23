import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import '../estilos/paginas/PaginaHospital.css'
import { Boton } from '../componentes/base/Boton'
import { Modal } from '../componentes/base/Modal'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { Confirmacion } from '../componentes/estados/Confirmacion'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { AsignacionCoordinador } from '../componentes/hospitales/AsignacionCoordinador'
import { AvisoHospitalSinConfigurar } from '../componentes/hospitales/AvisoHospitalSinConfigurar'
import { DatosDelHospital } from '../componentes/hospitales/DatosDelHospital'
import { EstadoCoordenadas } from '../componentes/hospitales/EstadoCoordenadas'
import { FormularioCoordenadas } from '../componentes/hospitales/FormularioCoordenadas'
import { FormularioHospital } from '../componentes/hospitales/FormularioHospital'
import { HistorialCoordenadas } from '../componentes/hospitales/HistorialCoordenadas'
import { PersonalDelHospital } from '../componentes/hospitales/PersonalDelHospital'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import type { DatosHospital, EntradaCoordenadas } from '../modelos/hospital'
import { puedeAsignarCoordinador, puedeEditarHospital } from '../reglas/permisosHospital'
import { servicios } from '../servicios/fabrica'
import { crearNombreDe } from '../utilidades/nombresUsuarios'

/**
 * Ficha de un hospital (HU-03): datos, estado de las coordenadas con su formulario y su historial,
 * coordinador responsable con su historial y personal asignado. Quien puede editar (coordinador) configura
 * coordenadas y datos; quien puede asignar (administrador) cambia el responsable. Los permisos son solo
 * visuales (D27). No contiene reglas de negocio.
 */
export function PaginaHospital() {
  const { hospitalId = '' } = useParams()
  const ubicacion = useLocation()
  const { usuario } = useSesion()
  const [editando, setEditando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>((ubicacion.state as { creado?: boolean } | null)?.creado ? 'Hospital creado en esta demostración. Configura ahora sus coordenadas para habilitar el registro.' : null)

  const carga = useCarga(async () => {
    const [hospital, municipios, usuarios, trabajadores] = await Promise.all([
      servicios.hospitales.obtenerPorId(hospitalId),
      servicios.hospitales.listarMunicipios(),
      servicios.usuarios.listar(),
      servicios.trabajadores.listar(),
    ])
    return { hospital, municipios, usuarios, trabajadores: trabajadores.filter((t) => t.hospitalId === hospitalId) }
  }, 'No se pudo cargar el hospital.', [hospitalId])

  const datos = carga.datos
  if (carga.cargando && !datos) {
    return <EstadoCarga mensaje="Cargando hospital…" />
  }
  if (carga.error || !datos) {
    return <EstadoError mensaje={carga.error ?? 'No se pudo cargar el hospital.'} onReintentar={carga.recargar} />
  }
  if (!datos.hospital) {
    return (
      <section>
        <EstadoError mensaje="No se encontró este hospital. Puede que se haya restablecido la demostración." />
        <Link to="/hospitales">Volver a hospitales</Link>
      </section>
    )
  }

  const hospital = datos.hospital
  const nombreDe = crearNombreDe(datos.usuarios)

  async function confirmarCoordenadas(coordenadas: EntradaCoordenadas) {
    await servicios.hospitales.confirmarCoordenadas(hospital.id, coordenadas, usuario!.id)
    setMensaje('Coordenadas confirmadas en esta demostración. El hospital ya admite marcaciones.')
    carga.recargar()
  }

  async function guardarDatos(nuevos: DatosHospital) {
    await servicios.hospitales.actualizar(hospital.id, nuevos, usuario!.id)
    setEditando(false)
    setMensaje('Datos del hospital guardados en esta demostración.')
    carga.recargar()
  }

  async function asignar(coordinadorId: string, motivo: string) {
    await servicios.hospitales.asignarCoordinador(hospital.id, coordinadorId, usuario!.id, motivo)
    setMensaje('Coordinador responsable actualizado en esta demostración.')
    carga.recargar()
  }

  return (
    <section className="pagina-hospital">
      <Link to="/hospitales">← Hospitales</Link>
      <header className="pagina-hospital__encabezado">
        <h1>{hospital.nombre}</h1>
        <EstadoCoordenadas hospital={hospital} />
        {puedeEditarHospital(usuario) && (
          <Boton variante="secundario" onClick={() => setEditando(true)}>
            Editar datos
          </Boton>
        )}
      </header>
      {mensaje && <Confirmacion mensaje={mensaje} onCerrar={() => setMensaje(null)} />}
      <AvisoHospitalSinConfigurar hospital={hospital} />
      <div className="pagina-hospital__rejilla">
        <Tarjeta titulo="Datos">
          <DatosDelHospital hospital={hospital} municipio={datos.municipios.find((m) => m.id === hospital.municipioId)} />
        </Tarjeta>
        <Tarjeta titulo="Coordenadas">
          {puedeEditarHospital(usuario) ? <FormularioCoordenadas hospital={hospital} onConfirmar={confirmarCoordenadas} /> : <p>Solo el coordinador configura las coordenadas.</p>}
          <h3 className="pagina-hospital__subtitulo">Historial de coordenadas</h3>
          <HistorialCoordenadas cambios={hospital.historialCoordenadas} nombreDe={nombreDe} />
        </Tarjeta>
        <Tarjeta titulo="Coordinador responsable">
          <AsignacionCoordinador
            hospital={hospital}
            coordinadores={datos.usuarios.filter((u) => u.rol === 'COORDINADOR')}
            nombreDe={nombreDe}
            puedeAsignar={puedeAsignarCoordinador(usuario)}
            onAsignar={asignar}
          />
        </Tarjeta>
        <Tarjeta titulo="Personal asignado">
          <PersonalDelHospital trabajadores={datos.trabajadores} />
        </Tarjeta>
      </div>
      <Modal abierto={editando} titulo="Editar hospital" onCerrar={() => setEditando(false)}>
        <FormularioHospital inicial={{ nombre: hospital.nombre, municipioId: hospital.municipioId, direccion: hospital.direccion }} municipios={datos.municipios} onGuardar={guardarDatos} onCancelar={() => setEditando(false)} />
      </Modal>
    </section>
  )
}
