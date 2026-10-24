import '../../estilos/componentes/CronometroJornada.css'
import type { MarcacionDto } from '../../contratos/marcacion'
import { calcularEfectivoHastaAhoraSegundos, instantesDeJornada } from '../../reglas/duraciones'
import { formatearContador } from '../../utilidades/formatoDuracion'

interface PropiedadesCronometroJornada {
  marcaciones: MarcacionDto[]
  /** Instante actual, que se actualiza cada segundo fuera de este componente. */
  ahora: Date
}

type Fase = 'sin-entrada' | 'en-vivo' | 'almuerzo' | 'terminada'

const ROTULO: Record<Fase, string> = {
  'sin-entrada': 'Sin entrada hoy',
  'en-vivo': 'En vivo',
  almuerzo: 'En almuerzo · en pausa',
  terminada: 'Jornada terminada',
}

/**
 * Cronómetro en vivo de lo que lleva trabajado hoy un empleado: corre mientras está en jornada, se pausa en el
 * almuerzo y se detiene con la salida final. El estado se dice con texto además del punto de color (R-7). Es una
 * referencia visual (los tiempos oficiales salen de las marcas y se truncan al minuto, D16) y provisional
 * (P-03, P-05). No decide nada.
 */
export function CronometroJornada({ marcaciones, ahora }: PropiedadesCronometroJornada) {
  const segundos = calcularEfectivoHastaAhoraSegundos(marcaciones, ahora)
  const { salidaAlmuerzo, regresoAlmuerzo, salidaFinal } = instantesDeJornada(marcaciones)
  const fase: Fase = segundos === null ? 'sin-entrada' : salidaFinal ? 'terminada' : salidaAlmuerzo && !regresoAlmuerzo ? 'almuerzo' : 'en-vivo'
  return (
    <div className={`cronometro-jornada cronometro-jornada--${fase}`} role="timer" aria-label="Tiempo trabajado hoy">
      <span className="cronometro-jornada__estado">
        <span className="cronometro-jornada__punto" aria-hidden="true" />
        {ROTULO[fase]}
      </span>
      <strong className="cronometro-jornada__tiempo">{segundos === null ? '--:--:--' : formatearContador(segundos)}</strong>
      <small>Tiempo trabajado hoy. Referencia: no es el tiempo oficial.</small>
    </div>
  )
}
