package com.lftime.servidor.arquitectura.infractores;

import java.time.Instant;

/**
 * Clase de ejemplo que rompe la regla del reloj a propósito.
 * Solo la usa la prueba que demuestra que la regla falla. No debe usarse en código real.
 */
public class InfractorReloj {

    public Instant ahora() {
        return Instant.now();
    }
}
