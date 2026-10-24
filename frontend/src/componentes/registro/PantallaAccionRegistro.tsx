import '../../estilos/componentes/PantallaAccionRegistro.css'
import type { TipoMarcacion } from '../../contratos/marcacion'
import type { Hospital } from '../../modelos/hospital'
import { ACCION_MARCACION, TITULO_PANTALLA_MARCACION } from '../../modelos/etiquetasMarcacion'
import { Boton } from '../base/Boton'
import { Icono } from '../iconos/Icono'
import { CajaMovil } from '../movil/CajaMovil'
import { EncabezadoPantallaMovil } from '../movil/EncabezadoPantallaMovil'
import { TarjetaPersonaMovil } from './TarjetaPersonaMovil'

interface PropiedadesPantallaAccionRegistro {
  tipo: TipoMarcacion
  hospital: Hospital
  municipio: string
  registrando: boolean
  obteniendoUbicacion: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

/**
 * Pantalla que confirma un evento de la jornada antes de pedir la ubicación: la de «¿Salir a almorzar?» para
 * el almuerzo y la del hospital para los demás. La ubicación se captura al pulsar el botón; aquí no se afirma
 * que esté verificada (D13). No valida nada.
 */
export function PantallaAccionRegistro({ tipo, hospital, municipio, registrando, obteniendoUbicacion, onConfirmar, onCancelar }: PropiedadesPantallaAccionRegistro) {
  const textoBoton = registrando ? (obteniendoUbicacion ? 'Obteniendo tu ubicación…' : 'Registrando…') : ACCION_MARCACION[tipo]
  const esAlmuerzo = tipo === 'SALIDA_ALMUERZO'
  return (
    <section className="pantalla-accion-registro">
      <EncabezadoPantallaMovil titulo={TITULO_PANTALLA_MARCACION[tipo]} onAtras={onCancelar} />
      {esAlmuerzo ? (
        <div className="pantalla-accion-registro__centro">
          <span className="pantalla-accion-registro__disco pantalla-accion-registro__disco--azul">
            <Icono nombre="cubiertos" tamano={44} />
          </span>
          <h2>¿Salir a almorzar?</h2>
          <p>Al registrar la salida, se pausará tu tiempo de trabajo y comenzará el tiempo de almuerzo.</p>
        </div>
      ) : (
        <>
          <TarjetaPersonaMovil icono="hospitales" titulo={hospital.nombre} subtitulo={municipio} />
          <div className="pantalla-accion-registro__centro">
            <span className="pantalla-accion-registro__disco pantalla-accion-registro__disco--verde">
              <Icono nombre={tipo === 'SALIDA_FINAL' ? 'salida' : 'entrada'} tamano={44} />
            </span>
            <p>Presiona el botón para registrar. Se capturará la ubicación real de tu dispositivo.</p>
          </div>
        </>
      )}
      <Boton className={`pantalla-accion-registro__boton${esAlmuerzo ? '' : ' pantalla-accion-registro__boton--verde'}`} cargando={registrando} onClick={onConfirmar}>
        {textoBoton}
      </Boton>
      {esAlmuerzo && (
        <Boton variante="secundario" className="pantalla-accion-registro__boton" disabled={registrando} onClick={onCancelar}>
          Cancelar
        </Boton>
      )}
      <CajaMovil icono="info">Tu ubicación se captura al registrar y se compara con el radio del hospital (valor provisional). Ningún servidor la valida.</CajaMovil>
    </section>
  )
}
