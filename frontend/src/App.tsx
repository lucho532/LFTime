import { Navigate, Route, Routes } from 'react-router-dom'
import './estilos/App.css'
import { DisposicionBase } from './componentes/disposicion/DisposicionBase'
import { ProveedorSesion } from './componentes/disposicion/ProveedorSesion'
import { RestriccionPorRol } from './componentes/disposicion/RestriccionPorRol'
import { RutaProtegida } from './componentes/disposicion/RutaProtegida'
import { useSesion } from './hooks/useSesion'
import { PaginaConfiguracion } from './paginas/PaginaConfiguracion'
import { PaginaEnConstruccion } from './paginas/PaginaEnConstruccion'
import { PaginaHospital } from './paginas/PaginaHospital'
import { PaginaHospitales } from './paginas/PaginaHospitales'
import { PaginaIncidencia } from './paginas/PaginaIncidencia'
import { PaginaIncidencias } from './paginas/PaginaIncidencias'
import { PaginaInformes } from './paginas/PaginaInformes'
import { PaginaInicio } from './paginas/PaginaInicio'
import { PaginaIngreso } from './paginas/PaginaIngreso'
import { PaginaJornadas } from './paginas/PaginaJornadas'
import { PaginaPersonal } from './paginas/PaginaPersonal'
import { PaginaRegistro } from './paginas/PaginaRegistro'
import { PaginaTrabajador } from './paginas/PaginaTrabajador'
import { rutaInicialDe } from './reglas/permisosRuta'

function RedireccionInicial() {
  const { usuario } = useSesion()
  return <Navigate to={usuario ? rutaInicialDe(usuario.rol) : '/ingreso'} replace />
}

/**
 * Componente raíz: provee la sesión simulada y define el enrutado.
 * Asocia rutas con páginas; el acceso por rol es solo visual (D27). No contiene lógica de negocio.
 */
export default function App() {
  return (
    <ProveedorSesion>
      <div className="aplicacion">
        <Routes>
          <Route path="/ingreso" element={<PaginaIngreso />} />
          <Route element={<RutaProtegida />}>
            <Route element={<DisposicionBase />}>
              <Route index element={<RedireccionInicial />} />
              <Route path="inicio" element={<RestriccionPorRol ruta="inicio"><PaginaInicio /></RestriccionPorRol>} />
              <Route path="configuracion" element={<RestriccionPorRol ruta="configuracion"><PaginaConfiguracion /></RestriccionPorRol>} />
              <Route path="reportes" element={<RestriccionPorRol ruta="reportes"><PaginaInformes /></RestriccionPorRol>} />
              <Route path="hospitales" element={<RestriccionPorRol ruta="hospitales"><PaginaHospitales /></RestriccionPorRol>} />
              <Route path="hospitales/:hospitalId" element={<RestriccionPorRol ruta="hospitales"><PaginaHospital /></RestriccionPorRol>} />
              <Route path="personal" element={<RestriccionPorRol ruta="personal"><PaginaPersonal /></RestriccionPorRol>} />
              <Route path="personal/:trabajadorId" element={<RestriccionPorRol ruta="personal"><PaginaTrabajador /></RestriccionPorRol>} />
              <Route path="jornadas" element={<RestriccionPorRol ruta="jornadas"><PaginaJornadas /></RestriccionPorRol>} />
              <Route path="registro" element={<RestriccionPorRol ruta="registro"><PaginaRegistro /></RestriccionPorRol>} />
              <Route path="incidencias" element={<RestriccionPorRol ruta="incidencias"><PaginaIncidencias /></RestriccionPorRol>} />
              <Route path="incidencias/:incidenciaId" element={<RestriccionPorRol ruta="incidencias"><PaginaIncidencia /></RestriccionPorRol>} />
              <Route path="*" element={<PaginaEnConstruccion titulo="Página no encontrada" />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </ProveedorSesion>
  )
}
