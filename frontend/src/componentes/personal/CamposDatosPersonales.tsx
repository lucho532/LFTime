import '../../estilos/componentes/CamposDatosPersonales.css'
import type { DatosPersonales } from '../../modelos/datosPersonales'
import { TIPOS_DOCUMENTO, type ErroresDatosPersonales } from '../../validadores/trabajador'
import { Campo } from '../base/Campo'
import { Selector } from '../base/Selector'

interface PropiedadesCamposDatosPersonales {
  datos: DatosPersonales
  errores: ErroresDatosPersonales
  onCambiar: (campo: keyof DatosPersonales) => (e: { target: { value: string } }) => void
}

/**
 * Campos de los datos personales comunes a trabajadores, coordinadores y administradores: nombres,
 * apellidos, documento, cargo y teléfono (P-13, lista provisional de tipos de documento). Solo los dibuja y
 * muestra sus errores; el estado y la validación son del formulario que los usa.
 */
export function CamposDatosPersonales({ datos, errores, onCambiar }: PropiedadesCamposDatosPersonales) {
  return (
    <div className="campos-datos-personales">
      <div className="campos-datos-personales__fila">
        <Campo etiqueta="Nombres" required value={datos.nombres} error={errores.nombres} onChange={onCambiar('nombres')} />
        <Campo etiqueta="Apellidos" required value={datos.apellidos} error={errores.apellidos} onChange={onCambiar('apellidos')} />
      </div>
      <div className="campos-datos-personales__fila">
        <Selector
          etiqueta="Tipo de documento"
          required
          value={datos.tipoDocumento}
          error={errores.tipoDocumento}
          ayuda="Lista provisional de tipos de documento."
          opciones={TIPOS_DOCUMENTO.map((tipo) => ({ valor: tipo.valor, etiqueta: `${tipo.valor} · ${tipo.etiqueta}` }))}
          onChange={onCambiar('tipoDocumento')}
        />
        <Campo etiqueta="Número de documento" required value={datos.numeroDocumento} error={errores.numeroDocumento} onChange={onCambiar('numeroDocumento')} />
      </div>
      <Campo etiqueta="Cargo o servicio" required value={datos.cargo} error={errores.cargo} onChange={onCambiar('cargo')} />
      <Campo etiqueta="Teléfono (opcional)" type="tel" value={datos.telefono} ayuda="Solo si es necesario para contactar a la persona." error={errores.telefono} onChange={onCambiar('telefono')} />
    </div>
  )
}
