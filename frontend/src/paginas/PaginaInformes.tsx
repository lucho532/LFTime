import '../estilos/paginas/PaginaInformes.css'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { BotonesExportacion } from '../componentes/reportes/BotonesExportacion'
import { FormularioFiltrosInforme } from '../componentes/reportes/FormularioFiltrosInforme'
import { TablaDeInforme } from '../componentes/reportes/TablaDeInforme'
import { useExportarInforme } from '../hooks/useExportarInforme'
import { useInformes } from '../hooks/useInformes'
import { TEXTO_INFORME } from '../modelos/informe'

/**
 * Pantalla de informes (HU-08): elegir un informe, filtrarlo por trabajador, hospital, municipio y periodo,
 * verlo y exportarlo a CSV o Excel. Distingue lo programado, lo efectivo y el almuerzo (D21). Los cálculos
 * son provisionales (P-03, P-05, P-06) y los archivos llevan la marca DEMO (D36). Los permisos son solo
 * visuales (D27).
 */
export function PaginaInformes() {
  const informes = useInformes()
  const exportacion = useExportarInforme(informes.tabla)

  if (informes.carga.cargando && !informes.datos) {
    return <EstadoCarga mensaje="Cargando informes…" />
  }
  if (!informes.datos) {
    return <EstadoError mensaje={informes.carga.error ?? 'No se pudieron cargar los informes.'} onReintentar={informes.carga.recargar} />
  }

  return (
    <section className="pagina-informes">
      <header>
        <h1>Informes</h1>
        <p>Consulta el cumplimiento y exporta los datos. Los cálculos son provisionales y no son una sanción.</p>
      </header>
      <Tarjeta titulo="Filtros">
        <FormularioFiltrosInforme
          datos={informes.datos}
          tipo={informes.tipo}
          filtros={informes.filtros}
          errorPeriodo={informes.errorPeriodo ?? undefined}
          onCambiarTipo={informes.setTipo}
          onCambiarFiltro={informes.cambiarFiltro}
        />
      </Tarjeta>
      <Tarjeta
        titulo={TEXTO_INFORME[informes.tipo]}
        acciones={
          <BotonesExportacion
            exportando={exportacion.exportando}
            deshabilitado={!informes.tabla || exportacion.exportando !== null}
            nombreUltimo={exportacion.nombreUltimo}
            error={exportacion.error}
            onExportar={exportacion.exportar}
          />
        }
      >
        {informes.tabla ? (
          <TablaDeInforme key={`${informes.tipo}|${JSON.stringify(informes.filtros)}`} tabla={informes.tabla} />
        ) : (
          <p role="alert">{informes.errorPeriodo}</p>
        )}
      </Tarjeta>
    </section>
  )
}
