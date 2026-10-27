package com.lftime.servidor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del servidor de LFTime (Fase 2).
 * Su responsabilidad es arrancar Spring Boot.
 * No contiene configuración ni lógica: eso vive en los paquetes <code>configuracion</code> y siguientes.
 */
@SpringBootApplication
public class AplicacionLfTime {

    public static void main(String[] argumentos) {
        SpringApplication.run(AplicacionLfTime.class, argumentos);
    }
}
