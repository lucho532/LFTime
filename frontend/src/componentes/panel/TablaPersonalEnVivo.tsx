import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import '../../estilos/componentes/TablaPersonalEnVivo.css'
import type { MunicipioDto } from '../../contratos/hospital'
import { useTablaPaginada } from '../../hooks/useTablaPaginada'
import { TEXTO_ESTADO_VISIBLE, type EstadoVisible } from '../../modelos/estadoVisible'
import { NOMBRE_MARCACION } from '../../modelos/etiquetasMarcacion'
import type { FilaPersonalEnVivo } from '../../modelos/panel'
import { perteneceAIndicador, TEXTO_INDICADOR, type ClaveIndicador } from '../../reglas/indicadoresPanel'
import { formatearHora12 } from '../../utilidades/horaColombia'
import { Campo } from '../base/Campo'
import { InsigniaEstado } from '../base/InsigniaEstado'
import { Paginacion } from '../base/Paginacion'
import { Selector } from '../base/Selector'
import { Tabla, type ColumnaTabla } from '../base/Tabla'
import { EstadoVacio } from '../estados/EstadoVacio'
import { AvatarPersona } from '../personal/AvatarPersona'

interface PropiedadesTablaPersonalEnVivo {
  filas: FilaPersonalEnVivo[]
  municipios: MunicipioDto[]
  /** Indicador de una tarjeta cuyo detalle se está viendo; `null` muestra todo el personal. */
  indicador: ClaveIndicador | null
}

const ESTADOS_FILTRABLES = Object.keys(TEXTO_ESTADO_VISIBLE) as EstadoVisible[]

/**
 * Tabla «Personal en tiempo real» (HU-01): búsqueda por nombre, cédula u hospital, filtros por municipio y
 * estado, paginación y un enlace a la ficha. Si viene de una tarjeta, solo muestra a quienes cuentan en
 * ese indicador y ofrece quitar el filtro. El estado siempre lleva texto además de color (D31). Los
 * tiempos del último registro son los de las marcas. No carga ni modifica datos.
 */
export function TablaPersonalEnVivo({ filas, municipios, indicador }: PropiedadesTablaPersonalEnVivo) {
  const filasDelIndicador = useMemo(() => (indicador ? filas.filter((fila) => perteneceAIndicador(fila, indicador)) : filas), [filas, indicador])
  const tabla = useTablaPaginada(filasDelIndicador, {
    textoBuscable: (f) => `${f.trabajador.nombreCompleto} ${f.trabajador.numeroDocumento} ${f.hospitalNombre}`,
    filtros: {
      municipio: (f, valor) => f.municipioNombre === valor,
      estado: (f, valor) => (valor === 'SIN_TURNO' ? f.estado === null : f.estado === valor),
    },
  })

  const columnas: ColumnaTabla<FilaPersonalEnVivo>[] = [
    {
      clave: 'nombre',
      titulo: 'Nombre',
      render: ({ trabajador }) => (
        <span className="tabla-personal-en-vivo__persona">
          <AvatarPersona nombreCompleto={trabajador.nombreCompleto} propietario={{ trabajadorId: trabajador.id }} tieneFoto={trabajador.urlFoto !== null} tamano="pequeno" />
          <span>
            <strong>{trabajador.nombreCompleto}</strong>
            <small>{trabajador.cargo}</small>
          </span>
        </span>
      ),
    },
    { clave: 'documento', titulo: 'Cédula', render: ({ trabajador }) => trabajador.numeroDocumento },
    {
      clave: 'hospital',
      titulo: 'Hospital / Municipio',
      render: (f) => (
        <span className="tabla-personal-en-vivo__doble">
          {f.hospitalNombre}
          <small>({f.municipioNombre})</small>
        </span>
      ),
    },
    { clave: 'horario', titulo: 'Horario', render: (f) => f.horarioTexto ?? 'Sin horario' },
    {
      clave: 'estado',
      titulo: 'Estado actual',
      render: (f) => (f.estado ? <InsigniaEstado estado={f.estado} /> : <span className="tabla-personal-en-vivo__sin-turno">Sin turno por ahora</span>),
    },
    {
      clave: 'ultimo',
      titulo: 'Último registro',
      render: (f) =>
        f.ultimaMarca ? (
          <span className="tabla-personal-en-vivo__doble">
            {formatearHora12(new Date(f.ultimaMarca.instante))}
            <small>
              {NOMBRE_MARCACION[f.ultimaMarca.tipo]}
              {f.ultimaMarca.tipo === 'ENTRADA' && f.minutosRetrasoEntrada > 0 ? ` (+${f.minutosRetrasoEntrada} min)` : ''}
            </small>
          </span>
        ) : (
          'Sin registros hoy'
        ),
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: ({ trabajador }) => (
        <Link to={`/personal/${trabajador.id}`} aria-label={`Ver detalle de ${trabajador.nombreCompleto}`}>
          Ver detalle
        </Link>
      ),
    },
  ]

  return (
    <div className="tabla-personal-en-vivo">
      {indicador && (
        <p className="tabla-personal-en-vivo__indicador">
          Mostrando solo: <strong>{TEXTO_INDICADOR[indicador]}</strong> · <Link to="/inicio#personal-en-tiempo-real">Ver todo el personal</Link>
        </p>
      )}
      <div className="tabla-personal-en-vivo__filtros">
        <Campo etiqueta="Buscar" type="search" placeholder="Nombre, cédula u hospital" value={tabla.busqueda} onChange={(e) => tabla.setBusqueda(e.target.value)} />
        <Selector
          etiqueta="Municipio"
          textoVacio="Todos los municipios"
          value={tabla.valoresFiltro.municipio ?? ''}
          opciones={municipios.map((m) => ({ valor: m.nombre, etiqueta: m.nombre }))}
          onChange={(e) => tabla.setFiltro('municipio', e.target.value)}
        />
        <Selector
          etiqueta="Estado"
          textoVacio="Todos los estados"
          value={tabla.valoresFiltro.estado ?? ''}
          opciones={[...ESTADOS_FILTRABLES.map((e) => ({ valor: e, etiqueta: TEXTO_ESTADO_VISIBLE[e] })), { valor: 'SIN_TURNO', etiqueta: 'Sin turno por ahora' }]}
          onChange={(e) => tabla.setFiltro('estado', e.target.value)}
        />
      </div>
      <Tabla
        columnas={columnas}
        filas={tabla.filasPagina}
        clavePorFila={(f) => f.trabajador.id}
        descripcion="Personal en tiempo real"
        vacio={<EstadoVacio titulo="Sin personal" descripcion="Nadie coincide con la búsqueda, los filtros o el indicador elegido." />}
      />
      <Paginacion paginaActual={tabla.paginaActual} totalPaginas={tabla.totalPaginas} total={tabla.total} desde={tabla.desde} hasta={tabla.hasta} onCambiarPagina={tabla.irAPagina} />
    </div>
  )
}
