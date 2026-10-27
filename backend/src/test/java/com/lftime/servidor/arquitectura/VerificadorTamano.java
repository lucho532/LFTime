package com.lftime.servidor.arquitectura;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

/**
 * Busca archivos escritos a mano que superan el máximo de líneas (R-3, 250).
 * Su responsabilidad es devolver los que se pasan. No modifica ni formatea nada.
 */
final class VerificadorTamano {

    static final int MAXIMO_DE_LINEAS = 250;

    private static final Set<String> EXTENSIONES = Set.of(".java", ".properties", ".sql", ".xml", ".yml");

    private VerificadorTamano() {
    }

    /** Archivos bajo {@code raiz} con más de {@code maximo} líneas, como «ruta (n líneas)». */
    static List<String> archivosQueSuperan(Path raiz, int maximo) {
        try (Stream<Path> archivos = Files.walk(raiz)) {
            return archivos
                    .filter(Files::isRegularFile)
                    .filter(VerificadorTamano::esDeCodigo)
                    .map(ruta -> descripcionSiSePasa(ruta, maximo))
                    .filter(descripcion -> descripcion != null)
                    .toList();
        } catch (IOException error) {
            throw new UncheckedIOException(error);
        }
    }

    private static boolean esDeCodigo(Path ruta) {
        var nombre = ruta.getFileName().toString();
        return EXTENSIONES.stream().anyMatch(nombre::endsWith);
    }

    private static String descripcionSiSePasa(Path ruta, int maximo) {
        try (Stream<String> lineas = Files.lines(ruta)) {
            var cantidad = lineas.count();
            return cantidad > maximo ? ruta + " (" + cantidad + " líneas)" : null;
        } catch (IOException error) {
            throw new UncheckedIOException(error);
        }
    }
}
