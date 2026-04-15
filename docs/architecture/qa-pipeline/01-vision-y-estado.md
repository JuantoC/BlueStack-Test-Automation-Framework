# Visión General y Estado Actual — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## 1. Visión General

El objetivo es construir un agente automatizado de extremo a extremo que conecte dos sistemas actualmente aislados:

- **Pata A — Test Automation Framework:** TypeScript 5 + Selenium WebDriver 4.38 + Jest 29 + Allure 3, arquitectura POM con Facade Pattern. Repositorio existente con 14 tests en `sessions/` y skills de Claude Code operativas. ESM (`"type": "module"`), entorno WSL2, `NODE_OPTIONS='--experimental-vm-modules'` obligatorio.
- **Pata B — Jira (proyecto NAA):** Skills `jira-reader` y `jira-writer` operativas en Claude Code, conectadas vía MCP (`@sooperset/mcp-atlassian`) a `bluestack-cms.atlassian.net`. Toda escritura en formato ADF obligatorio.

El pipeline cierra el ciclo completo: **ticket → interpretación → pruebas → feedback → resolución**.

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  JIRA NAA   │────▶│  qa-orchestrator  │────▶│  Test Framework  │────▶│  JIRA NAA    │
│  (evento)   │     │  (agente Claude)  │     │  sessions/*.ts   │     │  (feedback)  │
└─────────────┘     └──────────────────┘     └──────────────────┘     └──────────────┘
      ▲                                                                       │
      └───────────────────────────────────────────────────────────────────────┘
```

**Restricción de arquitectura:** Todo el pipeline corre dentro de Claude Code. No hay procesos externos autónomos hasta Fase 6. Claude usa el `Bash` tool para ejecutar Jest, los MCP tools de Atlassian para leer/escribir en Jira, y sus tools de filesystem para manipular el repositorio.

**Mecanismo de invocación (v4.0):** Los agentes dejaron de ser PIPELINE.md files interpretados secuencialmente en un solo contexto Claude. Ahora son **Custom Agents** definidos en `.claude/agents/`: `qa-orchestrator.md`, `ticket-analyst.md`, `test-engine.md`, `test-reporter.md`. Cada agente declara su rol en el frontmatter `description`, sus herramientas autorizadas en `tools`, y su lógica como system prompt inline.

**Advertencia (experimental):** Esta arquitectura — pipelines complejos corriendo íntegramente en Claude Code CLI — no tiene casos documentados en producción a Abril 2026. Es el approach correcto para un equipo de 1 persona con entorno WSL2. Para Fase 6+, parte de la arquitectura migrará a GitHub Actions.

---

## 2. Estado Actual del Sistema

### 2.1 Piezas existentes y listas

| Pieza | Ubicación | Estado |
|-------|-----------|--------|
| `jira-reader` | `.claude/skills/jira-reader/` | ✅ Operativo |
| `jira-writer` | `.claude/skills/jira-writer/` | ✅ Operativo |
| `create-session` | `.claude/skills/create-session/` | ✅ Operativo |
| `pom-generator` | `.claude/skills/pom-generator/` | ✅ Operativo |
| 14 tests en `sessions/` | `sessions/{auth,post,video,images,cross,stress,debug}/` | ✅ Ejecutables |
| MCP Atlassian | `.mcp.json` | ✅ Configurado |

### 2.2 Estado de implementación por fase

| Pieza | Ubicación | Fase | Estado (2026-04-14) |
|-------|-----------|------|---------------------|
| `test-map.json` | `.claude/pipelines/test-engine/references/` | 0 | ✅ Creado |
| `component-to-module.json` | `.claude/pipelines/ticket-analyst/references/` | 0 | ✅ Creado |
| `sync-test-map.ts` | `scripts/` | 0 | ✅ Creado |
| `pipeline-logs/` estructura | `pipeline-logs/` | 0 | ✅ Creado |
| Agent `ticket-analyst` | `.claude/agents/ticket-analyst.md` | 1 | ✅ Implementado + validado (NAA-4429, NAA-3964, NAA-4120) |
| Agent `test-engine` | `.claude/agents/test-engine.md` | 2 | ✅ Implementado + milestone E2E validado (NewLiveBlog 2026-04-14) |
| Agent `test-reporter` | `.claude/agents/test-reporter.md` | 3 | ✅ Implementado + E2E validado (NAA-4467, comentario ADF id 39678 + transición FEEDBACK, 2026-04-14) |
| Agent `qa-orchestrator` | `.claude/agents/qa-orchestrator.md` | 4 | ⚠️ EN CURSO — Agente creado + smoke test idempotencia validado. E2E completo en ticket `master` real pendiente. |
| Script `poll-jira.ts` | `.claude/agents/scripts/` | 4 | ❌ No iniciado |
| `failed-reports.json` | `pipeline-logs/` | 4 | ✅ Creado (estructura base) |
| Agent `test-generator` | `.claude/agents/test-generator.md` | 5 | ❌ No iniciado |

**Próxima fase activa:** Fase 4 — completar E2E del orchestrator + `poll-jira.ts`.

### Backlog Fase 4

| Prioridad | Ítem | Fase | Descripción | Bloqueante para |
|-----------|------|------|-------------|-----------------|
| 🔴 Alta | E2E completo del orchestrator | 4 | Ejecutar qa-orchestrator sobre un ticket NAA real en `master`. Verificar: comentario ADF posteado via jira-writer, transición de estado, Execution Context movido a `completed/`. El smoke test de idempotencia validado no cubre este flujo. | Habilitar CronCreate (T3) |
| 🔴 Alta | Implementar `poll-jira.ts` | 4 | Crear `.claude/agents/scripts/poll-jira.ts`. JQL queries ya definidas en §4.3. Función: query → lista de ticket keys → invocar orchestrator con throttling. Sin este script, T2 y T3 son teóricos. | T2, T3 |
| ✅ Resuelto | Mapear customfield IDs de campos custom | 4 pre-cond. | Descubiertos 2026-04-15 via `GET /rest/api/3/field`. Dos grupos: A (10036-10041 legacy) y B (10066-10071 NAA activo). Actualizados `ticket-analyst.md` + `classification-rules.md` + `COMMANDS.md`. | — |
| 🟡 Media | Resolver D-11 (ticket-analyst abstracción) | 4→5 | Decidir si ticket-analyst migra a `Skill(jira-reader)` o se documenta MCP directo como definitivo. Ver `00-meta.md` DECISION D-11. | Fase 5 |
| 🟡 Media | Resolver D-12 (schema_version validation) | 4 | Agregar paso TE-0/TR-0 de validación de `schema_version` o documentar decisión de no validar. Ver `00-meta.md` DECISION D-12. | Fase 5 |
| 🟢 Baja | Validación E2E adicional de ticket-analyst | 1 post | Correr ticket-analyst sobre 7+ tickets adicionales para completar el target de 10+ tickets validados definido en Fase 1 (actual: 3/10). Módulos prioritarios: Post, Video, Images. | Confianza de clasificación |

---

### Deuda de cobertura de tests (`sessions/`)

Directorios existentes en `src/pages/` sin ningún test en `sessions/`. No bloquean ninguna fase del pipeline — son backlog de automatización de UI independiente.

| Directorio | Estado | Nota |
|---|---|---|
| `comment_page/` | ❌ Sin archivos `.ts` | Crear POM + session cuando el módulo CMS esté desarrollado |
| `user_profile_page/` | ❌ Sin archivos `.ts` | Crear POM + session cuando el módulo CMS esté desarrollado |
| `video_editor_page/EditorInfoSection.ts` | ⚠️ Archivo vacío (1 línea) | Completar sub-componente + agregar cobertura |
| `video_editor_page/EditorCategorySection.ts` | ⚠️ Archivo vacío (1 línea) | Completar sub-componente + agregar cobertura |
| `video_editor_page/EditorImageSection.ts` | ⚠️ Archivo vacío (1 línea) | Completar sub-componente + agregar cobertura |
| `video_editor_page/EditorRelatesSection.ts` | ⚠️ Archivo vacío (1 línea) | Completar sub-componente + agregar cobertura |

> **Nota:** `.claude/pipelines/` se mantiene como referencia histórica (v3.0). Sus `references/` internas (p.ej. `test-map.json`, `component-to-module.json`) siguen siendo archivos activos consumidos por los agentes.

### 2.3 Skills existentes que el pipeline reutiliza

- **Generación de tests nuevos** → `create-session` (skill existente, invocada por test-generator)
- **Generación de Page Objects nuevos** → `pom-generator` (skill existente, invocada por test-generator)
- **Lectura de tickets Jira** → `jira-reader` (skill existente, disponible para uso humano directo; ticket-analyst llama MCP Atlassian directamente)
- **Escritura en Jira** → `jira-writer` (skill existente, invocada por test-reporter)
