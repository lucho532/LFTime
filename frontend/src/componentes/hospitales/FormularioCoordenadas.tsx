import { useState, type FormEvent } from 'react'
import '../../estilos/componentes/FormularioCoordenadas.css'
import { useUbicacion } from '../../hooks/useUbicacion'
import type { EntradaCoordenadas, Hospital } from '../../modelos/hospital'
import { validarCoordenadas, type ResultadoCoordenadas } from '../../validadores/coordenadas'
import { Aviso } from '../base/Aviso'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'
import { EstadoCarga } from '../estados/EstadoCarga'

type Modo = 'manual' | 'gps'

interface PropiedadesFormularioCoordenadas {
  hospital: Hospital
  /** Confirma las coordenadas. Si lanza un error, el mensaje se muestra en el formulario. */
  onConfirmar: (coordenadas: EntradaCoordenadas) => Promise<void>
}

/**
 * Formulario para configurar las coordenadas de un hospital (D22, CA-7). Ofrece dos formas:
 * escribir latitud y longitud, o usar el GPS actual de quien configura estando en el hospital.
 *
 * - Manual: valida los rangos y muestra todos los errores juntos.
 * - GPS: pide permiso, comprueba que hay una posición válida y **muestra su precisión antes de
 *   confirmar**; si falla, explica la causa y permite reintentar.
 *
 * No guarda por sí mismo: entrega las coordenadas a `onConfirmar`. No decide quién puede usarlo.
 */
export function FormularioCoordenadas({ hospital, onConfirmar }: PropiedadesFormularioCoordenadas) {
  const [modo, setModo] = useState<Modo>('manual')
  const [latitud, setLatitud] = useState(hospital.coordenadas ? String(hospital.coordenadas.latitud) : '')
  const [longitud, setLongitud] = useState(hospital.coordenadas ? String(hospital.coordenadas.longitud) : '')
  const [validacion, setValidacion] = useState<ResultadoCoordenadas | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const ubicacion = useUbicacion()

  async function confirmar(coordenadas: EntradaCoordenadas) {
    setError(null)
    setConfirmando(true)
    try {
      await onConfirmar(coordenadas)
      ubicacion.limpiar()
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudieron confirmar las coordenadas.')
    } finally {
      setConfirmando(false)
    }
  }

  async function enviarManual(evento: FormEvent) {
    evento.preventDefault()
    const resultado = validarCoordenadas(latitud, longitud)
    setValidacion(resultado)
    if (resultado.latitud.error === null && resultado.longitud.error === null) {
      await confirmar({ latitud: resultado.latitud.valor, longitud: resultado.longitud.valor, origen: 'MANUAL' })
    }
  }

  const posicion = ubicacion.ubicacion
  return (
    <div className="formulario-coordenadas">
      <fieldset className="formulario-coordenadas__modo">
        <legend>¿Cómo quieres configurarlas?</legend>
        <label>
          <input type="radio" name="modo-coordenadas" checked={modo === 'manual'} onChange={() => setModo('manual')} /> Escribir latitud y longitud
        </label>
        <label>
          <input type="radio" name="modo-coordenadas" checked={modo === 'gps'} onChange={() => setModo('gps')} /> Usar mi ubicación GPS actual (estando en el hospital)
        </label>
      </fieldset>

      {modo === 'manual' && (
        <form className="formulario-coordenadas__manual" onSubmit={enviarManual} noValidate>
          <Campo etiqueta="Latitud" inputMode="decimal" value={latitud} ayuda="Entre -90 y 90. Ejemplo: 5.0689" error={validacion?.latitud.error ?? undefined} onChange={(e) => setLatitud(e.target.value)} />
          <Campo etiqueta="Longitud" inputMode="decimal" value={longitud} ayuda="Entre -180 y 180. Ejemplo: -75.5174" error={validacion?.longitud.error ?? undefined} onChange={(e) => setLongitud(e.target.value)} />
          <Boton type="submit" cargando={confirmando}>
            Confirmar coordenadas
          </Boton>
        </form>
      )}

      {modo === 'gps' && (
        <div className="formulario-coordenadas__gps">
          <p>Colócate dentro del hospital. El navegador te pedirá permiso para usar tu ubicación.</p>
          {ubicacion.estado === 'obteniendo' && <EstadoCarga mensaje="Obteniendo tu ubicación…" />}
          {ubicacion.estado === 'fallo' && <Aviso tipo="error" titulo="No se pudo obtener la ubicación">{ubicacion.mensaje}</Aviso>}
          {ubicacion.estado === 'listo' && posicion && (
            <div className="formulario-coordenadas__resultado">
              <dl>
                <dt>Latitud</dt>
                <dd>{posicion.latitud.toFixed(6)}</dd>
                <dt>Longitud</dt>
                <dd>{posicion.longitud.toFixed(6)}</dd>
                <dt>Precisión</dt>
                <dd>± {Math.round(posicion.precisionMetros)} m</dd>
              </dl>
              {posicion.precisionMetros > hospital.precisionMaximaMetros && (
                <Aviso tipo="advertencia" titulo="Precisión baja">
                  La precisión (± {Math.round(posicion.precisionMetros)} m) es mayor que la máxima provisional para marcar ({hospital.precisionMaximaMetros} m). Puedes confirmar, pero conviene repetir la captura en un lugar más abierto.
                </Aviso>
              )}
              <Boton
                cargando={confirmando}
                onClick={() => confirmar({ latitud: posicion.latitud, longitud: posicion.longitud, origen: 'GPS_COORDINADOR', precisionMetros: posicion.precisionMetros })}
              >
                Confirmar esta ubicación
              </Boton>
            </div>
          )}
          <Boton variante={ubicacion.estado === 'listo' ? 'secundario' : 'primario'} onClick={() => void ubicacion.solicitar()} cargando={ubicacion.estado === 'obteniendo'}>
            {ubicacion.estado === 'inactivo' ? 'Obtener mi ubicación actual' : 'Volver a intentar'}
          </Boton>
        </div>
      )}

      {error && <Aviso tipo="error">{error}</Aviso>}
    </div>
  )
}
