-- Migración solo de pruebas: demuestra que Flyway aplica scripts sobre un PostgreSQL real (TB-1.5).
-- No es parte del modelo de datos; las migraciones reales están en src/main/resources/db/migracion.
CREATE TABLE prueba_migracion (
    id INTEGER PRIMARY KEY,
    nota TEXT NOT NULL
);
