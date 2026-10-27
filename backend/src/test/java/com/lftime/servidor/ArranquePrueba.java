package com.lftime.servidor;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Import;

/**
 * Comprueba que la aplicación arranca contra un PostgreSQL real con Flyway activo.
 * No prueba reglas de negocio: solo que el esqueleto está bien armado.
 */
@SpringBootTest
@Import(ConfiguracionBasePostgres.class)
class ArranquePrueba {

    @Autowired
    private ApplicationContext contexto;

    @Test
    void laAplicacionArrancaConPostgresYFlyway() {
        assertThat(contexto.getBean(AplicacionLfTime.class)).isNotNull();
    }
}
