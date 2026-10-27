package com.lftime.servidor.controladores;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.lftime.servidor.errores.CodigoError;
import com.lftime.servidor.errores.ErrorDeNegocio;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Comprueba que todo error sale como problem+json con un código en español y sin filtrar datos internos. */
class ManejadorErroresPrueba {

    private static final MediaType PROBLEMA = MediaType.APPLICATION_PROBLEM_JSON;

    private MockMvc mvc;

    @BeforeEach
    void preparar() {
        var validador = new LocalValidatorFactoryBean();
        validador.afterPropertiesSet();
        mvc = MockMvcBuilders.standaloneSetup(new ControladorDeEjemplo())
                .setControllerAdvice(new ManejadorErrores())
                .setValidator(validador)
                .build();
    }

    @Test
    void unErrorDeNegocioSaleConSuCodigoYSuEstado() throws Exception {
        mvc.perform(get("/conflicto"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(PROBLEMA))
                .andExpect(jsonPath("$.codigo").value("CONFLICTO"))
                .andExpect(jsonPath("$.detail").value("El documento ya existe."));
    }

    @Test
    void unDatoInvalidoSaleComoValidacionConLosCampos() throws Exception {
        mvc.perform(post("/validar").contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(PROBLEMA))
                .andExpect(jsonPath("$.codigo").value("VALIDACION"))
                .andExpect(jsonPath("$.errores[0].campo").value("nombre"));
    }

    @Test
    void unMetodoNoPermitidoTambienLlevaCodigo() throws Exception {
        mvc.perform(post("/conflicto"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(content().contentTypeCompatibleWith(PROBLEMA))
                .andExpect(jsonPath("$.codigo").value("METODO_NO_PERMITIDO"));
    }

    @Test
    void unPermisoNegadoSaleComoSinPermiso() throws Exception {
        mvc.perform(get("/prohibido"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SIN_PERMISO"));
    }

    @Test
    void unErrorInesperadoNoFiltraSuMensaje() throws Exception {
        mvc.perform(get("/inesperado"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(PROBLEMA))
                .andExpect(jsonPath("$.codigo").value("ERROR_INTERNO"))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("1234567"))));
    }

    /** Controlador de ejemplo solo para las pruebas. */
    @RestController
    static class ControladorDeEjemplo {

        @GetMapping("/conflicto")
        String conflicto() {
            throw new ErrorDeNegocio(CodigoError.CONFLICTO, "El documento ya existe.");
        }

        @PostMapping("/validar")
        String validar(@Valid @RequestBody Cuerpo cuerpo) {
            return cuerpo.nombre();
        }

        @GetMapping("/prohibido")
        String prohibido() {
            throw new AccessDeniedException("detalle interno");
        }

        @GetMapping("/inesperado")
        String inesperado() {
            throw new IllegalStateException("documento 1234567");
        }

        record Cuerpo(@NotBlank String nombre) {
        }
    }
}
