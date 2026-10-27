package com.lftime.servidor.arquitectura;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.lftime.servidor.arquitectura.infractores.InfractorReloj;
import com.lftime.servidor.arquitectura.infractores.controladores.ControladorInfractor;
import com.lftime.servidor.arquitectura.infractores.repositorios.RepositorioInfractor;
import com.lftime.servidor.arquitectura.infractores.reglas.ReglaInfractora;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

/** Demuestra que cada regla de arquitectura falla cuando se rompe: una regla que nunca falla no protege nada. */
class ReglasDetectanInfraccionesPrueba {

    private static void verificaQueFalla(ArchRule regla, String clase, Class<?>... infractoras) {
        var clases = new ClassFileImporter().importClasses(infractoras);

        assertThatThrownBy(() -> regla.check(clases))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining(clase);
    }

    @Test
    void laReglaDelRelojFallaConUnaClaseQueLlamaInstantNow() {
        verificaQueFalla(ReglasArquitectura.SOLO_RELOJ_COLOMBIA_CONOCE_AHORA, "InfractorReloj", InfractorReloj.class);
    }

    @Test
    void laReglaDeCapasFallaSiUnControladorLlamaAUnRepositorio() {
        verificaQueFalla(ReglasArquitectura.CAPAS, "ControladorInfractor",
                ControladorInfractor.class, RepositorioInfractor.class);
    }

    @Test
    void laReglaDePurezaFallaSiUnaReglaUsaSpring() {
        verificaQueFalla(ReglasArquitectura.REGLAS_Y_PERMISOS_PUROS, "ReglaInfractora", ReglaInfractora.class);
    }
}
