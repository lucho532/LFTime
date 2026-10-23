import { Link } from 'react-router-dom'
import '../../estilos/componentes/TablaPersonal.css'
import type { MunicipioDto } from '../../contratos/hospital'
import { useTablaPaginada } from '../../hooks/useTablaPaginada'
import { ESTADOS_TRABAJADOR, TEXTO_ESTADO_TRABAJADOR } from '../../modelos/estadoTrabajador'
import type { Hospital } from '../../modelos/hospital'
import type { Trabajador } from '../../modelos/trabajador'
import { Campo } from '../base/Campo'
import { Paginacion } from '../base/Paginacion'
import { Selector } from '../base/Selector'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'
import { AvatarPersona } from './AvatarPersona'
import { InsigniaEstadoTrabajador } from './InsigniaEstadoTrabajador'

interface PropiedadesTablaPersonal {
  trabajadores: Trabajador[]
  hospitales: Hospital[]
  municipios: MunicipioDto[]
}

/**
 * Lista de personal con búsqueda por nombre, documento, cargo u hospital; filtros por hospital y por
 * estado; y paginación (HU-02). Muestra la cédula y la foto solo a quien puede verla. No carga ni
 * modifica datos.
 */
export function TablaPersonal({ trabajadores, hospitales, municipios }: PropiedadesTablaPersonal) {
  const hospitalDe = (id: string) => hospitales.find((h) => h.id === id)
  const municipioDe = (hospitalId: string) => municipios.find((m) => m.id === hospitalDe(hospitalId)?.municipioId)?.nombre ?? ''
  const tabla = useTablaPaginada(trabajadores, {
    textoBuscable: (t) => `${t.nombreCompleto} ${t.numeroDocumento} ${t.cargo} ${hospitalDe(t.hospitalId)?.nombre ?? ''} ${municipioDe(t.hospitalId)}`,
    filtros: {
      hospital: (t, valor) => t.hospitalId === valor,
      estado: (t, valor) => t.estado === valor,
    },
  })

  const columnas: ColumnaTabla<Trabajador>[] = [
    {
      clave: 'nombre',
      titulo: 'Nombre',
      render: (t) => (
        <span className="tabla-personal__persona">
          <AvatarPersona nombreCompleto={t.nombreCompleto} propietario={{ trabajadorId: t.id }} tieneFoto={t.urlFoto !== null} tamano="pequeno" />
          <span>
            <Link to={`/personal/${t.id}`}>{t.nombreCompleto}</Link>
            <small>{t.cargo}</small>
          </span>
        </span>
      ),
    },
    { clave: 'documento', titulo: 'Cédula', render: (t) => `${t.tipoDocumento} ${t.numeroDocumento}` },
    { clave: 'hospital', titulo: 'Hospital / Municipio', render: (t) => `${hospitalDe(t.hospitalId)?.nombre ?? 'Sin hospital'} (${municipioDe(t.hospitalId)})` },
    { clave: 'estado', titulo: 'Estado', render: (t) => <InsigniaEstadoTrabajador estado={t.estado} /> },
  ]

  return (
    <div className="tabla-personal">
      <div className="tabla-personal__filtros">
        <Campo etiqueta="Buscar" type="search" placeholder="Nombre, documento, cargo u hospital" value={tabla.busqueda} onChange={(e) => tabla.setBusqueda(e.target.value)} />
        <Selector
          etiqueta="Hospital"
          textoVacio="Todos los hospitales"
          value={tabla.valoresFiltro.hospital ?? ''}
          opciones={hospitales.map((h) => ({ valor: h.id, etiqueta: h.nombre }))}
          onChange={(e) => tabla.setFiltro('hospital', e.target.value)}
        />
        <Selector
          etiqueta="Estado"
          textoVacio="Todos los estados"
          value={tabla.valoresFiltro.estado ?? ''}
          opciones={ESTADOS_TRABAJADOR.map((estado) => ({ valor: estado, etiqueta: TEXTO_ESTADO_TRABAJADOR[estado] }))}
          onChange={(e) => tabla.setFiltro('estado', e.target.value)}
        />
      </div>
      <Tabla
        columnas={columnas}
        filas={tabla.filasPagina}
        clavePorFila={(t) => t.id}
        descripcion="Personal"
        vacio={<EstadoVacio titulo="Sin personal" descripcion="Ningún trabajador coincide con la búsqueda o los filtros." />}
      />
      <Paginacion paginaActual={tabla.paginaActual} totalPaginas={tabla.totalPaginas} total={tabla.total} desde={tabla.desde} hasta={tabla.hasta} onCambiarPagina={tabla.irAPagina} />
    </div>
  )
}
