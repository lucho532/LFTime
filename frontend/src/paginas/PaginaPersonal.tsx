import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import '../estilos/paginas/PaginaPersonal.css'
import { Boton } from '../componentes/base/Boton'
import { Modal } from '../componentes/base/Modal'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { FormularioTrabajador } from '../componentes/personal/FormularioTrabajador'
import { TablaPersonal } from '../componentes/personal/TablaPersonal'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import type { DatosTrabajador } from '../modelos/trabajador'
import { puedeGestionarPersonal } from '../reglas/permisosPersonal'
import { servicios } from '../servicios/fabrica'

/**
 * Pantalla de personal (HU-02): lista con búsqueda, filtros y paginación y, para quien gestiona el
 * personal, el alta de trabajadores. Un trabajador que entra aquí va directo a su propia ficha. Los
 * permisos son solo visuales (D27). No contiene reglas de negocio.
 */
export function PaginaPersonal() {
  const { usuario } = useSesion()
  const navegar = useNavigate()
  const [creando, setCreando] = useState(false)
  const carga = useCarga(async () => {
    const [trabajadores, hospitales, municipios] = await Promise.all([servicios.trabajadores.listar(), servicios.hospitales.listar(), servicios.hospitales.listarMunicipios()])
    return { trabajadores, hospitales, municipios }
  }, 'No se pudo cargar el personal.')

  if (usuario?.rol === 'TRABAJADOR' && usuario.trabajadorId) {
    return <Navigate to={`/personal/${usuario.trabajadorId}`} replace />
  }

  async function crear(datos: DatosTrabajador) {
    const trabajador = await servicios.trabajadores.crear(datos, usuario!.id)
    navegar(`/personal/${trabajador.id}`, { state: { creado: true } })
  }

  return (
    <section className="pagina-personal">
      <header className="pagina-personal__encabezado">
        <div>
          <h1>Personal</h1>
          <p>Trabajadores asignados a los hospitales, con su estado y su horario.</p>
        </div>
        {puedeGestionarPersonal(usuario) && <Boton onClick={() => setCreando(true)}>Nuevo trabajador</Boton>}
      </header>
      {carga.cargando && <EstadoCarga mensaje="Cargando personal…" />}
      {carga.error && <EstadoError mensaje={carga.error} onReintentar={carga.recargar} />}
      {carga.datos && (
        <Tarjeta titulo="Personal">
          <TablaPersonal trabajadores={carga.datos.trabajadores} hospitales={carga.datos.hospitales} municipios={carga.datos.municipios} />
          <Modal abierto={creando} titulo="Nuevo trabajador" onCerrar={() => setCreando(false)}>
            <FormularioTrabajador hospitales={carga.datos.hospitales} onGuardar={crear} onCancelar={() => setCreando(false)} />
          </Modal>
        </Tarjeta>
      )}
    </section>
  )
}
