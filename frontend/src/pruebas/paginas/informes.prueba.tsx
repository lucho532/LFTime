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

  it('muestra los filtros y el informe de asistencia de la última semana, con sus filas', async () => {
    await abrir('/reportes', 'usr-coord-1')
    expect(await screen.findByRole('heading', { name: 'Informes' })).toBeInTheDocument()
    for (const etiqueta of ['Informe', 'Trabajador', 'Hospital', 'Municipio', 'Desde', 'Hasta']) {
      expect(screen.getByLabelText(etiqueta)).toBeInTheDocument()
    }
    expect(screen.getByLabelText('Desde')).toHaveValue('2026-10-17')
    expect(screen.getByLabelText('Hasta')).toHaveValue('2026-10-23')
    expect(await screen.findByRole('columnheader', { name: 'Salida almuerzo' })).toBeInTheDocument()
    expect(screen.getByText(/Periodo: 2026-10-17 a 2026-10-23/)).toBeInTheDocument()
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
    const desde = await screen.findByLabelText('Desde')
    await userEvent.clear(desde)
    await userEvent.type(desde, '2026-10-30')
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
  })

  it('el trabajador no abre los informes', async () => {
    await abrir('/reportes', 'usr-trab-001')
    expect(screen.queryByRole('heading', { name: 'Informes' })).not.toBeInTheDocument()
  })
})
