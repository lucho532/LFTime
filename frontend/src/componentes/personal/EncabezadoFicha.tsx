import { useState, type ReactNode } from 'react'
import '../../estilos/componentes/EncabezadoFicha.css'
import type { PropietarioFoto } from '../../reglas/permisoFoto'
import { Modal } from '../base/Modal'
import { Icono } from '../iconos/Icono'
import { AvatarPersona } from './AvatarPersona'
import { SelectorFoto } from './SelectorFoto'

interface PropiedadesEncabezadoFicha {
  nombreCompleto: string
  propietario: PropietarioFoto
  tieneFoto: boolean
  /** Verdadero solo para la propia persona (`puedeCambiarFoto`): entonces la foto lleva el botón de la cámara. */
  puedeCambiarFoto: boolean
  /** Línea bajo el nombre, por ejemplo el cargo. */
  subtitulo?: ReactNode
  /** Se llama tras subir o retirar la foto con éxito. */
  onCambioFoto: () => void
}

/**
 * Cabecera de una ficha: la foto de la persona, su nombre y, si es la propia ficha, el botón de la cámara que
 * abre el selector para subir, cambiar o retirar la foto (D14, D41). Es el único lugar donde se muestra y se
 * edita la foto de perfil propia. No decide permisos: recibe `puedeCambiarFoto` ya calculado.
 */
export function EncabezadoFicha({ nombreCompleto, propietario, tieneFoto, puedeCambiarFoto, subtitulo, onCambioFoto }: PropiedadesEncabezadoFicha) {
  const [editando, setEditando] = useState(false)
  return (
    <header className="encabezado-ficha">
      <div className="encabezado-ficha__foto">
        <AvatarPersona nombreCompleto={nombreCompleto} propietario={propietario} tieneFoto={tieneFoto} tamano="grande" />
        {puedeCambiarFoto && (
          <button type="button" className="encabezado-ficha__camara" aria-label="Cambiar mi foto de perfil" title="Cambiar mi foto de perfil" onClick={() => setEditando(true)}>
            <Icono nombre="camara" tamano={18} />
          </button>
        )}
      </div>
      <div className="encabezado-ficha__textos">
        <h1>{nombreCompleto}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      <Modal abierto={editando} titulo="Mi foto de perfil" onCerrar={() => setEditando(false)}>
        <SelectorFoto nombreCompleto={nombreCompleto} propietario={propietario} tieneFoto={tieneFoto} onCambio={onCambioFoto} />
      </Modal>
    </header>
  )
}
