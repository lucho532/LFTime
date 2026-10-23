import { useState, type FormEvent } from 'react'
import '../../estilos/componentes/FormularioHorario.css'
import type { AsignacionHorarioDto } from '../../contratos/horario'
import type { DatosHorario } from '../../modelos/horario'
import { hoyColombia } from '../../utilidades/horaColombia'
import { NOMBRES_DIAS } from '../../utilidades/diasSemana'
import { validarDatosHorario, type ErroresHorario } from '../../validadores/horario'
import { Aviso } from '../base/Aviso'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'

interface PropiedadesFormularioHorario {
  /** Horario vigente, del que se parte para no escribir todo de nuevo. */
  base?: AsignacionHorarioDto | null
  /** Fechas de inicio de los horarios ya existentes del trabajador (no se pueden repetir). */
  vigenciasExistentes: string[]
  /** Asigna el horario. Si lanza un error, el mensaje se muestra en el formulario. */
  onGuardar: (datos: DatosHorario) => Promise<void>
  onCancelar: () => void
}

/** Duración del almuerzo que se propone por defecto (D4); es configurable por el coordinador. */
const ALMUERZO_POR_DEFECTO_MINUTOS = 60

/**
 * Formulario con el que el coordinador asigna un horario nuevo (D15): fecha desde la que rige, días,
 * entrada, salida, intervalo de almuerzo y su duración. Valida en la interfaz y muestra todos los errores
 * juntos. Un horario nuevo se añade; los anteriores se conservan. Los límites son supuestos provisionales
 * (P-07). No decide quién puede asignar.
 */
export function FormularioHorario({ base, vigenciasExistentes, onGuardar, onCancelar }: PropiedadesFormularioHorario) {
  const [datos, setDatos] = useState<DatosHorario>({
    vigenteDesde: hoyColombia(),
    diasLaborables: base?.diasLaborables ?? [1, 2, 3, 4, 5, 6, 7],
    horaEntrada: base?.horaEntrada ?? '07:00',
    horaSalida: base?.horaSalida ?? '16:00',
    ventanaAlmuerzoDesde: base?.ventanaAlmuerzoDesde ?? '12:00',
    ventanaAlmuerzoHasta: base?.ventanaAlmuerzoHasta ?? '14:00',
    duracionAlmuerzoMinutos: base?.duracionAlmuerzoMinutos ?? ALMUERZO_POR_DEFECTO_MINUTOS,
  })
  const [errores, setErrores] = useState<ErroresHorario>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const texto = (campo: keyof DatosHorario) => (e: { target: { value: string } }) => setDatos({ ...datos, [campo]: e.target.value })

  function alternarDia(dia: number) {
    const dias = datos.diasLaborables.includes(dia) ? datos.diasLaborables.filter((d) => d !== dia) : [...datos.diasLaborables, dia]
    setDatos({ ...datos, diasLaborables: dias })
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const encontrados = validarDatosHorario(datos, { hoy: hoyColombia(), vigenciasExistentes })
    setErrores(encontrados)
    setErrorGeneral(null)
    if (Object.keys(encontrados).length > 0) {
      return
    }
    setGuardando(true)
    try {
      await onGuardar(datos)
    } catch (fallo) {
      setErrorGeneral(fallo instanceof Error ? fallo.message : 'No se pudo asignar el horario.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="formulario-horario" onSubmit={enviar} noValidate>
      <Campo etiqueta="Rige desde" type="date" required value={datos.vigenteDesde} ayuda="Hoy o una fecha futura. Los horarios anteriores se conservan." error={errores.vigenteDesde} onChange={texto('vigenteDesde')} />
      <fieldset className="formulario-horario__dias">
        <legend>Días laborables</legend>
        {NOMBRES_DIAS.map((nombre, indice) => (
          <label key={nombre}>
            <input type="checkbox" checked={datos.diasLaborables.includes(indice + 1)} onChange={() => alternarDia(indice + 1)} /> {nombre}
          </label>
        ))}
        {errores.diasLaborables && (
          <p role="alert" className="formulario-horario__error">
            {errores.diasLaborables}
          </p>
        )}
      </fieldset>
      <div className="formulario-horario__fila">
        <Campo etiqueta="Hora de entrada" type="time" required value={datos.horaEntrada} error={errores.horaEntrada} onChange={texto('horaEntrada')} />
        <Campo etiqueta="Hora de salida" type="time" required value={datos.horaSalida} ayuda="Si es menor que la entrada, el turno cruza la medianoche." error={errores.horaSalida} onChange={texto('horaSalida')} />
      </div>
      <div className="formulario-horario__fila">
        <Campo etiqueta="Almuerzo desde" type="time" required value={datos.ventanaAlmuerzoDesde} error={errores.ventanaAlmuerzoDesde} onChange={texto('ventanaAlmuerzoDesde')} />
        <Campo etiqueta="Almuerzo hasta" type="time" required value={datos.ventanaAlmuerzoHasta} error={errores.ventanaAlmuerzoHasta} onChange={texto('ventanaAlmuerzoHasta')} />
      </div>
      <Campo
        etiqueta="Duración autorizada del almuerzo (minutos)"
        type="number"
        required
        min={1}
        value={String(datos.duracionAlmuerzoMinutos)}
        error={errores.duracionAlmuerzoMinutos}
        onChange={(e) => setDatos({ ...datos, duracionAlmuerzoMinutos: e.target.value === '' ? Number.NaN : Number(e.target.value) })}
      />
      {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
      <div className="formulario-horario__acciones">
        <Boton variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={guardando}>
          Asignar horario
        </Boton>
      </div>
    </form>
  )
}
