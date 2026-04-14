# Wiki Log

Registro de ingest, gaps detectados y cambios a la wiki.

---

## Formato de entrada

```
[YYYY-MM-DD] <tipo> | <descripción>
<detalle opcional>
```

Tipos: `ingest` | `gap` | `update` | `fix`

---

## Entradas

[2026-04-13] ingest | Bootstrap inicial
Páginas creadas: 16.
Gaps detectados: ninguno en el ingest inicial.
Directorios vacíos registrados:
- comment_page/ — 0 archivos .ts. No crear página wiki hasta que haya contenido.
- user_profile_page/ — 0 archivos .ts. No crear página wiki hasta que haya contenido.
Sub-componentes del video_editor_page con contenido vacío (1 línea):
- EditorInfoSection.ts
- EditorCategorySection.ts
- EditorImageSection.ts
- EditorRelatesSection.ts

---

[2026-04-14] gap | customfield IDs de campos custom del equipo Bluestack sin descubrir
Los campos "deploy", "cambios SQL" y "cambios VFS" existen en el proyecto NAA pero sus
customfield_XXXXX IDs no están mapeados. Pendiente: ejecutar discovery curl sobre un ticket
con esos campos completados y actualizar OP-1, OP-6 de jira-reader/SKILL.md y
classification-rules.md. Ver comando en .claude/references/COMMANDS.md.

[2026-04-14] update | Fase 1 ticket-analyst completada
Creados: ticket-analyst/PIPELINE.md, classification-rules.md.
Corregida máquina de estados Jira en architecture doc, jira-reader OP-6, wiki y JQL queries.
Trigger QA Master = estado "Revisión" (no "A Versionar").
Pendiente validación E2E sobre 2 tickets adicionales (Post/Video) para milestone completo.

---

[2026-04-14] fix | component-to-module.json actualizado con variantes reales de Jira
Problema: las claves del mapa usaban nombres canónicos ("Video", "Images", "AI") pero Jira
almacena variantes reales: "Videos", "imagenes", "Ai", "IA", "CKEditor", "login", etc.
TA-6 paso 1 fallaba en exact match para cualquier ticket de componente Video o Images.
Solución: agregados aliases para todas las variantes encontradas en tickets reales.
Impacto: clasificación de tickets Video/Images pasa de confidence "low" (buggy) a "high" (correcto).
Acción: revisar periódicamente al encontrar nuevos valores de component_jira en Jira.

[2026-04-14] update | Milestone Fase 1 completado — 3/3 tickets correctamente clasificados
Tickets validados: NAA-4429 (AI, Fase 0) + NAA-3964 (Videos→video) + NAA-4120 (imagenes→images).
Tasa de clasificación: 3/3 = 100% > 85% requerido.
NAA-3964: criteria_source=inferred (no sección estructurada), 5 criterios, confidence=high.
NAA-4120: criteria_source=extracted (sección "Criterios de aceptación"), 2 criterios, confidence=high.
Resultados documentados en pipeline-logs/completed/.

[2026-04-14] update | Auditoría documental — consolidación SSoT completa
5 páginas wiki/ nuevas creadas: wiki/development/commit-conventions.md, wiki/development/skill-conventions.md, wiki/qa/adf-format-guide.md, wiki/qa/devsaas-flow.md, wiki/qa/pipeline-integration-schema.md.
7 references/ convertidas en stubs con punteros a wiki/: smart-commit/commit-format.md, skill-creator/bluestack-conventions.md, jira-writer/adf-format-guide.md, jira-writer/devsaas-flow.md, jira-reader/pipeline-schema.md, jira-writer/pipeline-schema.md, jira-writer-workspace/adf-format-guide.md.
.claude/rules/doc-organization.md creado (regla going-forward de organización documental).
CLAUDE.md: tabla de comandos eliminada (SSoT = COMMANDS.md), Wiki location actualizado.
wiki/overview.md: tabla de comandos reemplazada por referencia a COMMANDS.md.
wiki/index.md: secciones Development y QA/Jira agregadas.
src/core/README.md: referencia a wiki/core/ agregada.

---

[2026-04-14] update | Fase 2 test-engine completada — PIPELINE.md + E2E validado
Creado: .claude/pipelines/test-engine/PIPELINE.md (pasos TE-1 a TE-8).
Schema output unificado v2 aplicado (compatible GitHub Actions + test-reporter TR-3).
§3.3 del architecture doc actualizado con schema unificado.
E2E milestone: PASS — NewLiveBlog 1/1 passed (309s) en Docker Grid (3 nodos Chrome).
Session elegida: NewLiveBlog — IA features omitidas por fallo activo en TESTING.
Resultados: pipeline-logs/completed/E2E-MILESTONE-FASE2.json + pipeline-logs/results-E2E-liveblog-exec-20260414-001.json.
Wiki creada: wiki/core/docker-grid.md — setup grid WSL2, workaround npm→Windows.
Fix aplicado en PIPELINE.md: comando Jest usa `node node_modules/.bin/jest` (no npx — Windows en WSL2).
wiki/index.md: actualizar con docker-grid.md (pendiente).

---

[2026-04-14] fix | Corrección crítica: comandos Jest y Docker en WSL2
Problema: COMMANDS.md, architecture §11.1 y §11.5, y test-engine/PIPELINE.md usaban
`cross-env ... npx jest` y `npm run infra:up` — ambos fallan en WSL2 porque npm/npx
resuelven al binario de Windows (/mnt/c/Program Files/nodejs/) que rechaza rutas UNC.
Solución aplicada en todos los archivos: `node node_modules/.bin/jest` + `docker compose` directo.
CLAUDE.md actualizado con regla explícita anti-npx.
wiki/core/docker-grid.md enriquecida con console errors conocidos de TESTING y features down.
wiki/index.md: referencias rápidas actualizadas con docker-grid y COMMANDS.md.

---

## Regla de mantenimiento

Cuando modifiques cualquier archivo en `src/` o `sessions/`, actualizar la página wiki correspondiente en el mismo commit.
Si no sabés qué página corresponde, buscar en `wiki/index.md` por nombre de archivo o módulo.
Si no existe una página adecuada, crear una y agregar entrada `[gap]` aquí hasta completarla.
