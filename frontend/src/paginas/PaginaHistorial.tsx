import { useState } from 'react'
import '../estilos/paginas/PaginaHistorial.css'
import { Aviso } from '../componentes/base/Aviso'
import { Boton } from '../componentes/base/Boton'
import { EstadoCarga } from '../componentes/estados/EstadoCarga'
import { EstadoError } from '../componentes/estados/EstadoError'
import { EstadoVacio } from '../componentes/estados/EstadoVacio'
import { IntentosDelDia } from '../componentes/historial/IntentosDelDia'
import { ListaMarcacionesDelDia } from '../componentes/historial/ListaMarcacionesDelDia'
import { ResumenDeJornadaMovil } from '../componentes/historial/ResumenDeJornadaMovil'
import { SelectorDia } from '../componentes/historial/SelectorDia'
import { useHistorialPropio } from '../hooks/useHistorialPropio'
import { useSesion } from '../hooks/useSesion'
import { calcularDuraciones } from '../reglas/duraciones'
import { obtenerHorarioVigente } from '../reglas/horarioVigente'
import { hoyColombia } from '../utilidades/horaColombia'

/**
 * Historial de registros del trabajador (aplicación móvil): elige un día y ve sus registros con hora, hospital
 * y ubicación; aparte, los intentos rechazados de ese día (CA-5); y desde ahí abre el resumen de la jornada con
 * los tiempos por separado. Solo lee: lo registrado no se modifica (R-10). Las reglas de tiempo son
 * provisionales (P-03 y P-05).
 */
export function PaginaHistorial() {
  const { usuario } = useSesion()
  const trabajadorId = usuario?.trabajadorId ?? null
  const carga = useHistorialPropio(trabajadorId)
  const [fecha, setFecha] = useState(hoyColombia())
  const [verResumen, setVerResumen] = useState(false)

  if (!trabajadorId) {
    return <Aviso tipo="advertencia">Tu cuenta no está asociada a un trabajador, por eso no hay historial.</Aviso>
  }
  if (carga.cargando && !carga.datos) {
    return <EstadoCarga mensaje="Cargando tu historial…" />
  }
  if (carga.error || !carga.datos) {
    return <EstadoError mensaje={carga.error ?? 'No se pudo cargar tu historial.'} onReintentar={carga.recargar} />
  }
  const { hospitales, historial, horarios } = carga.datos
  const marcaciones = historial.marcaciones.filter((m) => m.fechaOperativa === fecha).sort((a, b) => Date.parse(a.instante) - Date.parse(b.instante))
  const intentos = historial.intentos.filter((i) => i.fechaOperativa === fecha)
  const nombreDeHospital = (hospitalId: string) => hospitales.find((h) => h.id === hospitalId)?.nombre ?? 'Hospital no encontrado'

  if (verResumen) {
    return <ResumenDeJornadaMovil fecha={fecha} duraciones={calcularDuraciones(marcaciones)} horario={obtenerHorarioVigente(horarios, trabajadorId, fecha)} onAtras={() => setVerResumen(false)} />
  }

  return (
    <section className="pagina-historial">
      <h1>Historial de registros</h1>
      <SelectorDia fecha={fecha} maxima={hoyColombia()} onCambiar={setFecha} />
      {marcaciones.length > 0 ? (
        <>
          <ListaMarcacionesDelDia marcaciones={marcaciones} nombreDeHospital={nombreDeHospital} />
          <Boton variante="secundario" onClick={() => setVerResumen(true)}>
            Ver resumen de la jornada
          </Boton>
        </>
      ) : (
        <EstadoVacio titulo="Sin registros este día" descripcion="No tienes marcaciones registradas en la fecha elegida." />
      )}
      {intentos.length > 0 && (
        <>
          <h2>Intentos rechazados</h2>
          <IntentosDelDia intentos={intentos} />
        </>
      )}
      <Aviso tipo="info">Las ubicaciones se capturan en tu dispositivo y no están validadas por el servidor: esta es una demostración.</Aviso>
    </section>
  )
}
