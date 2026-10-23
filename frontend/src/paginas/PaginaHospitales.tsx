import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../estilos/paginas/PaginaHospitales.css'
import { Boton } from '../componentes/base/Boton'
import { Modal } from '../componentes/base/Modal'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { FormularioHospital } from '../componentes/hospitales/FormularioHospital'
import { TablaHospitales } from '../componentes/hospitales/TablaHospitales'
import { MapaEsquematico } from '../componentes/mapa/MapaEsquematico'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import type { DatosHospital } from '../modelos/hospital'
import { puedeEditarHospital } from '../reglas/permisosHospital'
import { servicios } from '../servicios/fabrica'
import { crearNombreDe } from '../utilidades/nombresUsuarios'

/**
 * Pantalla de hospitales y municipios (HU-03): lista con búsqueda y filtros, mapa esquemático y, para
 * quien puede, el alta de un hospital. Tras crear uno lleva a su ficha para configurar las coordenadas.
 * No contiene reglas: usa servicios y las reglas de permisos (solo visuales, D27).
 */
export function PaginaHospitales() {
  const { usuario } = useSesion()
  const navegar = useNavigate()
  const [creando, setCreando] = useState(false)
  const carga = useCarga(async () => {
    const [hospitales, municipios, usuarios] = await Promise.all([servicios.hospitales.listar(), servicios.hospitales.listarMunicipios(), servicios.usuarios.listar()])
    return { hospitales, municipios, usuarios }
  }, 'No se pudieron cargar los hospitales.')

  async function crear(datos: DatosHospital) {
    const hospital = await servicios.hospitales.crear(datos, usuario!.id)
    navegar(`/hospitales/${hospital.id}`, { state: { creado: true } })
  }

  return (
    <section className="pagina-hospitales">
      <header className="pagina-hospitales__encabezado">
        <div>
          <h1>Hospitales / Municipios</h1>
          <p>Centros de trabajo del personal, con su municipio, su responsable y el estado de sus coordenadas.</p>
        </div>
        {puedeEditarHospital(usuario) && <Boton onClick={() => setCreando(true)}>Nuevo hospital</Boton>}
      </header>
      {carga.cargando && <EstadoCarga mensaje="Cargando hospitales…" />}
      {carga.error && <EstadoError mensaje={carga.error} onReintentar={carga.recargar} />}
      {carga.datos && (
        <div className="pagina-hospitales__contenido">
          <Tarjeta titulo="Hospitales">
            <TablaHospitales hospitales={carga.datos.hospitales} municipios={carga.datos.municipios} nombreDe={crearNombreDe(carga.datos.usuarios)} />
          </Tarjeta>
          <Tarjeta titulo="Ubicación de hospitales">
            <MapaEsquematico hospitales={carga.datos.hospitales} />
          </Tarjeta>
          <Modal abierto={creando} titulo="Nuevo hospital" onCerrar={() => setCreando(false)}>
            <FormularioHospital municipios={carga.datos.municipios} onGuardar={crear} onCancelar={() => setCreando(false)} />
          </Modal>
        </div>
      )}
    </section>
  )
}
