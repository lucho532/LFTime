package com.lftime.servidor;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Comprueba que el servidor publica su contrato OpenAPI (TB-1.4).
 * Todavía no hay endpoints de negocio, así que no compara rutas con {@code contrato-api.md}: esa comparación
 * se añade con el primer controlador.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(ConfiguracionBasePostgres.class)
class OpenApiPrueba {

    @Autowired
    private MockMvc mvc;

    @Test
    void elServidorPublicaSuContratoOpenApi() throws Exception {
        mvc.perform(get("/v3/api-docs").with(user("prueba")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").exists());
    }
}
