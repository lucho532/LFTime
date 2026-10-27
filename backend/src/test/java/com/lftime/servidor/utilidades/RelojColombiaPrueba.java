package com.lftime.servidor.utilidades;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

/** Comprueba la conversión a hora de Colombia con un reloj fijo (R-9). */
class RelojColombiaPrueba {

    private static RelojColombia relojEn(String instanteUtc) {
        return new RelojColombia(Clock.fixed(Instant.parse(instanteUtc), ZoneOffset.UTC));
    }

    @Test
    void laHoraDeColombiaVaCincoHorasAtrasDeUtc() {
        var reloj = relojEn("2026-10-27T15:30:00Z");

        assertThat(reloj.fechaHoraColombia()).isEqualTo(LocalDateTime.of(2026, 10, 27, 10, 30));
        assertThat(reloj.fechaColombia()).isEqualTo(LocalDate.of(2026, 10, 27));
    }

    @Test
    void despuesDeMedianocheUtcColombiaTodaviaEsElDiaAnterior() {
        var reloj = relojEn("2026-10-27T03:00:00Z");

        assertThat(reloj.fechaColombia()).isEqualTo(LocalDate.of(2026, 10, 26));
        assertThat(reloj.fechaHoraColombia().getHour()).isEqualTo(22);
    }

    @Test
    void elInstanteSigueSiendoUtc() {
        assertThat(relojEn("2026-10-27T15:30:00Z").instante()).isEqualTo(Instant.parse("2026-10-27T15:30:00Z"));
    }

    @Test
    void convertirDeIdaYVueltaConservaElInstante() {
        var instante = Instant.parse("2026-01-01T04:59:59Z");

        assertThat(RelojColombia.aInstante(RelojColombia.aColombia(instante))).isEqualTo(instante);
        assertThat(RelojColombia.aColombia(instante)).isEqualTo(LocalDateTime.of(2025, 12, 31, 23, 59, 59));
    }
}
