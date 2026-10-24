import { useState } from 'react'
import '../../estilos/componentes/FormularioFiltrosInforme.css'
import type { FiltrosInforme, TipoInforme } from '../../modelos/informe'
import { TEXTO_INFORME, TIPOS_INFORME } from '../../modelos/informe'
import type { DatosInformes } from '../../modelos/informe'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'
import { Selector } from '../base/Selector'

interface PropiedadesFormularioFiltrosInforme {
  datos: DatosInformes
  tipo: TipoInforme
  filtros: FiltrosInforme
  /** Mensaje de error del periodo; `undefined` si es válido. */
  errorPeriodo?: string
  onCambiarTipo: (tipo: TipoInforme) => void
  onCambiarFiltro: (nombre: keyof FiltrosInforme, valor: string | boolean) => void
}

/**
 * Controles de la pantalla de informes (HU-08): el informe a ver y los filtros por trabajador, hospital,
 * municipio y periodo. Las fechas están ocultas: aparecen al pulsar «Filtrar por fechas» (por defecto el periodo
 * es el de hoy, o el mes en curso en los informes mensuales). Solo recoge lo que la persona elige y muestra el error del periodo; no calcula ni
 * valida.
 */
export function FormularioFiltrosInforme({ datos, tipo, filtros, errorPeriodo, onCambiarTipo, onCambiarFiltro }: PropiedadesFormularioFiltrosInforme) {
  const [verFechas, setVerFechas] = useState(false)
  const periodo = filtros.desde === filtros.hasta ? `el ${filtros.desde}` : `del ${filtros.desde} al ${filtros.hasta}`
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
      <div className="formulario-filtros-informe__periodo">
        <Boton variante="secundario" aria-expanded={verFechas} aria-controls="fechas-del-informe" onClick={() => setVerFechas(!verFechas)}>
          {verFechas ? 'Ocultar fechas' : 'Filtrar por fechas'}
        </Boton>
        <span>Mostrando {periodo}</span>
      </div>
      {verFechas && (
        <div id="fechas-del-informe" className="formulario-filtros-informe__fechas">
          <Campo etiqueta="Desde" type="date" value={filtros.desde} error={errorPeriodo} onChange={(e) => onCambiarFiltro('desde', e.target.value)} />
          <Campo etiqueta="Hasta" type="date" value={filtros.hasta} onChange={(e) => onCambiarFiltro('hasta', e.target.value)} />
        </div>
      )}
      <label className="formulario-filtros-informe__casilla">
        <input type="checkbox" checked={filtros.soloConIncidencias} onChange={(e) => onCambiarFiltro('soloConIncidencias', e.target.checked)} />
        Solo personal con incidencias en el periodo
      </label>
    </form>
  )
}
