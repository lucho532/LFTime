import { useEffect, useId, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import '../../estilos/componentes/DisposicionBase.css'
import { useSesion } from '../../hooks/useSesion'
import { entradasMenuDe } from '../../reglas/permisosRuta'
import { AvisoModoDemo } from './AvisoModoDemo'
import { BarraLateral } from './BarraLateral'
import { BarraSuperior } from './BarraSuperior'

/**
 * Disposición de las pantallas con sesión: aviso de demostración, barra superior, navegación
 * lateral por rol y contenido. En pantallas pequeñas la navegación se abre con el botón de menú
 * y se cierra al cambiar de página. No decide permisos: usa la matriz de `reglas/permisosRuta`.
 */
export function DisposicionBase() {
  const { usuario } = useSesion()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const idMenu = useId()
  const { pathname } = useLocation()

  useEffect(() => setMenuAbierto(false), [pathname])

  if (!usuario) {
    return null
  }
  return (
    <div className="disposicion-base">
      <AvisoModoDemo />
      <BarraSuperior menuAbierto={menuAbierto} onAlternarMenu={() => setMenuAbierto(!menuAbierto)} idMenu={idMenu} />
      <div className="disposicion-base__cuerpo">
        <BarraLateral id={idMenu} entradas={entradasMenuDe(usuario.rol)} abierta={menuAbierto} />
        <main className="disposicion-base__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
