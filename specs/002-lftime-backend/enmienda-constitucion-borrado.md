# Propuesta de enmienda a la constitución: eliminación de cuenta y de empresa

**Estado:** APROBADA con la **opción B (anonimización)** por el responsable el 2026-10-27 («confirmo tus recomendaciones») e incorporada a `specs/constitution.md` (R-10 y principio 9). El texto aprobado es el de la constitución, que difiere de §3 de este documento (redactado para la A): allí manda la B. Sigue pendiente la validación legal del plazo de conservación (condición 4). **Ampliación (2026-10-27, D-B37):** al eliminar una empresa entera se borran también sus registros de jornada; ya está en la constitución.

## 1. Por qué se propone

- D-B35 pide un endpoint de **eliminar cuenta** (exigido por Google Play), ejecutable por la propia persona o por el administrador, con borrado inmediato de sus datos.
- D-B10 pide un botón del desarrollador que **elimine una empresa** entera, con confirmación escribiendo su nombre.
- R-10 dice que el histórico no se modifica ni se sobrescribe, y el plan (§5) deja a la aplicación sin `UPDATE` ni `DELETE` sobre las tablas de solo añadir.
- N-3 fija una conservación provisional de 1 año, pendiente de validación legal.

Sin una enmienda, el borrado contradice la constitución, y una decisión técnica no puede contradecir un principio (R-13).

## 2. Qué hay que decidir

La eliminación de una **cuenta** se puede entender de tres maneras. Elige una; el texto de §3 está redactado para la **A**, que es lo que pediste.

| | Qué pasa con las marcaciones, intentos e incidencias de la persona | Ventaja | Riesgo |
|---|---|---|---|
| **A. Borrado total inmediato** | Se eliminan junto con la cuenta | Cumple literalmente la petición de borrar «todo, al momento» | La empresa pierde su soporte de jornada; puede chocar con el deber legal de conservarlo |
| **B. Anonimización (recomendada hasta validar lo legal)** | Se borran identidad, foto, correo, teléfono y dispositivo; las marcaciones quedan desvinculadas de toda persona identificable | Cumple la supresión de datos personales y conserva el histórico de la empresa | Hay que verificar con el asesor que ubicación y hora no permiten reidentificar |
| **C. Borrado diferido** | Se bloquea la cuenta de inmediato y los registros se borran al vencer el plazo de N-3 | Respeta la conservación legal | No es «al momento» |

Para la **empresa** (botón del desarrollador) rige lo mismo: A borra todo; B y C requieren definir qué queda.

## 3. Texto propuesto (para la opción A)

**Añadir al final de R-10:**

> **Excepción de supresión (Fase 2).** La eliminación de una cuenta, pedida por la propia persona o por un administrador de su empresa, y la eliminación de una empresa, pedida por el desarrollador, suprimen los datos personales y los registros que los contienen. Condiciones:
> 1. Solo se hace mediante una **operación de plataforma de eliminación** explícita, con confirmación de quien la pide. La aplicación ordinaria sigue sin poder modificar ni borrar registros históricos.
> 2. Queda una entrada de auditoría de plataforma **sin datos personales** (quién eliminó, cuándo, qué identificador anulado y de qué tipo), que no se borra con la empresa.
> 3. No se elimina lo que una norma vigente obligue a conservar; si existe tal plazo, la operación se bloquea o se limita según lo que valide el asesor legal.
> 4. El último administrador de una empresa no puede eliminarse (D-B18).
> 5. Esta excepción no autoriza corregir, editar ni borrar marcaciones o intentos por otra vía: no hay corrección manual (D-B23).

**Añadir al principio 9 (Privacidad por diseño):**

> Toda persona puede pedir la eliminación de su cuenta y de sus datos personales, con las condiciones de la excepción de supresión de R-10.

**Para la opción B**, la condición 1 diría «suprimen o anonimizan» y se añadiría: «los registros de jornada se conservan desvinculados de toda persona identificable». **Para la C**, la condición 3 pasaría a ser la regla general.

## 4. Lo que cambia en los demás documentos si se aprueba

- `plan.md` §5: una rutina de plataforma con un rol de base de datos aparte, distinto del de la aplicación, que es el único que puede eliminar; prueba de que el rol de la aplicación sigue sin poder hacerlo.
- `spec.md`: D-B10 y D-B35 pasan de «conflicto señalado» a decisión cerrada; N-3 y N-19 se actualizan.
- `tasks.md`: TB-3.5 (borrado de empresa) y TB-3.6 (eliminar cuenta) se desbloquean, con pruebas de que el borrado es completo y de que deja la auditoría sin datos personales.
- Google Play pide además una **dirección web** donde solicitar la eliminación de la cuenta, aparte del botón de la aplicación (TB-10.x).

## 5. Lo que necesita el responsable

1. Elegir A, B o C.
2. Confirmar con el asesor legal el plazo de conservación de N-3 (1 año es provisional y puede ser menor que el exigido a los empleadores por soportes de jornada).
3. Aprobar por escrito; solo entonces se edita `constitution.md`.
