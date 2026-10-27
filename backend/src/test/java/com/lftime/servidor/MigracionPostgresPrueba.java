package com.lftime.servidor;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.DriverManager;
import java.sql.SQLException;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Comprueba que se puede levantar un PostgreSQL real y migrarlo con Flyway (TB-1.5, plan §1).
 * Usa una migración propia de pruebas, porque las del modelo llegan en el hito B2.
 * No prueba el esquema del negocio.
 */
@Testcontainers
class MigracionPostgresPrueba {

    @Container
    private static final PostgreSQLContainer BASE = new PostgreSQLContainer(DockerImageName.parse("postgres:17-alpine"));

    @Test
    void flywayAplicaUnaMigracionSobreUnPostgresReal() throws SQLException {
        var resultado = Flyway.configure()
                .dataSource(BASE.getJdbcUrl(), BASE.getUsername(), BASE.getPassword())
                .locations("classpath:db/prueba")
                .load()
                .migrate();

        assertThat(resultado.migrationsExecuted).isEqualTo(1);
        try (var conexion = DriverManager.getConnection(BASE.getJdbcUrl(), BASE.getUsername(), BASE.getPassword());
                var consulta = conexion.createStatement();
                var tablas = consulta.executeQuery(
                        "SELECT count(*) FROM information_schema.tables WHERE table_name = 'prueba_migracion'")) {
            tablas.next();
            assertThat(tablas.getInt(1)).isEqualTo(1);
        }
    }
}
