package com.lftime.servidor.utilidades;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.springframework.stereotype.Component;

/**
 * Única fuente de «ahora» del servidor y única que conoce el desfase de Colombia (R-9).
 * Colombia es UTC−5 fijo, sin horario de verano. Los instantes reales se guardan en UTC.
 * No decide reglas de jornada ni guarda nada. Nadie más llama a {@code Instant.now()},
 * {@code LocalDate.now()} ni equivalentes: una prueba de arquitectura lo vigila.
 */
@Component
public class RelojColombia {

    /** Desfase fijo de Colombia respecto a UTC. */
    public static final ZoneOffset DESFASE = ZoneOffset.ofHours(-5);

    private final Clock reloj;

    /** Crea el reloj con la fuente de tiempo inyectada; las pruebas pasan una fija. */
    public RelojColombia(Clock reloj) {
        this.reloj = reloj;
    }

    /** Instante real actual, en UTC. Es lo que se guarda como instante de una marcación. */
    public Instant instante() {
        return reloj.instant();
    }

    /** Fecha y hora actuales en Colombia. */
    public LocalDateTime fechaHoraColombia() {
        return aColombia(instante());
    }

    /** Fecha calendario actual en Colombia. */
    public LocalDate fechaColombia() {
        return fechaHoraColombia().toLocalDate();
    }

    /** Convierte un instante real a fecha y hora de Colombia. */
    public static LocalDateTime aColombia(Instant instante) {
        return LocalDateTime.ofInstant(instante, DESFASE);
    }

    /** Convierte una fecha y hora de Colombia a instante real. */
    public static Instant aInstante(LocalDateTime fechaHoraColombia) {
        return fechaHoraColombia.toInstant(DESFASE);
    }
}
