package com.lftime.servidor.errores;

/**
 * Error esperado que un servicio lanza cuando no puede cumplir una operación (permiso, conflicto, dato ausente).
 * Lleva un {@link CodigoError} y un detalle legible para la persona.
 * No debe llevar datos personales en el detalle: el mensaje llega al cliente y puede quedar en registros.
 */
public class ErrorDeNegocio extends RuntimeException {

    private final CodigoError codigo;

    public ErrorDeNegocio(CodigoError codigo, String detalle) {
        super(detalle);
        this.codigo = codigo;
    }

    public CodigoError codigo() {
        return codigo;
    }
}
