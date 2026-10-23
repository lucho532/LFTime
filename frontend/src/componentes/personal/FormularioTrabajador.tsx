import { useState, type FormEvent } from 'react'
import '../../estilos/componentes/FormularioTrabajador.css'
import { ESTADOS_TRABAJADOR, TEXTO_ESTADO_TRABAJADOR } from '../../modelos/estadoTrabajador'
import type { Hospital } from '../../modelos/hospital'
import type { DatosTrabajador } from '../../modelos/trabajador'
import { TIPOS_DOCUMENTO, validarDatosTrabajador, type ErroresTrabajador } from '../../validadores/trabajador'
import { Aviso } from '../base/Aviso'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'
import { Selector } from '../base/Selector'

interface PropiedadesFormularioTrabajador {
  inicial?: DatosTrabajador
  hospitales: Hospital[]
  /** Guarda los datos. Si lanza un error, el mensaje se muestra en el formulario. */
  onGuardar: (datos: DatosTrabajador) => Promise<void>
  onCancelar: () => void
}

const VACIO: DatosTrabajador = { nombres: '', apellidos: '', tipoDocumento: 'CC', numeroDocumento: '', cargo: '', telefono: '', hospitalId: '', estado: 'ACTIVO' }

/**
 * Formulario de alta y edición de un trabajador (HU-02): solo los datos personales estrictamente
 * necesarios. Valida en la interfaz y muestra todos los errores juntos. La foto no se edita aquí: la
 * pone cada persona. La lista de tipos de documento es provisional (P-13). No decide quién puede guardar.
 */
export function FormularioTrabajador({ inicial = VACIO, hospitales, onGuardar, onCancelar }: PropiedadesFormularioTrabajador) {
  const [datos, setDatos] = useState<DatosTrabajador>(inicial)
  const [errores, setErrores] = useState<ErroresTrabajador>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const cambiar = (campo: keyof DatosTrabajador) => (e: { target: { value: string } }) => setDatos({ ...datos, [campo]: e.target.value })

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const encontrados = validarDatosTrabajador(datos)
    setErrores(encontrados)
    setErrorGeneral(null)
    if (Object.keys(encontrados).length > 0) {
      return
    }
    setGuardando(true)
    try {
      await onGuardar(datos)
    } catch (fallo) {
      setErrorGeneral(fallo instanceof Error ? fallo.message : 'No se pudo guardar el trabajador.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="formulario-trabajador" onSubmit={enviar} noValidate>
      <div className="formulario-trabajador__fila">
        <Campo etiqueta="Nombres" required value={datos.nombres} error={errores.nombres} onChange={cambiar('nombres')} />
        <Campo etiqueta="Apellidos" required value={datos.apellidos} error={errores.apellidos} onChange={cambiar('apellidos')} />
      </div>
      <div className="formulario-trabajador__fila">
        <Selector
          etiqueta="Tipo de documento"
          required
          value={datos.tipoDocumento}
          error={errores.tipoDocumento}
          ayuda="Lista provisional de tipos de documento."
          opciones={TIPOS_DOCUMENTO.map((tipo) => ({ valor: tipo.valor, etiqueta: `${tipo.valor} · ${tipo.etiqueta}` }))}
          onChange={cambiar('tipoDocumento')}
        />
        <Campo etiqueta="Número de documento" required value={datos.numeroDocumento} error={errores.numeroDocumento} onChange={cambiar('numeroDocumento')} />
      </div>
      <Campo etiqueta="Cargo o servicio" required value={datos.cargo} error={errores.cargo} onChange={cambiar('cargo')} />
      <Campo etiqueta="Teléfono (opcional)" type="tel" value={datos.telefono} ayuda="Solo si es necesario para contactar a la persona." error={errores.telefono} onChange={cambiar('telefono')} />
      <div className="formulario-trabajador__fila">
        <Selector
          etiqueta="Hospital asignado"
          required
          textoVacio="Elige un hospital"
          value={datos.hospitalId}
          error={errores.hospitalId}
          opciones={hospitales.map((h) => ({ valor: h.id, etiqueta: h.nombre }))}
          onChange={cambiar('hospitalId')}
        />
        <Selector
          etiqueta="Estado"
          value={datos.estado}
          ayuda="Un estado distinto de «Activo» suprime la detección de incidencias."
          opciones={ESTADOS_TRABAJADOR.map((estado) => ({ valor: estado, etiqueta: TEXTO_ESTADO_TRABAJADOR[estado] }))}
          onChange={cambiar('estado')}
        />
      </div>
      {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
      <div className="formulario-trabajador__acciones">
        <Boton variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={guardando}>
          Guardar trabajador
        </Boton>
      </div>
    </form>
  )
}
