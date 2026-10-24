import { useState } from 'react'
import '../estilos/paginas/PaginaRegistro.css'
import type { TipoMarcacion } from '../contratos/marcacion'
import { Aviso } from '../componentes/base/Aviso'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { CajaMovil } from '../componentes/movil/CajaMovil'
import { DetalleJornadaActiva } from '../componentes/registro/DetalleJornadaActiva'
import { PanelDeJornadaMovil } from '../componentes/registro/PanelDeJornadaMovil'
import { PantallaAccionRegistro } from '../componentes/registro/PantallaAccionRegistro'
import { PantallaGpsRequerido } from '../componentes/registro/PantallaGpsRequerido'
import { TarjetaPersonaMovil } from '../componentes/registro/TarjetaPersonaMovil'
import { MensajeResultadoRegistro } from '../componentes/marcacion/MensajeResultadoRegistro'
import { useHoraColombia } from '../hooks/useHoraColombia'
import { useRegistroJornada } from '../hooks/useRegistroJornada'
import { useSesion } from '../hooks/useSesion'
import { calcularEfectivoHastaAhora, instantesDeJornada } from '../reglas/duraciones'
import { rutaDeFichaDe } from '../reglas/permisosPersonal'
import { minutosEntre } from '../utilidades/horas'

type Vista = 'inicio' | 'accion' | 'gps' | 'detalle'

/**
 * Inicio de la aplicación móvil del trabajador (HU-05): su jornada de hoy y el flujo de registro en pantallas
 * (principal, confirmar el evento, «se requiere tu ubicación» y detalle de la jornada). Ofrece solo la acción
 * siguiente permitida, exige la ubicación real del dispositivo y explica cada rechazo. Si el hospital no tiene
 * coordenadas confirmadas no ofrece ningún botón (D25, CA-11). Es una demostración: la ubicación se captura pero
 * no la valida ningún servidor. No muestra la foto de perfil (D41) ni contiene reglas de negocio.
 */
export function PaginaRegistro() {
  const { usuario } = useSesion()
  const registro = useRegistroJornada(usuario?.trabajadorId ?? null)
  const ahora = useHoraColombia()
  const [vista, setVista] = useState<Vista>('inicio')

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
  const { hospital, municipio, jornada, trabajador } = carga.datos
  if (!hospital) {
    return <Aviso tipo="advertencia">No se encontró el hospital al que estás asignado. Consulta a tu coordinación.</Aviso>
  }
  const { siguiente } = derivados
  const limites = { radioMetros: hospital.radioPermitidoMetros, precisionMetros: hospital.precisionMaximaMetros }

  function volverAlInicio() {
    registro.limpiarResultado()
    setVista('inicio')
  }

  async function registrar(tipo: TipoMarcacion) {
    const resultado = await registro.marcar(tipo)
    setVista(resultado?.resultado === 'RECHAZADA' && resultado.intento.esFalloTecnico ? 'gps' : 'inicio')
  }

  if (vista === 'accion' && siguiente) {
    return (
      <PantallaAccionRegistro
        tipo={siguiente}
        hospital={hospital}
        municipio={municipio?.nombre ?? ''}
        registrando={registro.registrando}
        obteniendoUbicacion={registro.obteniendoUbicacion}
        onConfirmar={() => void registrar(siguiente)}
        onCancelar={volverAlInicio}
      />
    )
  }
  if (vista === 'gps' && siguiente) {
    return (
      <PantallaGpsRequerido
        explicacion={<MensajeResultadoRegistro resultado={registro.ultimo} error={registro.errorRegistro} limites={limites} />}
        reintentando={registro.registrando}
        onActivar={() => void registrar(siguiente)}
        onCancelar={volverAlInicio}
      />
    )
  }
  if (vista === 'detalle') {
    return (
      <DetalleJornadaActiva
        instantes={instantesDeJornada(jornada.marcaciones)}
        efectivoMinutos={calcularEfectivoHastaAhora(jornada.marcaciones, ahora)}
        programadosMinutos={jornada.horario ? minutosEntre(jornada.horario.horaEntrada, jornada.horario.horaSalida) : null}
        siguiente={siguiente}
        puedeRegistrar={hospital.admiteMarcaciones}
        onRegistrar={() => setVista('accion')}
        onAtras={volverAlInicio}
      />
    )
  }

  return (
    <section className="pagina-registro">
      <h1 className="pagina-registro__titulo">Registro de jornada</h1>
      <TarjetaPersonaMovil icono="usuario" titulo={usuario.nombreCompleto} subtitulo={trabajador?.cargo ?? ''} a={rutaDeFichaDe(usuario)} etiquetaEnlace={`Abrir mi ficha: ${usuario.nombreCompleto}`} />
      <TarjetaPersonaMovil icono="hospitales" titulo={hospital.nombre} subtitulo={municipio ? `${municipio.nombre}, ${municipio.departamento}` : ''} />
      <PanelDeJornadaMovil
        ahora={ahora}
        estado={derivados.estado}
        siguiente={siguiente}
        puedeRegistrar={hospital.admiteMarcaciones}
        hayRegistros={jornada.marcaciones.length > 0}
        onRegistrar={() => {
          registro.limpiarResultado()
          setVista('accion')
        }}
        onVerDetalle={() => setVista('detalle')}
      />
      <MensajeResultadoRegistro resultado={registro.ultimo} error={registro.errorRegistro} limites={limites} />
      {!hospital.admiteMarcaciones && (
        <Aviso tipo="advertencia" titulo="Registro no disponible">
          Tu hospital necesita configuración antes de habilitar el registro: todavía no tiene coordenadas confirmadas, por eso no puedes marcar. Avisa a tu coordinación.
        </Aviso>
      )}
      {!jornada.horario && <Aviso tipo="info">No tienes un horario vigente para esta jornada. Consulta a tu coordinación.</Aviso>}
      <CajaMovil icono="info">
        <strong>Recuerda:</strong> cada registro requiere tu ubicación GPS.
      </CajaMovil>
      <Aviso tipo="info" titulo="Demostración">
        La ubicación se captura en tu dispositivo, pero ningún servidor la valida y los registros solo se guardan en este navegador.
      </Aviso>
    </section>
  )
}
