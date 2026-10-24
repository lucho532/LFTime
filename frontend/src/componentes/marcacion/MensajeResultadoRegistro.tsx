import type { ResultadoRegistro } from '../../modelos/jornada'
import { NOMBRE_MARCACION } from '../../modelos/etiquetasMarcacion'
import { formatearHora12 } from '../../utilidades/horaColombia'
import { mensajeDeIntentoRechazado, mensajeDeSecuencia } from '../../utilidades/mensajesRegistro'
import { Aviso } from '../base/Aviso'
import { EnlaceUbicacion } from '../base/EnlaceUbicacion'

interface PropiedadesMensajeResultadoRegistro {
  resultado: ResultadoRegistro | null
  /** Error técnico al guardar en la demostración. */
  error: string | null
  /** Límites provisionales del hospital, para explicar un rechazo. */
  limites: { radioMetros: number; precisionMetros: number }
}

/**
 * Resultado del último intento de registro, con la causa y cómo corregirla (CA-1). Una marcación válida
 * aclara que la ubicación fue **capturada**, no verificada por un servidor (D13, CA-10). No decide nada.
 */
export function MensajeResultadoRegistro({ resultado, error, limites }: PropiedadesMensajeResultadoRegistro) {
  if (error) {
    return <Aviso tipo="error">{error}</Aviso>
  }
  if (!resultado) {
    return null
  }
  switch (resultado.resultado) {
    case 'REGISTRADA': {
      const { marcacion } = resultado
      return (
        <Aviso tipo="exito" titulo="Registro guardado en esta demostración">
          {NOMBRE_MARCACION[marcacion.tipo]} a las {formatearHora12(new Date(marcacion.instante))}. Ubicación capturada en tu dispositivo (± {Math.round(marcacion.ubicacion.precisionMetros)} m): <EnlaceUbicacion ubicacion={marcacion.ubicacion} />. No está validada por un servidor.
        </Aviso>
      )
    }
    case 'RECHAZADA':
      return (
        <Aviso tipo="advertencia" titulo={resultado.intento.esFalloTecnico ? 'No se registró (fallo técnico)' : 'No se registró'}>
          {mensajeDeIntentoRechazado(resultado.intento, limites)}
        </Aviso>
      )
    case 'SECUENCIA_INVALIDA':
      return <Aviso tipo="advertencia">{mensajeDeSecuencia(resultado.motivo)}</Aviso>
    case 'HOSPITAL_SIN_COORDENADAS':
      return <Aviso tipo="advertencia">Tu hospital necesita configuración antes de habilitar el registro.</Aviso>
  }
}
