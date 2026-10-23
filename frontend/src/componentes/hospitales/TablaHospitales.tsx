import { Link } from 'react-router-dom'
import '../../estilos/componentes/TablaHospitales.css'
import type { MunicipioDto } from '../../contratos/hospital'
import { useTablaPaginada } from '../../hooks/useTablaPaginada'
import type { Hospital } from '../../modelos/hospital'
import { Campo } from '../base/Campo'
import { Insignia } from '../base/Insignia'
import { Paginacion } from '../base/Paginacion'
import { Selector } from '../base/Selector'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'
import { EstadoCoordenadas } from './EstadoCoordenadas'

interface PropiedadesTablaHospitales {
  hospitales: Hospital[]
  municipios: MunicipioDto[]
  nombreDe: (usuarioId: string) => string
}

/**
 * Lista de hospitales con búsqueda, filtros por municipio y por estado de las coordenadas, y
 * paginación (HU-03). Muestra, con texto, si cada hospital admite marcaciones y quién es su
 * responsable. No carga ni modifica datos.
 */
export function TablaHospitales({ hospitales, municipios, nombreDe }: PropiedadesTablaHospitales) {
  const nombreMunicipio = (id: string) => municipios.find((m) => m.id === id)?.nombre ?? 'Sin municipio'
  const tabla = useTablaPaginada(hospitales, {
    textoBuscable: (h) => `${h.nombre} ${nombreMunicipio(h.municipioId)} ${h.direccion}`,
    filtros: {
      municipio: (h, valor) => h.municipioId === valor,
      coordenadas: (h, valor) => (valor === 'confirmadas' ? h.coordenadasConfirmadas : !h.coordenadasConfirmadas),
    },
  })

  const columnas: ColumnaTabla<Hospital>[] = [
    { clave: 'nombre', titulo: 'Hospital', render: (h) => <Link to={`/hospitales/${h.id}`}>{h.nombre}</Link> },
    { clave: 'municipio', titulo: 'Municipio', render: (h) => nombreMunicipio(h.municipioId) },
    { clave: 'direccion', titulo: 'Dirección', render: (h) => h.direccion },
    { clave: 'coordenadas', titulo: 'Coordenadas', render: (h) => <EstadoCoordenadas hospital={h} /> },
    {
      clave: 'responsable',
      titulo: 'Responsable',
      render: (h) => (h.coordinadorResponsableId ? nombreDe(h.coordinadorResponsableId) : <Insignia texto="Sin responsable" tono="ambar" icono="▲" />),
    },
  ]

  return (
    <div className="tabla-hospitales">
      <div className="tabla-hospitales__filtros">
        <Campo etiqueta="Buscar" type="search" placeholder="Nombre, municipio o dirección" value={tabla.busqueda} onChange={(e) => tabla.setBusqueda(e.target.value)} />
        <Selector
          etiqueta="Municipio"
          textoVacio="Todos los municipios"
          value={tabla.valoresFiltro.municipio ?? ''}
          opciones={municipios.map((m) => ({ valor: m.id, etiqueta: m.nombre }))}
          onChange={(e) => tabla.setFiltro('municipio', e.target.value)}
        />
        <Selector
          etiqueta="Coordenadas"
          textoVacio="Todas"
          value={tabla.valoresFiltro.coordenadas ?? ''}
          opciones={[
            { valor: 'confirmadas', etiqueta: 'Confirmadas' },
            { valor: 'sin-confirmar', etiqueta: 'Sin confirmar' },
          ]}
          onChange={(e) => tabla.setFiltro('coordenadas', e.target.value)}
        />
      </div>
      <Tabla
        columnas={columnas}
        filas={tabla.filasPagina}
        clavePorFila={(h) => h.id}
        descripcion="Hospitales"
        vacio={<EstadoVacio titulo="Sin hospitales" descripcion="Ningún hospital coincide con la búsqueda o los filtros." />}
      />
      <Paginacion paginaActual={tabla.paginaActual} totalPaginas={tabla.totalPaginas} total={tabla.total} desde={tabla.desde} hasta={tabla.hasta} onCambiarPagina={tabla.irAPagina} />
    </div>
  )
}
