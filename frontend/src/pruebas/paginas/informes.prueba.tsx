import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { TEXTO_DEMO } from '../../utilidades/exportacion/csv'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

async function abrir(ruta: string, usuarioId: string) {
  await servicios.sesion.iniciarSesion(usuarioId)
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

/** Las fechas están ocultas por defecto: se abren con «Filtrar por fechas» y se escribe el inicio del periodo. */
async function elegirDesde(desde: string) {
  await userEvent.click(screen.getByRole('button', { name: 'Filtrar por fechas' }))
  const campo = screen.getByLabelText('Desde')
  await userEvent.clear(campo)
  await userEvent.type(campo, desde)
}

function leerBlob(blob: Blob): Promise<string> {
  return new Promise((resolver) => {
    const lector = new FileReader()
    lector.onload = () => resolver(String(lector.result))
    lector.readAsText(blob)
  })
}

describe('pantalla de informes y exportación (HU-08, T-11.2, T-11.3)', () => {
  const descargas: Array<{ nombre: string; blob: Blob }> = []

  beforeEach(() => {
    descargas.length = 0
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:30:00Z'))
    repositorios.hospitales.listar() // inicializa la demostración
    let ultimoBlob: Blob | null = null
    vi.spyOn(URL, 'createObjectURL').mockImplementation((objeto) => {
      ultimoBlob = objeto as Blob
      return 'blob:informe-de-prueba'
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      if (ultimoBlob) descargas.push({ nombre: this.download, blob: ultimoBlob })
    })
  })
  afterEach(() => {
    vi.restoreAllMocks()
    establecerRelojParaPruebas()
  })

  it('muestra los filtros y el informe de asistencia de hoy, con las fechas ocultas hasta pulsar «Filtrar por fechas»', async () => {
    await abrir('/reportes', 'usr-coord-1')
    expect(await screen.findByRole('heading', { name: 'Informes' })).toBeInTheDocument()
    for (const etiqueta of ['Informe', 'Trabajador', 'Hospital', 'Municipio']) {
      expect(screen.getByLabelText(etiqueta)).toBeInTheDocument()
    }
    expect(screen.queryByLabelText('Desde')).not.toBeInTheDocument()
    expect(screen.getByText('Mostrando el 2026-10-23')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar por fechas' }))
    expect(screen.getByLabelText('Desde')).toHaveValue('2026-10-23')
    expect(screen.getByLabelText('Hasta')).toHaveValue('2026-10-23')
    expect(await screen.findByRole('columnheader', { name: 'Salida almuerzo' })).toBeInTheDocument()
    expect(screen.getByText(/Periodo: 2026-10-23 ·/)).toBeInTheDocument()
    expect(screen.getByText(/Los archivos son de demostración/)).toBeInTheDocument()
  })

  it('cambiar de informe cambia las columnas, que distinguen lo programado, lo efectivo y el almuerzo', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await userEvent.selectOptions(await screen.findByLabelText('Informe'), 'HORAS_POR_TRABAJADOR')
    for (const columna of ['Horas programadas', 'Tiempo efectivo', 'Tiempo de almuerzo', 'Tiempo total', 'Diferencia', 'Cómputo completo']) {
      expect(await screen.findByRole('columnheader', { name: columna })).toBeInTheDocument()
    }
  })

  it('un periodo inválido muestra el error y deshabilita la exportación', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await screen.findByRole('heading', { name: 'Informes' })
    await elegirDesde('2026-10-30')
    expect(await screen.findAllByText('La fecha inicial no puede ser posterior a la final.')).not.toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Exportar Excel' })).toBeDisabled()
  })

  it('el filtro por hospital reduce las filas', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await userEvent.selectOptions(await screen.findByLabelText('Informe'), 'CUMPLIMIENTO_POR_HOSPITAL')
    const antes = (await screen.findByText(/^\d+ filas? · Periodo/)).textContent
    await userEvent.selectOptions(screen.getByLabelText('Hospital'), 'hosp-01')
    await waitFor(() => expect(screen.getByText(/^1 fila · Periodo/)).toBeInTheDocument())
    expect(antes).not.toBe(screen.getByText(/^1 fila · Periodo/).textContent)
  })

  it('el CSV exportado lleva la marca DEMO en el nombre y la primera fila, y tiene tantas filas como el informe en pantalla', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await userEvent.selectOptions(await screen.findByLabelText('Informe'), 'CUMPLIMIENTO_POR_HOSPITAL')
    const resumen = (await screen.findByText(/^\d+ filas? · Periodo/)).textContent ?? ''
    const filasEnPantalla = Number(/^(\d+)/.exec(resumen)?.[1])

    await userEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    expect(await screen.findByText('Archivo generado: DEMO_cumplimiento_por_hospital_20261023.csv')).toBeInTheDocument()
    expect(descargas).toHaveLength(1)
    expect(descargas[0].nombre).toBe('DEMO_cumplimiento_por_hospital_20261023.csv')

    const lineas = (await leerBlob(descargas[0].blob)).replace('﻿', '').trim().split('\r\n')
    expect(lineas[0]).toBe(`"${TEXTO_DEMO}"`)
    expect(lineas[1]).toContain('Hospital,Municipio,Periodo,Jornadas programadas')
    expect(lineas).toHaveLength(2 + filasEnPantalla)
    const tabla = within(screen.getByRole('table', { name: 'Informe' }))
    expect(tabla.getAllByRole('row').length - 1).toBe(filasEnPantalla)
  })

  it('el Excel exportado se genera con el nombre DEMO y es un archivo xlsx', async () => {
    await abrir('/reportes', 'usr-admin-1')
    await userEvent.click(await screen.findByRole('button', { name: 'Exportar Excel' }))
    expect(await screen.findByText('Archivo generado: DEMO_asistencia_diaria_20261023.xlsx', {}, { timeout: 15000 })).toBeInTheDocument()
    expect(descargas[0].nombre).toBe('DEMO_asistencia_diaria_20261023.xlsx')
    expect(descargas[0].blob.type).toContain('spreadsheetml')
    expect(descargas[0].blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('el trabajador no abre los informes', async () => {
    await abrir('/reportes', 'usr-trab-001')
    expect(screen.queryByRole('heading', { name: 'Informes' })).not.toBeInTheDocument()
  })
})

describe('informes: nombres e incidencias como enlaces', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:30:00Z'))
    repositorios.hospitales.listar()
  })

  it('en la asistencia diaria el nombre abre la ficha y la incidencia del día abre la incidencia', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await screen.findByRole('columnheader', { name: 'Salida almuerzo' })
    await elegirDesde('2026-10-17')
    const nombre = (await screen.findAllByRole('link', { name: 'Alejandro Villegas Gutiérrez' }))[0]
    expect(nombre.getAttribute('href')).toMatch(/^\/personal\/trab-/)
    const incidencia = (await screen.findAllByRole('link', { name: 'Entrada tardía' }))[0]
    expect(incidencia.getAttribute('href')).toMatch(/^\/incidencias\//)
  })

  it('en el informe de incidencias el Id y el trabajador son enlaces', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await userEvent.selectOptions(await screen.findByLabelText('Informe'), 'INCIDENCIAS')
    await screen.findByRole('columnheader', { name: 'Id' })
    const tabla = screen.getByRole('table')
    expect(within(tabla).getAllByRole('link').some((enlace) => enlace.getAttribute('href')?.startsWith('/incidencias/'))).toBe(true)
    expect(within(tabla).getAllByRole('link').some((enlace) => enlace.getAttribute('href')?.startsWith('/personal/'))).toBe(true)
  })
})

describe('informes: de dónde viene la diferencia con lo programado', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:30:00Z'))
    repositorios.hospitales.listar()
  })

  it('pulsar una diferencia en rojo abre el desglose por entrada, almuerzo y salida, con enlaces a la ficha y la incidencia', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await screen.findByRole('columnheader', { name: 'Salida almuerzo' })
    await elegirDesde('2026-10-17')
    await userEvent.click((await screen.findAllByRole('button', { name: /Ver de dónde viene la diferencia −/ }))[0])
    const dialogo = await screen.findByRole('dialog', { name: 'De dónde viene la diferencia' })
    for (const momento of ['Entrada', 'Almuerzo', 'Salida', 'Diferencia total']) {
      expect(within(dialogo).getByRole('rowheader', { name: new RegExp(`^${momento}`) })).toBeInTheDocument()
    }
    expect(within(dialogo).getByRole('link', { name: 'Ver ficha y horarios' }).getAttribute('href')).toMatch(/^\/personal\/trab-/)
    expect(within(dialogo).getByText(/no es una sanción ni un descuento/)).toBeInTheDocument()
  })
})

describe('informes: tiempo por reponer y de dónde sale', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:30:00Z'))
    repositorios.hospitales.listar()
  })

  it('el informe lista a quien debe tiempo y su total abre el desglose día por día', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await userEvent.selectOptions(await screen.findByLabelText('Informe'), 'TIEMPO_DEBIDO')
    expect(await screen.findByRole('columnheader', { name: 'Aporte del almuerzo' })).toBeInTheDocument()
    expect(screen.getByText('Mostrando del 2026-10-01 al 2026-10-23')).toBeInTheDocument()
    await userEvent.click((await screen.findAllByRole('button', { name: /Ver de dónde sale el tiempo que debe/ }))[0])
    const dialogo = await screen.findByRole('dialog', { name: 'De dónde sale el tiempo por reponer' })
    expect(within(dialogo).getByRole('columnheader', { name: 'Total del día' })).toBeInTheDocument()
    expect(within(dialogo).getByRole('link', { name: 'Ver ficha y horarios' })).toBeInTheDocument()
    expect(within(dialogo).getAllByRole('row').length).toBeGreaterThan(2)
  })
})

describe('informes: fechas por defecto', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:30:00Z'))
    repositorios.hospitales.listar()
  })

  it('los informes mensuales usan el mes en curso (día 1 a hoy) y al volver a otro informe se vuelve a hoy', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await userEvent.selectOptions(await screen.findByLabelText('Informe'), 'ACUMULADO_MENSUAL')
    expect(screen.getByText('Mostrando del 2026-10-01 al 2026-10-23')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar por fechas' }))
    expect(screen.getByLabelText('Desde')).toHaveValue('2026-10-01')
    expect(screen.getByLabelText('Hasta')).toHaveValue('2026-10-23')
    await userEvent.selectOptions(screen.getByLabelText('Informe'), 'ASISTENCIA_DIARIA')
    expect(screen.getByText('Mostrando el 2026-10-23')).toBeInTheDocument()
  })

  it('unas fechas elegidas a mano se conservan al cambiar entre informes', async () => {
    await abrir('/reportes', 'usr-coord-1')
    await screen.findByLabelText('Informe')
    await elegirDesde('2026-10-17')
    await userEvent.selectOptions(screen.getByLabelText('Informe'), 'INCIDENCIAS')
    expect(screen.getByText('Mostrando del 2026-10-17 al 2026-10-23')).toBeInTheDocument()
  })
})
