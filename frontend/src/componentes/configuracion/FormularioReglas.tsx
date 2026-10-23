import { useState, type FormEvent } from 'react'
import '../../estilos/componentes/FormularioReglas.css'
import { CAMPOS_REGLAS } from '../../configuracion/camposReglas'
import type { ReglasProvisionalesDto } from '../../contratos/configuracion'
import { validarReglasProvisionales, type ErroresReglas } from '../../validadores/reglasProvisionales'
import { Aviso } from '../base/Aviso'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'
import { Confirmacion } from '../estados/Confirmacion'

type Textos = Record<keyof ReglasProvisionalesDto, string>

const comoTextos = (reglas: ReglasProvisionalesDto): Textos => Object.fromEntries(Object.entries(reglas).map(([clave, valor]) => [clave, String(valor)])) as Textos

interface PropiedadesFormularioReglas {
  reglas: ReglasProvisionalesDto
  onGuardar: (reglas: ReglasProvisionalesDto) => Promise<void>
  /** Devuelve los valores por defecto ya guardados. */
  onRestablecer: () => Promise<ReglasProvisionalesDto>
}

/**
 * Formulario de las reglas provisionales (D37): cada valor lleva el rótulo «Provisional» y la decisión o
 * pendiente de donde sale. Valida y muestra todos los errores juntos, y avisa de que se guardan solo en este
 * navegador. No decide qué valor es correcto para el negocio ni quién puede editarlo.
 */
export function FormularioReglas({ reglas, onGuardar, onRestablecer }: PropiedadesFormularioReglas) {
  const [textos, setTextos] = useState<Textos>(comoTextos(reglas))
  const [errores, setErrores] = useState<ErroresReglas>({})
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [fallo, setFallo] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function ejecutar(accion: () => Promise<string>) {
    setOcupado(true)
    setMensaje(null)
    setFallo(null)
    try {
      setMensaje(await accion())
    } catch (error) {
      setFallo(error instanceof Error ? error.message : 'No se pudo completar la acción.')
    } finally {
      setOcupado(false)
    }
  }

  function guardar(evento: FormEvent) {
    evento.preventDefault()
    const resultado = validarReglasProvisionales(textos)
    setErrores(resultado.errores)
    if (resultado.valores) {
      const valores = resultado.valores
      void ejecutar(async () => {
        await onGuardar(valores)
        return 'Reglas guardadas en este navegador. Siguen siendo provisionales.'
      })
    }
  }

  function restablecer() {
    void ejecutar(async () => {
      setTextos(comoTextos(await onRestablecer()))
      setErrores({})
      return 'Se restablecieron los valores provisionales por defecto.'
    })
  }

  return (
    <form className="formulario-reglas" onSubmit={guardar} noValidate>
      <Aviso tipo="advertencia" titulo="Valores provisionales">
        Estos valores no son reglas laborales definitivas: son supuestos de demostración que deben validarse con el responsable de negocio antes de la Fase 2. Ninguno genera sanciones.
      </Aviso>
      <div className="formulario-reglas__campos">
        {CAMPOS_REGLAS.map((campo) => (
          <div key={campo.clave} className="formulario-reglas__campo">
            <Campo
              etiqueta={`${campo.etiqueta} (${campo.unidad})`}
              type="number"
              inputMode="numeric"
              value={textos[campo.clave]}
              ayuda={`${campo.ayuda} ${campo.referencia}.`}
              error={errores[campo.clave]}
              onChange={(e) => setTextos({ ...textos, [campo.clave]: e.target.value })}
            />
            <span className="formulario-reglas__rotulo">Provisional</span>
          </div>
        ))}
      </div>
      {mensaje && <Confirmacion mensaje={mensaje} onCerrar={() => setMensaje(null)} />}
      {fallo && <Aviso tipo="error">{fallo}</Aviso>}
      <div className="formulario-reglas__acciones">
        <Boton type="submit" cargando={ocupado}>
          Guardar reglas
        </Boton>
        <Boton variante="secundario" disabled={ocupado} onClick={restablecer}>
          Restablecer valores por defecto
        </Boton>
      </div>
    </form>
  )
}
