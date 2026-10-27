package com.lftime.servidor.controladores;

import com.lftime.servidor.errores.CodigoError;
import com.lftime.servidor.errores.ErrorDeNegocio;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Traduce todo error a {@code application/problem+json} (RFC 9457) con un {@code codigo} en español.
 * Su responsabilidad es dar una respuesta uniforme. No decide permisos ni reglas.
 * Nunca devuelve ni registra el mensaje de un error inesperado: puede traer datos personales.
 */
@RestControllerAdvice
public class ManejadorErrores extends ResponseEntityExceptionHandler {

    private static final Logger REGISTRO = LoggerFactory.getLogger(ManejadorErrores.class);

    @ExceptionHandler(ErrorDeNegocio.class)
    ResponseEntity<Object> alFallarUnaOperacion(ErrorDeNegocio error) {
        return respuesta(error.codigo(), error.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Object> alNegarElPermiso(AccessDeniedException error) {
        return respuesta(CodigoError.SIN_PERMISO, "No tienes permiso para realizar esta operación.");
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> alFallarSinPrevision(Exception error) {
        REGISTRO.error("Error inesperado de tipo {}", error.getClass().getName(), error);
        return respuesta(CodigoError.ERROR_INTERNO, "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.");
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException error,
            HttpHeaders cabeceras, HttpStatusCode estado, WebRequest peticion) {
        List<Map<String, String>> errores = error.getBindingResult().getFieldErrors().stream()
                .map(campo -> Map.of("campo", campo.getField(), "mensaje", String.valueOf(campo.getDefaultMessage())))
                .toList();
        var problema = problema(CodigoError.VALIDACION, "Hay datos que no son válidos.");
        problema.setProperty("errores", errores);
        return ResponseEntity.status(CodigoError.VALIDACION.estado()).body(problema);
    }

    /** Todo error que genera Spring por su cuenta (método no permitido, cuerpo ilegible…) recibe también su {@code codigo}. */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception error, Object cuerpo, HttpHeaders cabeceras,
            HttpStatusCode estado, WebRequest peticion) {
        var respuesta = super.handleExceptionInternal(error, cuerpo, cabeceras, estado, peticion);
        if (respuesta != null && respuesta.getBody() instanceof ProblemDetail problema) {
            var codigo = codigoDeSpring(estado.value());
            problema.setTitle(codigo.titulo());
            problema.setProperty("codigo", codigo.name());
        }
        return respuesta;
    }

    private static CodigoError codigoDeSpring(int estadoHttp) {
        return estadoHttp == 405 ? CodigoError.METODO_NO_PERMITIDO : CodigoError.dePara(estadoHttp);
    }

    private static ResponseEntity<Object> respuesta(CodigoError codigo, String detalle) {
        return ResponseEntity.status(codigo.estado()).body(problema(codigo, detalle));
    }

    private static ProblemDetail problema(CodigoError codigo, String detalle) {
        var problema = ProblemDetail.forStatusAndDetail(codigo.estado(), detalle);
        problema.setTitle(codigo.titulo());
        problema.setProperty("codigo", codigo.name());
        return problema;
    }
}
