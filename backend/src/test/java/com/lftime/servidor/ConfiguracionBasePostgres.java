package com.lftime.servidor;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Levanta un PostgreSQL real y desechable para las pruebas de integración (plan §1, TB-1.5).
 * Su responsabilidad es ofrecer la base y conectarla a Spring.
 * No contiene datos ni esquema: el esquema lo crea Flyway con las migraciones.
 */
@TestConfiguration(proxyBeanMethods = false)
class ConfiguracionBasePostgres {

    /** Versión fijada de la imagen; se confirma contra la de Railway al desplegar (N-12). */
    private static final String IMAGEN = "postgres:17-alpine";

    @Bean
    @ServiceConnection
    PostgreSQLContainer basePostgres() {
        return new PostgreSQLContainer(DockerImageName.parse(IMAGEN));
    }
}
