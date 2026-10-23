# Matriz de verificación: criterios y historias → pruebas (T-12.4)

Fecha: 2026-10-23. Estado de la Fase 1 al cerrar el hito 12. «Automática» = prueba de `frontend/src/pruebas/`; «Manual» = comprobación hecha en un navegador. **Una fila solo es «Verificado» si lo automático cubre todo lo que el criterio afirma; lo demás queda «Parcial» con lo que falta.**

## Criterios de aceptación transversales (spec §5.1)

| CA | Qué exige | Prueba automática | Manual | Estado |
|----|-----------|-------------------|--------|--------|
| CA-1 | Sin ubicación válida no hay marcación; el mensaje dice causa y cómo corregir | `paginas/registro`, `servicios/marcaciones` (ubicación controlada) | No con GPS real ni en teléfono | **Parcial**: falta GPS real |
| CA-2 | Marcación válida guarda tipo, hora, coordenadas y precisión | `servicios/marcaciones` | — | Verificado |
| CA-3 | Un intento fuera de radio no cambia tiempos ni secuencia | `servicios/marcaciones`, `paginas/registro` | — | Verificado |
| CA-4 | Fuera de radio con ubicación válida: intento + incidencia; fallo técnico: solo intento | `servicios/marcaciones` | — | Verificado |
| CA-5 | Intentos separados de las marcaciones en pantallas e informes | `paginas/registro`, `servicios/marcaciones`, `reglas/informes` | — | Verificado |
| CA-6 | Hospital sin coordenadas confirmadas: advertencia y sin validación | `componentes/hospitales`, `paginas/hospitales` | — | Verificado |
| CA-7 | Coordenadas fuera de rango o no numéricas se rechazan; precisión GPS antes de confirmar | `validadores/coordenadasYHospital`, `componentes/formularioCoordenadas` | No con GPS real | **Parcial**: falta GPS real |
| CA-8 | Foto > 2 MB se comprime; formato no admitido se rechaza; retirar foto; funciona sin foto | `utilidades/fotos`, `servicios/fotoServicio`, `paginas/fotosYHorarios` (motor de imagen sustituido) | No se probó la compresión con un archivo real en un navegador | **Parcial**: falta compresión real |
| CA-9 | Radio y precisión rotulados «provisional» en configuración y pantallas | `paginas/hospitales`, `paginas/configuracion` | Vista de Configuración revisada | Verificado |
| CA-10 | Sin servicios externos; la demo declara que la validación real es del backend | `arquitectura/reglasDeCodigo` (sin `fetch`/http), `App` (aviso permanente) | Búsqueda de URLs en lo compilado (solo espacios de nombres XML) | Verificado (la pestaña de red no se abrió) |
| CA-11 | Hospital sin coordenadas válidas no permite marcar y explica por qué | `componentes/hospitales`, `paginas/registro`, `servicios/marcaciones` | — | Verificado |
| CA-12 | Varios intentos del mismo trabajador, jornada y hospital: una incidencia con todos | `reglas/agruparIntentos`, `servicios/marcaciones`, `paginas/incidencias` | — | Verificado |
| CA-13 | Resolver o escalar no toca los intentos; queda quién y cuándo | `servicios/incidencias` | — | Verificado |
| CA-14 | Un intento sin ubicación válida es fallo técnico, nunca evidencia de ubicación indebida | `reglas/agruparIntentos`, `reglas/fechaOperativaYUbicacion`, `servicios/marcaciones`, `paginas/registro` | — | Verificado |

## Historias de usuario (spec §5)

| HU | Alcance entregado | Pruebas automáticas | Manual | Estado |
|----|-------------------|---------------------|--------|--------|
| HU-01 Panel | Tarjetas con enlace, tabla en tiempo real, alertas, resumen por hospital, mapa, horas, estados, almuerzo, actualización | `paginas/panel`, `reglas/indicadoresPanel`, `servicios/panel` | Revisado en Chrome (escritorio) | **Parcial**: sin comparación fina con la referencia ni revisión en tableta |
| HU-02 Personal | Lista, ficha, alta/edición, foto | `paginas/personal`, `servicios/personalYHorarios`, `servicios/fotoServicio` | — | Verificado (sin revisión visual por pantalla) |
| HU-03 Hospitales | Lista, ficha, coordenadas, coordinador, mapa | `paginas/hospitales`, `servicios/hospitalServicio`, `componentes/hospitales` | — | Verificado |
| HU-04 Horarios | Asignar horario con vigencia, historial | `paginas/fotosYHorarios`, `servicios/personalYHorarios`, `reglas/asignacionYHorario` | — | Verificado |
| HU-05 Registro | Jornada del día, acción siguiente, intentos, historial | `paginas/registro`, `servicios/marcaciones`, `reglas/duracionesYSecuencia` | No en móvil ni con GPS real | **Parcial**: falta móvil y GPS real. **La corrección manual (T-9.7) está bloqueada por P-12** |
| HU-06 Incidencias | Detección, lista y detalle, justificación, resolución, escalada | `paginas/incidencias`, `servicios/incidencias`, `reglas/detectarIncidencias`, `reglas/permisosIncidencia` | — | Verificado (con reglas provisionales) |
| HU-07 Alertas | Campana, panel, revisada al abrir | `paginas/incidencias`, `paginas/panel` | — | Verificado. **No envía correos ni mensajes** (fuera de la Fase 1) |
| HU-08 Informes | Cinco informes, filtros, CSV y Excel con marca DEMO | `paginas/informes`, `reglas/informes`, `utilidades/exportacionInformes` | No se abrió un archivo descargado en Excel/LibreOffice | **Parcial**: falta descarga y apertura reales; sin historial por trabajador |
| HU-09 Usuarios y accesos | Configuración, usuarios de prueba (solo lectura), restablecer | `paginas/configuracion`, `reglas/permisosRuta`, `servicios/sesionDemo` | Vista de Configuración revisada | **Parcial por diseño**: gestión real de cuentas, permisos y recuperación de acceso son de la Fase 2 |

## Otros requisitos transversales

| Requisito | Prueba | Estado |
|-----------|--------|--------|
| Tema claro/oscuro con preferencia guardada (D32) | `paginas/tema`, `npm run verificar:contraste` (25 pares, 4.5:1, dos temas) | Verificado; oscuro revisado en Chrome |
| ExcelJS aislado (D34) y marca DEMO (D36) | `arquitectura/reglasDeCodigo`, `utilidades/exportacionInformes` | Verificado |
| Hora solo por `horaColombia` (R-9), CSS de un solo dueño (R-6) | `arquitectura/reglasDeCodigo` | Verificado |
| Ningún archivo supera 250 líneas (R-3) | `npm run verificar:tamano` | Verificado |
| Responsivo (teléfono, tableta, escritorio) | Hojas de estilo con puntos de corte en 720 px y 1100 px | **No verificado**: la ventana del navegador de pruebas no cambió de ancho, así que no se pudo revisar ninguna pantalla en móvil o tableta |

## Qué falta para cerrar la verificación

1. Probar el registro con un **GPS real en un teléfono** (CA-1, CA-7, HU-05).
2. Probar la **compresión de una foto real** en un navegador (CA-8).
3. **Descargar** un CSV y un Excel desde la interfaz y abrirlos en Excel o LibreOffice (HU-08, T-1.5).
4. Revisar **cada pantalla en móvil y tableta** y firmar la lista de T-12.2.
5. Abrir la **pestaña de red** del navegador y confirmar que no hay peticiones externas (CA-10).
