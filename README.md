# LFTime

**Control de jornadas laborales del personal de salud** que una empresa asigna a hospitales de distintos municipios de Colombia: registro de entrada, almuerzo y salida con GPS, comparación con el horario, incidencias, alertas e informes.

> **Estado: Fase 1 (demostración, solo frontend).** Todo funciona con datos ficticios guardados en el navegador. No hay backend, base de datos ni servicios externos; el ingreso es simulado y el control de acceso por rol es solo visual. **No es una aplicación lista para producción.**

## Qué hace

Hay tres roles: **administrador**, **coordinador** y **trabajador**.

| Para quién | Qué ofrece |
|------------|------------|
| Trabajador | Registrar entrada, salida a almuerzo, regreso y salida final con la ubicación real del dispositivo (sin ubicación válida no hay marcación); ver su jornada, su historial y sus incidencias; justificar. |
| Coordinador | Panel con el estado del personal en tiempo real (indicadores, tabla filtrable, alertas, resumen por hospital, mapa, horas y almuerzo); gestión de personal, hospitales, coordenadas y horarios; revisión, resolución y escalada de incidencias; informes con exportación. |
| Administrador | Todo lo anterior, más la configuración de las reglas provisionales, la bandeja de incidencias pendientes de asignación y el restablecimiento de los datos de demostración. |

Otros puntos:

- **Tres tiempos separados**: efectivo, almuerzo y total, siempre calculados a partir de las marcas registradas, nunca de un contador.
- **Intentos rechazados aparte** de las marcaciones válidas; un fallo técnico nunca se presenta como ubicación indebida.
- **Una incidencia no es una sanción**: es una anomalía sujeta a revisión humana.
- **Informes** (asistencia diaria, horas por trabajador, incidencias, intentos rechazados y cumplimiento por hospital) exportables a CSV y Excel con la marca **DEMO** en el nombre y en la primera fila.
- Tema claro y oscuro, hora de Colombia (UTC−5) y todo el texto en español.

## Probarlo

Requisitos: **Node 22.12 o superior**.

```bash
cd frontend
npm install
npm run dev
```

Abre la dirección que indica Vite y entra con `/ingreso`: elige un usuario de prueba (sin contraseña). Los datos se generan relativos al día actual y se guardan en `localStorage` e `IndexedDB` (fotos); el aviso superior permite restablecerlos.

## Comandos (en `frontend/`)

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Comprueba tipos y compila |
| `npm test` | Pruebas (Vitest), una vez |
| `npm run lint` | Lint con oxlint |
| `npm run verificar:tamano` | Falla si un archivo escrito a mano supera 250 líneas |
| `npm run verificar:contraste` | Falla si un par de colores de los temas no llega a 4.5:1 |

Las cinco comprobaciones deben pasar antes de dar un cambio por bueno.

## APK de pruebas para Android

Para instalar la demostración en un teléfono (Capacitor, solo depuración). Requiere JDK 21, el SDK de Android y el teléfono con la depuración USB activada.

```bash
cd frontend
npm run build
npx cap sync android
cd android
./gradlew assembleDebug        # genera app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Los datos de la demostración quedan solo en ese teléfono. No es una versión para publicar.

## Tecnología

React 19 · TypeScript · Vite · React Router · Vitest y Testing Library · ExcelJS (solo para exportar a Excel, cargado bajo demanda). Sin librerías de interfaz, de estado ni de iconos.

## Arquitectura

Capas estrictas: **Página → Componentes → Hook → Servicio (interfaz) → Repositorio de demostración**.

```text
frontend/src/
├── paginas/ componentes/ hooks/     interfaz
├── reglas/                          reglas de negocio como funciones puras y provisionales
├── servicios/                       interfaces y su versión de demostración (servicios/fabrica.ts las elige)
├── repositorios/demo/               almacenamiento local de la demostración
├── contratos/ modelos/ mapeadores/  datos
├── datos-demo/                      datos ficticios relativos al día actual
├── utilidades/ validadores/ estilos/ pruebas/
```

En la Fase 2 el backend sustituye `servicios/demo` y `repositorios/demo` por llamadas HTTP sin tocar páginas, hooks ni componentes.

## Cómo se trabaja: desarrollo guiado por especificación

El proyecto sigue **SDD** con documentos propios en `specs/`. Léelos en este orden:

1. [`specs/constitution.md`](specs/constitution.md) — principios y reglas de código.
2. [`specs/001-lftime/spec.md`](specs/001-lftime/spec.md) — qué se construye y las decisiones tomadas.
3. [`specs/001-lftime/plan.md`](specs/001-lftime/plan.md) — pila, capas y supuestos provisionales.
4. [`specs/001-lftime/contratos-preliminares.md`](specs/001-lftime/contratos-preliminares.md) — contratos de datos.
5. [`specs/001-lftime/tasks.md`](specs/001-lftime/tasks.md) — **el estado real del trabajo**, hito por hito.
6. [`specs/001-lftime/matriz-verificacion.md`](specs/001-lftime/matriz-verificacion.md) — qué criterio tiene qué prueba y qué falta verificar.
7. [`specs/001-lftime/traspaso-fase-2.md`](specs/001-lftime/traspaso-fase-2.md) — qué debe hacer el backend (borrador).

Las instrucciones para trabajar con un asistente de código están en [`CLAUDE.md`](CLAUDE.md).

## Lo que todavía no está validado

- Las **reglas de jornada son supuestos provisionales y configurables** (tolerancias, umbrales, radio y precisión del GPS), no reglas laborales. Siguen abiertos el tratamiento laboral del almuerzo, festivos y recargos, la conservación de datos y quién puede corregir marcaciones a mano (la corrección manual no está implementada).
- Falta verificar con **GPS real en un teléfono**, la compresión de una **foto real**, la **descarga y apertura** de los archivos exportados y la revisión por pantalla en **móvil y tableta**. Detalle en la matriz de verificación.
- Los archivos exportados son de demostración y no tienen validez.
