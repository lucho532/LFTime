package com.lftime.servidor.arquitectura;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

import com.tngtech.archunit.base.DescribedPredicate;
import com.tngtech.archunit.core.domain.JavaCall;
import com.tngtech.archunit.lang.ArchRule;

/**
 * Reglas de arquitectura del servidor, definidas una sola vez.
 * Las aplica {@code ArquitecturaPrueba} al código real y {@code ReglasDetectanInfraccionesPrueba} a clases
 * infractoras de ejemplo, para demostrar que fallan cuando se rompen (TB-1.3).
 */
final class ReglasArquitectura {

    static final String PAQUETE_RAIZ = "com.lftime.servidor";

    /** Nadie fuera de {@code RelojColombia} obtiene «ahora» por su cuenta (R-9, TB-1.2). */
    static final ArchRule SOLO_RELOJ_COLOMBIA_CONOCE_AHORA = noClasses()
            .that().doNotHaveFullyQualifiedName(PAQUETE_RAIZ + ".utilidades.RelojColombia")
            .and().doNotHaveFullyQualifiedName(PAQUETE_RAIZ + ".configuracion.ConfiguracionReloj")
            .should().callMethodWhere(llamaAAhora())
            .as("Solo RelojColombia y ConfiguracionReloj pueden obtener la hora actual");

    /** Controlador → servicio → repositorio; nadie salta una capa (R-4, TB-1.3). */
    static final ArchRule CAPAS = layeredArchitecture()
            .consideringOnlyDependenciesInLayers()
            .withOptionalLayers(true)
            .layer("Controladores").definedBy("..controladores..")
            .layer("Servicios").definedBy("..servicios..")
            .layer("Repositorios").definedBy("..repositorios..")
            .whereLayer("Controladores").mayNotBeAccessedByAnyLayer()
            .whereLayer("Servicios").mayOnlyBeAccessedByLayers("Controladores")
            .whereLayer("Repositorios").mayOnlyBeAccessedByLayers("Servicios")
            .as("Controlador → servicio → repositorio, sin saltar capas");

    /** Un controlador nunca toca entidades de persistencia: habla en DTO (R-4). */
    static final ArchRule CONTROLADORES_SIN_ENTIDADES = noClasses()
            .that().resideInAPackage("..controladores..")
            .should().dependOnClassesThat().resideInAPackage("..dominio..")
            .allowEmptyShould(true)
            .as("Los controladores no usan entidades de persistencia");

    /** Las reglas y los permisos son funciones puras: sin Spring, sin base de datos, sin HTTP (R-4, plan §2). */
    static final ArchRule REGLAS_Y_PERMISOS_PUROS = noClasses()
            .that().resideInAnyPackage("..reglas..", "..permisos..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta.persistence..", "..repositorios..", "..controladores..", "..dominio..")
            .allowEmptyShould(true)
            .as("Las reglas y los permisos no dependen de Spring, de la base de datos ni de HTTP");

    private ReglasArquitectura() {
    }

    private static DescribedPredicate<JavaCall<?>> llamaAAhora() {
        return DescribedPredicate.describe("pide la hora actual al sistema", llamada -> {
            var propietario = llamada.getTargetOwner().getFullName();
            var metodo = llamada.getTarget().getName();
            return (propietario.startsWith("java.time.") && metodo.equals("now"))
                    || (propietario.equals("java.lang.System") && metodo.equals("currentTimeMillis"))
                    || (propietario.equals("java.util.Date") && metodo.equals("<init>"));
        });
    }
}
