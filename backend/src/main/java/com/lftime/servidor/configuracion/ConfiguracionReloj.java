package com.lftime.servidor.configuracion;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registra la fuente de tiempo real del servidor.
 * Su responsabilidad es entregar un {@link Clock} en UTC a {@code RelojColombia}.
 * No convierte horas ni conoce el desfase de Colombia: eso es de {@code RelojColombia}.
 */
@Configuration
public class ConfiguracionReloj {

    @Bean
    Clock relojDelSistema() {
        return Clock.systemUTC();
    }
}
