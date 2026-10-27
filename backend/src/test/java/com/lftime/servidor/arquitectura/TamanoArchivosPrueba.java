package com.lftime.servidor.arquitectura;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/** Ningún archivo escrito a mano supera 250 líneas (R-3), y el verificador falla cuando alguno se pasa. */
class TamanoArchivosPrueba {

    @Test
    void ningunArchivoDelServidorSuperaElMaximo() {
        var excedidos = VerificadorTamano.archivosQueSuperan(Path.of("src"), VerificadorTamano.MAXIMO_DE_LINEAS);

        assertThat(excedidos).as("Archivos con más de 250 líneas").isEmpty();
    }

    @Test
    void elVerificadorDetectaUnArchivoDeMasDeDoscientasCincuentaLineas(@TempDir Path carpeta) throws IOException {
        Files.write(carpeta.resolve("Grande.java"), Collections.nCopies(251, "// linea"));
        Files.write(carpeta.resolve("Justo.java"), Collections.nCopies(250, "// linea"));

        var excedidos = VerificadorTamano.archivosQueSuperan(carpeta, VerificadorTamano.MAXIMO_DE_LINEAS);

        assertThat(excedidos).hasSize(1);
        assertThat(excedidos.get(0)).contains("Grande.java").contains("251");
    }
}
