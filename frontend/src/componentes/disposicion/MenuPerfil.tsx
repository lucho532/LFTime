import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../estilos/componentes/MenuPerfil.css'
import { useSesion } from '../../hooks/useSesion'
import { ETIQUETA_ROL } from '../../modelos/etiquetasRol'
import { Modal } from '../base/Modal'
import { Icono } from '../iconos/Icono'
import { AvatarPersona } from '../personal/AvatarPersona'
import { SelectorFoto } from '../personal/SelectorFoto'

/**
 * Menú del usuario en la barra superior: muestra su nombre, rol y foto, y permite cambiar su foto de
 * perfil (D14, todo usuario puede) y cambiar de usuario de prueba (cierra la sesión y vuelve al ingreso).
 * Se cierra con Escape o al pulsar fuera. El cambio de tema claro/oscuro se añadirá aquí en T-12.3.
 * No decide permisos.
 */
export function MenuPerfil() {
  const { usuario, salir } = useSesion()
  const navegar = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [editandoFoto, setEditandoFoto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const idLista = useId()

  useEffect(() => {
    if (!abierto) {
      return undefined
    }
    const cerrarSiFuera = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) {
        setAbierto(false)
      }
    }
    const cerrarConEscape = (evento: KeyboardEvent) => evento.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', cerrarSiFuera)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('mousedown', cerrarSiFuera)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [abierto])

  if (!usuario) {
    return null
  }
  const propietario = { usuarioId: usuario.id, trabajadorId: usuario.trabajadorId ?? undefined }

  async function cerrarSesion() {
    setAbierto(false)
    await salir()
    navegar('/ingreso')
  }

  return (
    <div className="menu-perfil" ref={contenedor}>
      <button type="button" className="menu-perfil__boton" aria-expanded={abierto} aria-controls={idLista} onClick={() => setAbierto(!abierto)}>
        <AvatarPersona nombreCompleto={usuario.nombreCompleto} propietario={propietario} />
        <span className="menu-perfil__datos">
          <span className="menu-perfil__nombre">{usuario.nombreCompleto}</span>
          <span className="menu-perfil__rol">{ETIQUETA_ROL[usuario.rol]}</span>
        </span>
        <Icono nombre="flecha" />
      </button>
      {abierto && (
        <ul id={idLista} className="menu-perfil__lista">
          <li>
            <button
              type="button"
              onClick={() => {
                setAbierto(false)
                setEditandoFoto(true)
              }}
            >
              Mi foto de perfil
            </button>
          </li>
          <li>
            <button type="button" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      )}
      <Modal abierto={editandoFoto} titulo="Mi foto de perfil" onCerrar={() => setEditandoFoto(false)}>
        <SelectorFoto nombreCompleto={usuario.nombreCompleto} propietario={propietario} tieneFoto={usuario.urlFoto !== null} />
      </Modal>
    </div>
  )
}
