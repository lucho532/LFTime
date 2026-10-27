import '../../estilos/componentes/JornadaDelDiaTrabajador.css'
import type { MarcacionDto, TipoMarcacion } from '../../contratos/marcacion'
import type { JornadaDelDia } from '../../modelos/jornada'
import { calcularDuraciones, calcularTramos } from '../../reglas/duraciones'
import { formatearDuracion } from '../../utilidades/formatoDuracion'
import { aInstanteUtc, formatearHora12 } from '../../utilidades/horaColombia'
import { EnlaceUbicacion } from '../base/EnlaceUbicacion'
import { CronometroJornada } from './CronometroJornada'

interface PropiedadesJornadaDelDiaTrabajador {
  jornada: JornadaDelDia
  /** Instante actual, actualizado cada segundo por quien usa el componente. */
  ahora: Date
  /** Falso cuando el cronómetro ya se muestra en otro lugar de la pantalla (el inicio de la app móvil). */
  conCronometro?: boolean
}

const FILAS: Array<{ tipo: TipoMarcacion; nombre: string }> = [
  { tipo: 'ENTRADA', nombre: 'Entrada laboral' },
  { tipo: 'SALIDA_ALMUERZO', nombre: 'Salida a almuerzo' },
  { tipo: 'REGRESO_ALMUERZO', nombre: 'Entrada de almuerzo' },
  { tipo: 'SALIDA_FINAL', nombre: 'Salida de jornada' },
]

/** Compara el almuerzo tomado con el autorizado, siempre con texto: «5 min de más», «Dentro de lo autorizado» o «Incompleto». */
function textoDiferenciaAlmuerzo(tomado: number | null, autorizado: number | null): string {
  if (tomado === null) {
    return 'Incompleto'
  }
  if (autorizado === null) {
    return 'Sin horario'
  }
  return tomado > autorizado ? `${formatearDuracion(tomado - autorizado)} de más` : 'Dentro de lo autorizado'
}

/**
 * Jornada de hoy de un empleado para quien revisa su ficha: cronómetro en vivo, cada marcación con su hora
 * programada, la registrada y la ubicación como enlace (D38), y el resumen del día (efectivo, primer y segundo
 * tramo, almuerzo tomado frente al autorizado y total de la jornada, con «Incompleto» si falta una marca, D16). Lo programado sale del horario: la ventana del
 * almuerzo y su duración autorizada son provisionales (P-07). Solo muestra; no modifica lo registrado (R-10).
 */
export function JornadaDelDiaTrabajador({ jornada, ahora, conCronometro = true }: PropiedadesJornadaDelDiaTrabajador) {
  const { horario, fechaOperativa, marcaciones } = jornada
  const porTipo = (tipo: TipoMarcacion): MarcacionDto | undefined => marcaciones.find((m) => m.tipo === tipo)
  const hora12 = (hora: string) => formatearHora12(aInstanteUtc(fechaOperativa, hora))
  const programada: Record<TipoMarcacion, string> = horario
    ? {
        ENTRADA: hora12(horario.horaEntrada),
        SALIDA_ALMUERZO: `${hora12(horario.ventanaAlmuerzoDesde)} – ${hora12(horario.ventanaAlmuerzoHasta)}`,
        REGRESO_ALMUERZO: `${horario.duracionAlmuerzoMinutos} min autorizados`,
        SALIDA_FINAL: hora12(horario.horaSalida),
      }
    : { ENTRADA: 'Sin horario', SALIDA_ALMUERZO: 'Sin horario', REGRESO_ALMUERZO: 'Sin horario', SALIDA_FINAL: 'Sin horario' }
  const { efectivoMinutos, totalMinutos } = calcularDuraciones(marcaciones)
  const tramos = calcularTramos(marcaciones)
  const diferenciaAlmuerzo = textoDiferenciaAlmuerzo(tramos.almuerzoMinutos, horario?.duracionAlmuerzoMinutos ?? null)

  return (
    <div className="jornada-trabajador">
      {conCronometro && <CronometroJornada marcaciones={marcaciones} ahora={ahora} />}
      <h3>Registro de jornada laboral</h3>
      <div className="jornada-trabajador__desplazable">
        <table>
          <caption className="jornada-trabajador__oculto">Marcaciones de hoy con su hora programada y registrada</caption>
          <thead>
            <tr>
              <th scope="col">Marcación</th>
              <th scope="col">Hora programada</th>
              <th scope="col">Hora registrada</th>
              <th scope="col">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map(({ tipo, nombre }) => {
              const marcacion = porTipo(tipo)
              return (
                <tr key={tipo}>
                  <th scope="row">{nombre}</th>
                  <td>{programada[tipo]}</td>
                  <td>{marcacion ? formatearHora12(new Date(marcacion.instante)) : 'Sin registrar'}</td>
                  <td>{marcacion ? <EnlaceUbicacion ubicacion={marcacion.ubicacion} variante="compacta" /> : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <section className="jornada-trabajador__resumen" aria-labelledby="titulo-resumen-dia">
        <h3 id="titulo-resumen-dia">Resumen del día</h3>
        <div className="jornada-trabajador__principal">
          <span>Tiempo efectivo trabajado</span>
          <strong className="jornada-trabajador__efectivo">{formatearDuracion(efectivoMinutos)}</strong>
        </div>
        <dl>
          <dt>Primer tramo</dt>
          <dd>{formatearDuracion(tramos.primerTramoMinutos)}</dd>
          <dt>Segundo tramo</dt>
          <dd>{formatearDuracion(tramos.segundoTramoMinutos)}</dd>
          <dt>Total tiempo de almuerzo</dt>
          <dd>{formatearDuracion(tramos.almuerzoMinutos)}</dd>
          <dt>Almuerzo autorizado</dt>
          <dd>{horario ? formatearDuracion(horario.duracionAlmuerzoMinutos) : 'Sin horario'}</dd>
          <dt>Diferencia con lo autorizado</dt>
          <dd>{diferenciaAlmuerzo}</dd>
          <dt>Total de la jornada (entrada a salida)</dt>
          <dd>{formatearDuracion(totalMinutos)}</dd>
        </dl>
        <p className="jornada-trabajador__nota">Valores provisionales (P-03, P-05): se calculan solo con las marcas registradas y no son una sanción ni un descuento.</p>
      </section>
    </div>
  )
}
