import '../estilos/paginas/PaginaRegistro.css'
import { Aviso } from '../componentes/base/Aviso'
import { Tarjeta } from '../componentes/base/Tarjeta'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { ResumenHorario } from '../componentes/jornadas/ResumenHorario'
import { AccionDeRegistro } from '../componentes/marcacion/AccionDeRegistro'
import { HistorialPropio } from '../componentes/marcacion/HistorialPropio'
import { MensajeResultadoRegistro } from '../componentes/marcacion/MensajeResultadoRegistro'
import { ResumenJornadaDelDia } from '../componentes/marcacion/ResumenJornadaDelDia'
import { useContador } from '../hooks/useContador'
import { useRegistroJornada } from '../hooks/useRegistroJornada'
import { useSesion } from '../hooks/useSesion'

/**
 * Pantalla de registro de la jornada del trabajador (HU-05), pensada para el móvil. Ofrece solo la acción
 * siguiente permitida, exige la ubicación real del dispositivo y explica cada rechazo. Si el hospital no
 * tiene coordenadas confirmadas no ofrece ningún botón (D25, CA-11). Es una demostración: la ubicación se
 * captura pero no la valida ningún servidor. No contiene reglas de negocio.
 */
export function PaginaRegistro() {
  const { usuario } = useSesion()
  const registro = useRegistroJornada(usuario?.trabajadorId ?? null)
  const contador = useContador(registro.derivados?.jornadaAbierta ? registro.derivados.instanteEntrada : null)

  if (!usuario?.trabajadorId) {
    return <Aviso tipo="advertencia">Tu cuenta no está asociada a un trabajador, por eso no hay jornada que registrar.</Aviso>
  }
  const { carga, derivados } = registro
  if (carga.cargando && !carga.datos) {
    return <EstadoCarga mensaje="Cargando tu jornada…" />
  }
  if (carga.error || !carga.datos || !derivados) {
    return <EstadoError mensaje={carga.error ?? 'No se pudo cargar tu jornada.'} onReintentar={carga.recargar} />
  }
  const { hospital, jornada, historial } = carga.datos
  if (!hospital) {
    return <Aviso tipo="advertencia">No se encontró el hospital al que estás asignado. Consulta a tu coordinación.</Aviso>
  }

  return (
    <section className="pagina-registro">
      <header>
        <h1>Registro de jornada</h1>
        <p>
          {hospital.nombre} · jornada del {jornada.fechaOperativa}
        </p>
      </header>
      <Aviso tipo="info" titulo="Demostración">
        La ubicación se captura en tu dispositivo, pero ningún servidor la valida y los registros solo se guardan en este navegador.
      </Aviso>
      {hospital.admiteMarcaciones ? (
        <Tarjeta titulo="Registrar">
          <AccionDeRegistro siguiente={derivados.siguiente} registrando={registro.registrando} obteniendoUbicacion={registro.obteniendoUbicacion} onMarcar={registro.marcar} />
          <MensajeResultadoRegistro
            resultado={registro.ultimo}
            error={registro.errorRegistro}
            limites={{ radioMetros: hospital.radioPermitidoMetros, precisionMetros: hospital.precisionMaximaMetros }}
          />
        </Tarjeta>
      ) : (
        <Aviso tipo="advertencia" titulo="Registro no disponible">
          Tu hospital necesita configuración antes de habilitar el registro: todavía no tiene coordenadas confirmadas, por eso no puedes marcar. Avisa a tu coordinación.
        </Aviso>
      )}
      {!jornada.horario && <Aviso tipo="info">No tienes un horario vigente para esta jornada. Consulta a tu coordinación.</Aviso>}
      <Tarjeta titulo="Tu jornada de hoy">
        <ResumenJornadaDelDia marcaciones={jornada.marcaciones} duraciones={derivados.duraciones} estado={derivados.estado} contadorSegundos={contador} />
      </Tarjeta>
      {jornada.horario && (
        <Tarjeta titulo="Horario planificado">
          <ResumenHorario horario={jornada.horario} />
        </Tarjeta>
      )}
      <Tarjeta titulo="Mi historial">
        <HistorialPropio historial={historial} />
      </Tarjeta>
    </section>
  )
}
