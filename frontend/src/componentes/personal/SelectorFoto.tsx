import { useId, useRef } from 'react'
import '../../estilos/componentes/SelectorFoto.css'
import { FORMATOS_FOTO } from '../../configuracion/limitesFotos'
import { useFotoPerfil } from '../../hooks/useFotoPerfil'
import type { PropietarioFoto } from '../../reglas/permisoFoto'
import { Aviso } from '../base/Aviso'
import { Boton } from '../base/Boton'
import { AvatarPersona } from './AvatarPersona'

interface PropiedadesSelectorFoto {
  nombreCompleto: string
  propietario: PropietarioFoto
  /** Indica si hoy tiene foto, para ofrecer «Retirar». Se actualiza al subir o retirar. */
  tieneFoto: boolean
  /** Se llama tras subir o retirar con éxito, para que la pantalla recargue sus datos. */
  onCambio?: () => void
}

const ACEPTADOS = Object.keys(FORMATOS_FOTO).join(',')

/**
 * Controles de la foto de perfil de una persona (D14, D24): subir o cambiar y retirar. Acepta JPG, JPEG,
 * PNG y WebP; una foto de más de 2 MB se reduce sola. Retirar no borra el historial de asistencia. La
 * foto es opcional y la aplicación funciona igual sin ella. Solo se muestra a quien puede cambiar esa foto
 * (ver `puedeCambiarFoto`); este componente no decide permisos.
 */
export function SelectorFoto({ nombreCompleto, propietario, tieneFoto, onCambio }: PropiedadesSelectorFoto) {
  const idEntrada = useId()
  const entrada = useRef<HTMLInputElement>(null)
  const { procesando, mensaje, subir, retirar } = useFotoPerfil(propietario)

  async function alElegir(archivos: FileList | null) {
    const archivo = archivos?.[0]
    if (archivo && (await subir(archivo))) {
      onCambio?.()
    }
    if (entrada.current) {
      entrada.current.value = ''
    }
  }

  return (
    <div className="selector-foto">
      <AvatarPersona nombreCompleto={nombreCompleto} propietario={propietario} tieneFoto={tieneFoto} tamano="grande" />
      <div className="selector-foto__controles">
        <input id={idEntrada} ref={entrada} className="selector-foto__entrada" type="file" accept={ACEPTADOS} disabled={procesando} onChange={(e) => void alElegir(e.target.files)} />
        <Boton variante="secundario" cargando={procesando} onClick={() => entrada.current?.click()}>
          {tieneFoto ? 'Cambiar foto' : 'Subir foto'}
        </Boton>
        {tieneFoto && (
          <Boton variante="texto" disabled={procesando} onClick={async () => (await retirar()) && onCambio?.()}>
            Retirar foto
          </Boton>
        )}
        <p className="selector-foto__ayuda">JPG, JPEG, PNG o WebP. Si pesa más de 2 MB se reduce sola. La foto es opcional y retirarla no borra el historial de asistencia.</p>
        {mensaje && <Aviso tipo={mensaje.tipo === 'exito' ? 'exito' : 'error'}>{mensaje.texto}</Aviso>}
      </div>
    </div>
  )
}
