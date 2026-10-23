import { Link, useParams } from 'react-router-dom'
import '../estilos/paginas/PaginaIncidencia.css'
import { Aviso } from '../componentes/base/Aviso'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { Confirmacion } from '../componentes/estados/Confirmacion'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { EstadoVacio } from '../componentes/estados/EstadoVacio'
import { AccionesDeIncidencia } from '../componentes/incidencias/AccionesDeIncidencia'
import { DatosIncidencia } from '../componentes/incidencias/DatosIncidencia'
import { HistorialIncidencia } from '../componentes/incidencias/HistorialIncidencia'
import { IntentosDeIncidencia } from '../componentes/incidencias/IntentosDeIncidencia'
import { useDetalleIncidencia } from '../hooks/useDetalleIncidencia'
import { useSesion } from '../hooks/useSesion'
import { TEXTO_TIPO_INCIDENCIA } from '../modelos/etiquetasIncidencia'

/**
 * Detalle de una incidencia (HU-06): datos, intentos asociados, justificaciones, historial y las acciones
 * que cada rol puede ejecutar. Abrirla marca su alerta como revisada para quien revisa (P-19). Los permisos
 * son solo visuales (D27). No contiene reglas de negocio.
 */
export function PaginaIncidencia() {
  const { incidenciaId = '' } = useParams()
  const { usuario } = useSesion()
  const detalle = useDetalleIncidencia(incidenciaId, usuario)
  const { carga, datos, permisos, acciones } = detalle

  if (carga.cargando && !datos) {
    return <EstadoCarga mensaje="Cargando la incidencia…" />
  }
  if (carga.error) {
    return <EstadoError mensaje={carga.error} onReintentar={carga.recargar} />
  }
  if (!datos || !permisos?.ver || !acciones) {
    return (
      <section className="pagina-incidencia">
        <EstadoVacio titulo="Incidencia no disponible" descripcion="No existe o no tienes acceso a esta incidencia." accion={<Link to="/incidencias">Volver a incidencias</Link>} />
      </section>
    )
  }

  const { incidencia, intentos, trabajadores, hospitales, usuarios } = datos
  const trabajador = trabajadores.find((t) => t.id === incidencia.trabajadorId)?.nombreCompleto ?? 'Persona no disponible'
  const hospital = hospitales.find((h) => h.id === incidencia.hospitalId)?.nombre ?? 'Hospital no disponible'
  const revisor = incidencia.revisorPrincipalId ? detalle.nombreDe(incidencia.revisorPrincipalId) : null
  const coordinadores = usuarios.filter((u) => u.rol === 'COORDINADOR').map((u) => ({ valor: u.id, etiqueta: u.nombreCompleto }))

  return (
    <section className="pagina-incidencia">
      <header>
        <Link to="/incidencias">← Incidencias</Link>
        <h1>{TEXTO_TIPO_INCIDENCIA[incidencia.tipo]}</h1>
      </header>
      {detalle.mensaje && <Confirmacion mensaje={detalle.mensaje} onCerrar={detalle.cerrarMensaje} />}
      {detalle.errorAccion && <Aviso tipo="error">{detalle.errorAccion}</Aviso>}
      <Tarjeta titulo="Datos">
        <DatosIncidencia incidencia={incidencia} trabajador={trabajador} hospital={hospital} revisor={revisor} nombreDe={detalle.nombreDe} />
      </Tarjeta>
      {incidencia.tipo === 'UBICACION_NO_AUTORIZADA' && (
        <Tarjeta titulo={`Intentos asociados (${intentos.length})`}>
          <IntentosDeIncidencia intentos={intentos} />
        </Tarjeta>
      )}
      <Tarjeta titulo="Justificaciones e historial">
        <HistorialIncidencia incidencia={incidencia} nombreDe={detalle.nombreDe} />
      </Tarjeta>
      <Tarjeta titulo="Acciones">
        <AccionesDeIncidencia permisos={permisos} acciones={acciones} enNombreDelTrabajador={usuario?.rol === 'COORDINADOR'} coordinadores={coordinadores} />
      </Tarjeta>
    </section>
  )
}
