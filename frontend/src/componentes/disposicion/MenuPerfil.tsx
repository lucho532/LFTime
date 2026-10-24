import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../estilos/componentes/MenuPerfil.css'
import { useSesion } from '../../hooks/useSesion'
import { useTema } from '../../hooks/useTema'
import { ETIQUETA_ROL } from '../../modelos/etiquetasRol'
import { rutaDeFichaDe } from '../../reglas/permisosPersonal'
import { Icono } from '../iconos/Icono'

/**
 * Menú del usuario en la barra superior (administración y coordinación): muestra su nombre y rol, lleva a su
 * ficha y permite cambiar de usuario de prueba (cierra la sesión y vuelve al ingreso). No muestra ni edita la
 * foto de perfil: esa vive solo en la ficha de cada persona (D41).
 * Permite alternar entre el tema claro y el oscuro (D32); el botón dice a qué tema cambia. Se cierra con
 * Escape o al pulsar fuera.
 * No decide permisos.
 */
export function MenuPerfil() {
  const { usuario, salir } = useSesion()
  const navegar = useNavigate()
  const { tema, alternar: alternarTema } = useTema()
  const [abierto, setAbierto] = useState(false)
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
  async function cerrarSesion() {
    setAbierto(false)
    await salir()
    navegar('/ingreso')
  }

  return (
    <div className="menu-perfil" ref={contenedor}>
      <button type="button" className="menu-perfil__boton" aria-expanded={abierto} aria-controls={idLista} onClick={() => setAbierto(!abierto)}>
        <Icono nombre="usuario" />
        <span className="menu-perfil__datos">
          <span className="menu-perfil__nombre">{usuario.nombreCompleto}</span>
          <span className="menu-perfil__rol">{ETIQUETA_ROL[usuario.rol]}</span>
        </span>
        <Icono nombre="flecha" />
      </button>
      {abierto && (
        <ul id={idLista} className="menu-perfil__lista">
          <li>
            <Link to={rutaDeFichaDe(usuario)} onClick={() => setAbierto(false)}>
              Mi ficha
            </Link>
          </li>
          <li>
            <button type="button" onClick={alternarTema}>
              {tema === 'claro' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
            </button>
          </li>
          <li>
            <button type="button" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
