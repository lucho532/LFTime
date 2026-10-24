import '../../estilos/componentes/DatosDelUsuario.css'
import { ETIQUETA_ROL } from '../../modelos/etiquetasRol'
import type { Hospital } from '../../modelos/hospital'
import type { Usuario } from '../../modelos/usuario'

interface PropiedadesDatosDelUsuario {
  usuario: Usuario
  /** Hospitales de los que es responsable (solo se muestran si es coordinador). */
  hospitalesAsignados: Hospital[]
}

/**
 * Datos personales de un administrador o coordinador: documento, cargo, contacto y rol, y los hospitales a
 * su cargo si es coordinador (D28). Solo los datos estrictamente necesarios (P-13). Solo muestra; no edita.
 */
export function DatosDelUsuario({ usuario, hospitalesAsignados }: PropiedadesDatosDelUsuario) {
  return (
    <dl className="datos-del-usuario">
      <dt>Documento</dt>
      <dd>{usuario.numeroDocumento === '' ? 'No registrado' : `${usuario.tipoDocumento} ${usuario.numeroDocumento}`}</dd>
      <dt>Cargo o servicio</dt>
      <dd>{usuario.cargo === '' ? 'No registrado' : usuario.cargo}</dd>
      <dt>Teléfono</dt>
      <dd>{usuario.telefono === '' ? 'No registrado' : usuario.telefono}</dd>
      <dt>Rol</dt>
      <dd>{ETIQUETA_ROL[usuario.rol]}</dd>
      {usuario.rol === 'COORDINADOR' && (
        <>
          <dt>Hospitales a cargo</dt>
          <dd>{hospitalesAsignados.length === 0 ? 'Ninguno' : hospitalesAsignados.map((h) => h.nombre).join(', ')}</dd>
        </>
      )}
    </dl>
  )
}
