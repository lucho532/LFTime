import '../../estilos/componentes/AccionesDeIncidencia.css'
import type { AccionesIncidencia } from '../../hooks/useDetalleIncidencia'
import { TEXTO_ESTADO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import type { AccionesPermitidas, ResolucionIncidencia } from '../../reglas/permisosIncidencia'
import { Boton } from '../base/Boton'
import type { OpcionSelector } from '../base/Selector'
import { FormularioAccion } from './FormularioAccion'

interface PropiedadesAccionesDeIncidencia {
  permisos: AccionesPermitidas
  acciones: AccionesIncidencia
  /** Verdadero si quien actúa justifica en nombre del trabajador (P-16): entonces debe indicar el motivo. */
  enNombreDelTrabajador: boolean
  coordinadores: OpcionSelector[]
}

const RESOLUCIONES: ResolucionIncidencia[] = ['JUSTIFICADA', 'NO_JUSTIFICADA', 'PENDIENTE_INFORMACION']

/**
 * Acciones que la persona puede ejecutar sobre la incidencia, según los permisos que recibe (justificar,
 * iniciar revisión, resolver, reabrir, escalar, asignar revisor). Cada acción exige su motivo cuando
 * corresponde. Ninguna es una sanción ni cambia los intentos originales. No calcula permisos.
 */
export function AccionesDeIncidencia({ permisos, acciones, enNombreDelTrabajador, coordinadores }: PropiedadesAccionesDeIncidencia) {
  const hayAcciones = permisos.iniciarRevision || permisos.justificar || permisos.resolver || permisos.reabrir || permisos.escalar || permisos.asignarRevisor
  if (!hayAcciones) {
    return <p className="acciones-incidencia__vacio">No tienes acciones disponibles sobre esta incidencia.</p>
  }
  return (
    <div className="acciones-incidencia">
      {permisos.iniciarRevision && <Boton onClick={acciones.iniciarRevision}>Iniciar revisión</Boton>}
      {permisos.justificar && (
        <FormularioAccion
          titulo={enNombreDelTrabajador ? 'Justificar en nombre del trabajador' : 'Aportar justificación'}
          etiquetaTexto={enNombreDelTrabajador ? 'Justificación del trabajador' : 'Tu justificación'}
          etiquetaMotivo={enNombreDelTrabajador ? 'Motivo por el que la registras en su nombre' : undefined}
          textoBoton="Guardar justificación"
          onEnviar={({ texto, motivo }) => acciones.justificar(texto, enNombreDelTrabajador ? motivo : undefined)}
        />
      )}
      {permisos.resolver && (
        <FormularioAccion
          titulo="Resolver la incidencia"
          etiquetaOpcion="Resolución"
          opciones={RESOLUCIONES.map((valor) => ({ valor, etiqueta: TEXTO_ESTADO_INCIDENCIA[valor] }))}
          etiquetaTexto="Motivo de la resolución"
          textoBoton="Registrar resolución"
          onEnviar={({ opcion, texto }) => acciones.resolver(opcion as ResolucionIncidencia, texto)}
        />
      )}
      {permisos.reabrir && (
        <FormularioAccion titulo="Reabrir la incidencia" etiquetaTexto="Motivo para reabrir" textoBoton="Reabrir" onEnviar={({ texto }) => acciones.reabrir(texto)} />
      )}
      {permisos.escalar && (
        <FormularioAccion titulo="Escalar al administrador" etiquetaTexto="Motivo de la escalada" textoBoton="Escalar" onEnviar={({ texto }) => acciones.escalar(texto)} />
      )}
      {permisos.asignarRevisor && (
        <FormularioAccion
          titulo="Asignar revisor"
          etiquetaOpcion="Coordinador"
          opciones={coordinadores}
          etiquetaTexto="Motivo (opcional)"
          textoObligatorio={false}
          textoBoton="Asignar"
          onEnviar={({ opcion, texto }) => acciones.asignarRevisor(opcion, texto)}
        />
      )}
    </div>
  )
}
