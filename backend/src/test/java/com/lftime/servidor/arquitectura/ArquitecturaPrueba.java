package com.lftime.servidor.arquitectura;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

/** Aplica las reglas de arquitectura al código real del servidor (sin las pruebas). */
class ArquitecturaPrueba {

    private static final JavaClasses CODIGO = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages(ReglasArquitectura.PAQUETE_RAIZ);

    @Test
    void soloRelojColombiaConoceLaHoraActual() {
        ReglasArquitectura.SOLO_RELOJ_COLOMBIA_CONOCE_AHORA.check(CODIGO);
    }

    @Test
    void lasCapasSeRespetan() {
        ReglasArquitectura.CAPAS.check(CODIGO);
    }

    @Test
    void losControladoresNoUsanEntidades() {
        ReglasArquitectura.CONTROLADORES_SIN_ENTIDADES.check(CODIGO);
    }

    @Test
    void lasReglasYLosPermisosSonPuros() {
        ReglasArquitectura.REGLAS_Y_PERMISOS_PUROS.check(CODIGO);
    }
}
