# Integración con `commit-report`

Esta skill está diseñada para que su output sea consumido directamente por `commit-report`.

- Los **tipos de commit** (`feat`, `fix`, `refactor`, etc.) mapean a la tabla de traducción de `commit-report`.
- El campo **Módulo** permite a `commit-report` inferir la sección del CMS afectada sin ambigüedad.
- El campo **Escenarios** provee contexto para construir la descripción de impacto sin marcar `[REVISAR]`.
- El campo **Impacto** puede tomarse casi literalmente como base del logro del período.

## Ciclo completo recomendado

1. Al terminar el trabajo: `"generar commits"` (sin push, para revisar)
2. Al confirmar: `"generar commits con push"` (o push manual)
3. Para reportar: `"generá el reporte de avance"` → `commit-report` consume los commits del período indicado