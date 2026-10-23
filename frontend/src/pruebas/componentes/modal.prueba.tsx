import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from '../../componentes/base/Modal'

function ConAbridor({ onCerrar = () => undefined }: { onCerrar?: () => void }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setAbierto(true)}>
        Abrir
      </button>
      <Modal
        abierto={abierto}
        titulo="Confirmar cambio"
        onCerrar={() => {
          onCerrar()
          setAbierto(false)
        }}
        acciones={
          <>
            <button type="button">Cancelar</button>
            <button type="button">Aceptar</button>
          </>
        }
      >
        <p>¿Quieres guardar los cambios?</p>
        <input aria-label="Motivo" />
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('cerrado no dibuja nada', () => {
    render(<Modal abierto={false} titulo="Título" onCerrar={() => undefined}>Contenido</Modal>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abierto es un diálogo modal con nombre accesible', () => {
    render(<Modal abierto titulo="Confirmar cambio" onCerrar={() => undefined}>Contenido</Modal>)
    const dialogo = screen.getByRole('dialog', { name: 'Confirmar cambio' })
    expect(dialogo).toHaveAttribute('aria-modal', 'true')
  })

  it('mueve el foco al diálogo al abrirse y lo devuelve a quien lo abrió al cerrarse', async () => {
    render(<ConAbridor />)
    const abridor = screen.getByRole('button', { name: 'Abrir' })
    await userEvent.click(abridor)
    expect(screen.getByRole('dialog')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(abridor).toHaveFocus()
  })

  it('se cierra con Escape y al pulsar fuera, pero no al pulsar dentro', async () => {
    const cerrar = vi.fn()
    render(<ConAbridor onCerrar={cerrar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    await userEvent.click(screen.getByText('¿Quieres guardar los cambios?'))
    expect(cerrar).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('dialog').parentElement!)
    expect(cerrar).toHaveBeenCalledTimes(1)
  })

  it('mantiene el foco dentro con Tab y Mayús+Tab', async () => {
    render(<ConAbridor />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    await userEvent.tab()
    expect(screen.getByLabelText('Motivo')).toHaveFocus()
    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Aceptar' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByLabelText('Motivo')).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Aceptar' })).toHaveFocus()
  })
})
