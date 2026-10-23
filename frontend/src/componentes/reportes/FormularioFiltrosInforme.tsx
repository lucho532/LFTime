import '../../estilos/componentes/FormularioFiltrosInforme.css'
import type { FiltrosInforme, TipoInforme } from '../../modelos/informe'
import { TEXTO_INFORME, TIPOS_INFORME } from '../../modelos/informe'
import type { DatosInformes } from '../../modelos/informe'
import { Campo } from '../base/Campo'
import { Selector } from '../base/Selector'

interface PropiedadesFormularioFiltrosInforme {
  datos: DatosInformes
  tipo: TipoInforme
  filtros: FiltrosInforme
  /** Mensaje de error del periodo; `undefined` si es válido. */
  errorPeriodo?: string
  onCambiarTipo: (tipo: TipoInforme) => void
  onCambiarFiltro: (nombre: keyof FiltrosInforme, valor: string) => void
}

/**
 * Controles de la pantalla de informes (HU-08): el informe a ver y los filtros por trabajador, hospital,
 * municipio y periodo. Solo recoge lo que la persona elige y muestra el error del periodo; no calcula ni
 * valida.
 */
export function FormularioFiltrosInforme({ datos, tipo, filtros, errorPeriodo, onCambiarTipo, onCambiarFiltro }: PropiedadesFormularioFiltrosInforme) {
  return (
    <form className="formulario-filtros-informe" onSubmit={(evento) => evento.preventDefault()} aria-label="Filtros del informe">
      <Selector
        etiqueta="Informe"
        value={tipo}
        opciones={TIPOS_INFORME.map((valor) => ({ valor, etiqueta: TEXTO_INFORME[valor] }))}
        onChange={(e) => onCambiarTipo(e.target.value as TipoInforme)}
      />
      <Selector
        etiqueta="Trabajador"
        textoVacio="Todo el personal"
        value={filtros.trabajadorId}
        opciones={datos.trabajadores.map((t) => ({ valor: t.id, etiqueta: t.nombreCompleto }))}
        onChange={(e) => onCambiarFiltro('trabajadorId', e.target.value)}
      />
      <Selector
        etiqueta="Hospital"
        textoVacio="Todos los hospitales"
        value={filtros.hospitalId}
        opciones={datos.hospitales.map((h) => ({ valor: h.id, etiqueta: h.nombre }))}
        onChange={(e) => onCambiarFiltro('hospitalId', e.target.value)}
      />
      <Selector
        etiqueta="Municipio"
        textoVacio="Todos los municipios"
        value={filtros.municipioId}
        opciones={datos.municipios.map((m) => ({ valor: m.id, etiqueta: m.nombre }))}
        onChange={(e) => onCambiarFiltro('municipioId', e.target.value)}
      />
      <Campo etiqueta="Desde" type="date" value={filtros.desde} error={errorPeriodo} onChange={(e) => onCambiarFiltro('desde', e.target.value)} />
      <Campo etiqueta="Hasta" type="date" value={filtros.hasta} onChange={(e) => onCambiarFiltro('hasta', e.target.value)} />
    </form>
  )
}
