import { useState } from 'react'
import { useParams } from 'react-router-dom'
import '../estilos/paginas/PaginaUsuario.css'
import { BotonEditar } from '../componentes/base/BotonEditar'
import { Modal } from '../componentes/base/Modal'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { Confirmacion } from '../componentes/estados/Confirmacion'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { DatosDelUsuario } from '../componentes/personal/DatosDelUsuario'
import { EncabezadoFicha } from '../componentes/personal/EncabezadoFicha'
import { FormularioUsuario } from '../componentes/personal/FormularioUsuario'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import type { DatosUsuario } from '../modelos/usuario'
import { puedeCambiarFoto, puedeEditarFichaDeUsuario } from '../reglas/permisosPersonal'
import { servicios } from '../servicios/fabrica'
import { PaginaAccesoRestringido } from './PaginaAccesoRestringido'

/**
 * Ficha de un administrador o coordinador (P-13): su foto y sus datos personales, con un lápiz en la tarjeta
 * para editarlos. Cada persona abre y edita la suya; el administrador abre y edita la de cualquiera (provisional,
 * P-21). El rol, los hospitales a cargo y la foto de otra persona no se cambian aquí. Los permisos son solo
 * visuales (D27).
 */
export function PaginaUsuario() {
  const { usuarioId = '' } = useParams()
  const { usuario, recargar: recargarSesion } = useSesion()
  const [editando, setEditando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const carga = useCarga(
    async () => {
      const [persona, hospitales] = await Promise.all([servicios.usuarios.obtenerPorId(usuarioId), servicios.hospitales.listar()])
      return { persona, hospitales }
    },
    'No se pudo cargar la ficha.',
    [usuarioId],
  )

  if (!puedeEditarFichaDeUsuario(usuario, usuarioId)) {
    return <PaginaAccesoRestringido />
  }
  if (carga.cargando && !carga.datos) {
    return <EstadoCarga mensaje="Cargando ficha…" />
  }
  if (carga.error || !carga.datos) {
    return <EstadoError mensaje={carga.error ?? 'No se pudo cargar la ficha.'} onReintentar={carga.recargar} />
  }
  const { persona, hospitales } = carga.datos
  if (!persona || persona.rol === 'TRABAJADOR') {
    return <EstadoError mensaje="No se encontró a esta persona. Puede que se haya restablecido la demostración." />
  }
  const propietarioFoto = { usuarioId: persona.id }

  async function guardar(datos: DatosUsuario) {
    await servicios.usuarios.actualizarDatosPersonales(persona!.id, datos, usuario!.id)
    if (persona!.id === usuario!.id) {
      await recargarSesion()
    }
    setEditando(false)
    setMensaje('Datos guardados en esta demostración.')
    carga.recargar()
  }

  return (
    <section className="pagina-usuario">
      <EncabezadoFicha
        nombreCompleto={persona.nombreCompleto}
        propietario={propietarioFoto}
        tieneFoto={persona.urlFoto !== null}
        puedeCambiarFoto={puedeCambiarFoto(usuario, propietarioFoto)}
        subtitulo={persona.cargo}
        onCambioFoto={carga.recargar}
      />
      {mensaje && <Confirmacion mensaje={mensaje} onCerrar={() => setMensaje(null)} />}
      <div className="pagina-usuario__rejilla">
        <Tarjeta titulo="Datos" acciones={<BotonEditar etiqueta="Editar datos personales" onClick={() => setEditando(true)} />}>
          <DatosDelUsuario usuario={persona} hospitalesAsignados={hospitales.filter((h) => h.coordinadorResponsableId === persona.id)} />
        </Tarjeta>
      </div>
      <Modal abierto={editando} titulo="Editar datos personales" onCerrar={() => setEditando(false)}>
        <FormularioUsuario
          inicial={{
            nombres: persona.nombres,
            apellidos: persona.apellidos,
            tipoDocumento: persona.tipoDocumento || 'CC',
            numeroDocumento: persona.numeroDocumento,
            cargo: persona.cargo,
            telefono: persona.telefono,
          }}
          onGuardar={guardar}
          onCancelar={() => setEditando(false)}
        />
      </Modal>
    </section>
  )
}
