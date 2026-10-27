package com.lftime.servidor.errores;

import org.springframework.http.HttpStatus;

/**
 * Códigos de error de la API, en mayúsculas y en español (contrato-api.md, «Errores»).
 * Cada código fija el estado HTTP y el título que ve quien consume la API.
 * No incluye el detalle del caso: ese lo pone quien lanza el error. Un rechazo de marcación no es un error HTTP.
 */
public enum CodigoError {

    NO_AUTENTICADO(HttpStatus.UNAUTHORIZED, "No autenticado"),
    SIN_PERMISO(HttpStatus.FORBIDDEN, "Sin permiso"),
    DISPOSITIVO_NO_REGISTRADO(HttpStatus.FORBIDDEN, "Dispositivo no registrado"),
    NO_ENCONTRADO(HttpStatus.NOT_FOUND, "No encontrado"),
    METODO_NO_PERMITIDO(HttpStatus.METHOD_NOT_ALLOWED, "Método no permitido"),
    VALIDACION(HttpStatus.BAD_REQUEST, "Datos no válidos"),
    CONFLICTO(HttpStatus.CONFLICT, "Conflicto"),
    INVITACION_VENCIDA(HttpStatus.GONE, "Invitación vencida o revocada"),
    DEMASIADAS_SOLICITUDES(HttpStatus.TOO_MANY_REQUESTS, "Demasiadas solicitudes"),
    ERROR_INTERNO(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno");

    private final HttpStatus estado;
    private final String titulo;

    CodigoError(HttpStatus estado, String titulo) {
        this.estado = estado;
        this.titulo = titulo;
    }

    public HttpStatus estado() {
        return estado;
    }

    public String titulo() {
        return titulo;
    }

    /** Código que corresponde a un estado HTTP, para los errores que lanza el propio Spring. */
    public static CodigoError dePara(int estadoHttp) {
        for (CodigoError codigo : values()) {
            if (codigo.estado.value() == estadoHttp) {
                return codigo;
            }
        }
        return estadoHttp >= 500 ? ERROR_INTERNO : VALIDACION;
    }
}
