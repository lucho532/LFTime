import '../../estilos/componentes/ListaUsuariosPrueba.css'
import { ETIQUETA_ROL } from '../../modelos/etiquetasRol'
import type { Usuario } from '../../modelos/usuario'
import { Insignia } from '../base/Insignia'

interface PropiedadesListaUsuariosPrueba {
  usuarios: Usuario[]
}

/**
 * Lista de solo lectura de los usuarios de prueba de la demostración (D9): nombre, rol y la nota que dice
 * qué caso cubre cada uno. No tienen contraseña; no se crean ni se editan aquí (la gestión de cuentas
 * reales es de la Fase 2, HU-09). No cambia datos.
 */
export function ListaUsuariosPrueba({ usuarios }: PropiedadesListaUsuariosPrueba) {
  return (
    <ul className="lista-usuarios-prueba">
      {usuarios.map((usuario) => (
        <li key={usuario.id}>
          <span>
            <strong>{usuario.nombreCompleto}</strong> <Insignia texto={ETIQUETA_ROL[usuario.rol]} tono="azul" />
          </span>
          <small>{usuario.notaDemo}</small>
        </li>
      ))}
    </ul>
  )
}
