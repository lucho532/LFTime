import { useState } from 'react'
import '../../estilos/componentes/PanelHorarioTrabajador.css'
import type { AsignacionHorarioDto } from '../../contratos/horario'
import type { DatosHorario } from '../../modelos/horario'
import { obtenerHorarioVigente } from '../../reglas/horarioVigente'
import { hoyColombia } from '../../utilidades/horaColombia'
import { Boton } from '../base/Boton'
import { ListaHistorial } from '../base/ListaHistorial'
import { EstadoVacio } from '../estados/EstadoVacio'
import { FormularioHorario } from './FormularioHorario'
import { ResumenHorario } from './ResumenHorario'

interface PropiedadesPanelHorarioTrabajador {
  trabajadorId: string
  /** Todos los horarios del trabajador (la más reciente primero o en cualquier orden). */
  horarios: AsignacionHorarioDto[]
  /** Si es falso, solo se consulta (no aparece el botón de cambio). */
  puedeEditar: boolean
  nombreDe: (usuarioId: string) => string
  /** Asigna un horario nuevo. Si lanza un error, el mensaje se muestra en el formulario. */
  onAsignar: (datos: DatosHorario) => Promise<void>
}

/**
 * Horario de un trabajador: el vigente hoy, los programados a futuro y el historial completo de
 * asignaciones (D15, P-07). Quien puede (el coordinador) asigna uno nuevo con su fecha de inicio; nada
 * anterior se borra. Distingue lo **planificado** de lo registrado. No calcula jornadas.
 */
export function PanelHorarioTrabajador({ trabajadorId, horarios, puedeEditar, nombreDe, onAsignar }: PropiedadesPanelHorarioTrabajador) {
  const [editando, setEditando] = useState(false)
  const hoy = hoyColombia()
  const vigente = obtenerHorarioVigente(horarios, trabajadorId, hoy)
  const programados = horarios.filter((h) => h.vigenteDesde > hoy)
  const historial = [...horarios].sort((a, b) => b.vigenteDesde.localeCompare(a.vigenteDesde))

  async function guardar(datos: DatosHorario) {
    await onAsignar(datos)
    setEditando(false)
  }

  return (
    <div className="panel-horario">
      <h3 className="panel-horario__subtitulo">Horario vigente (planificado)</h3>
      {vigente ? <ResumenHorario horario={vigente} /> : <EstadoVacio titulo="Sin horario vigente" descripcion="Este trabajador no tiene un horario asignado para hoy." />}
      {programados.length > 0 && <p className="panel-horario__aviso">Tiene {programados.length === 1 ? 'un horario programado' : `${programados.length} horarios programados`} a futuro; ver el historial.</p>}
      {puedeEditar && !editando && (
        <Boton variante="secundario" onClick={() => setEditando(true)}>
          Cambiar horario
        </Boton>
      )}
      {editando && <FormularioHorario base={vigente} vigenciasExistentes={horarios.map((h) => h.vigenteDesde)} onGuardar={guardar} onCancelar={() => setEditando(false)} />}
      <h3 className="panel-horario__subtitulo">Historial de horarios</h3>
      <ListaHistorial
        textoVacio="Todavía no hay horarios asignados."
        elementos={historial.map((horario) => ({
          id: horario.id,
          contenido: (
            <>
              <strong>
                Desde {horario.vigenteDesde}
                {horario.vigenteDesde > hoy && ' (programado)'}
                {horario.id === vigente?.id && ' (vigente)'}
              </strong>
              <span>
                {horario.horaEntrada} – {horario.horaSalida} · almuerzo {horario.ventanaAlmuerzoDesde} – {horario.ventanaAlmuerzoHasta} ({horario.duracionAlmuerzoMinutos} min)
              </span>
              <span>Asignó: {nombreDe(horario.asignadoPorUsuarioId)}</span>
            </>
          ),
        }))}
      />
    </div>
  )
}
