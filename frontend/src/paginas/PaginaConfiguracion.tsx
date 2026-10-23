import '../estilos/paginas/PaginaConfiguracion.css'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { FormularioReglas } from '../componentes/configuracion/FormularioReglas'
import { ListaUsuariosPrueba } from '../componentes/configuracion/ListaUsuariosPrueba'
import { RestablecerDatosDemo } from '../componentes/configuracion/RestablecerDatosDemo'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { useCarga } from '../hooks/useCarga'
import { useDatosDemo } from '../hooks/useDatosDemo'
import { servicios } from '../servicios/fabrica'

/**
 * Configuración (HU-09, solo administración): las reglas provisionales editables, los usuarios de prueba y
 * el restablecimiento de los datos de demostración. Todo valor se rotula «provisional». Los permisos son
 * solo visuales (D27). No contiene reglas.
 */
export function PaginaConfiguracion() {
  const carga = useCarga(async () => {
    const [reglas, usuarios] = await Promise.all([servicios.configuracion.obtenerReglas(), servicios.usuarios.listar()])
    return { reglas, usuarios }
  }, 'No se pudo cargar la configuración.')
  const datosDemo = useDatosDemo()

  if (carga.cargando && !carga.datos) {
    return <EstadoCarga mensaje="Cargando la configuración…" />
  }
  if (!carga.datos) {
    return <EstadoError mensaje={carga.error ?? 'No se pudo cargar la configuración.'} onReintentar={carga.recargar} />
  }

  return (
    <section className="pagina-configuracion">
      <header>
        <h1>Configuración</h1>
        <p>Valores provisionales de la demostración, usuarios de prueba y datos. Nada de esto es una regla laboral definitiva.</p>
      </header>
      <Tarjeta titulo="Reglas provisionales">
        <FormularioReglas
          reglas={carga.datos.reglas}
          onGuardar={(reglas) => servicios.configuracion.guardarReglas(reglas)}
          onRestablecer={() => servicios.configuracion.restablecerReglas()}
        />
      </Tarjeta>
      <Tarjeta titulo="Usuarios de prueba">
        <ListaUsuariosPrueba usuarios={carga.datos.usuarios} />
      </Tarjeta>
      <Tarjeta titulo="Datos de demostración">
        <RestablecerDatosDemo restableciendo={datosDemo.restableciendo} onRestablecer={datosDemo.restablecer} />
      </Tarjeta>
    </section>
  )
}
