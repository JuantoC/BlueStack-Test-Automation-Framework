# META: Estado del Documento — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## Qué cambió de v3.0 a v4.0

| # | Cambio | Sección afectada |
|---|--------|-----------------|
| 1 | Pipelines migrados a Custom Agents de Claude Code (`/agents`) | §2.2 |
| 2 | Mecanismo de invocación: de PIPELINE.md interpretado a agentes con frontmatter `tools` + system prompt inline | §1 Restricción de arquitectura |
| 3 | Archivos `.claude/pipelines/*/PIPELINE.md` reemplazados por `.claude/agents/*.md` | §2.2 |

---

## Qué cambió de v2.0 a v3.0

| # | Cambio | Sección afectada |
|---|--------|-----------------|
| 1 | test-generator extraído como pipeline separado | §3.2, §15 Fase 5 |
| 2 | poll-jira.ts gap resuelto con CronCreate explícito | §4.4 |
| 3 | Envelope de mensajes eliminado; pipeline_id en payloads directos | §7.1 |
| 4 | Idempotencia agregada al Execution Context | §7.2 |
| 5 | step_log[] agregado al Agent Execution Record | §8.1 |
| 6 | Sección de Seguridad y Credenciales creada | §9 |
| 7 | Sección de Observabilidad creada | §10 |
| 8 | 11.5 (TESTING_URL Dev_SAAS) y 11.6 (context window budget) agregadas | §11 |
| 9 | Tabla de errores ampliada con 6 casos críticos | §7.3 |
| 10 | Account IDs removidos del Apéndice B → archivo no versionado | §9.3 |
| 11 | SQLite eliminado — JSON files únicamente | §8.2 |
| 12 | confidence_score en fuzzy matching | §6.2 |
| 13 | sync-test-map.ts documentado | §6.4 |
| 14 | Fase 5 agrega dry_run obligatorio antes de postear en Jira | §15 Fase 5 |
| 15 | Fase 6 reducida a GitHub Actions schedule (webhooks eliminados del alcance) | §15 Fase 6 |
| 16 | Métricas ampliadas: token cost, P95, test-map drift | §13 |
| 17 | Flowchart de fases completo | §15 |

---

### Decisiones Abiertas — Resolver antes de la fase indicada

| ID | Decisión | Resolver antes de | Contexto |
|----|----------|-------------------|----------|
| D-11 | ticket-analyst: ¿usar `jira-reader` skill como capa de abstracción o mantener MCP directo? | Fase 5 | Hoy ticket-analyst llama a MCP Atlassian directamente, bypaseando jira-reader. Opciones: A) migrar a Skill(jira-reader) para centralizar cambios de schema; B) documentar MCP directo como decisión definitiva y deprecar la expectativa de abstracción. Ver nota en §3.3 ticket-analyst. |
| D-12 | Validación de schema_version en sub-agentes | Fase 4 | test-engine y test-reporter no validan el campo `schema_version` del Execution Context al arrancar. Si el orchestrator escribe v4.0 y los agentes esperan v3.0, el fallo es silencioso. Decidir si agregar un paso TE-0/TR-0 de validación o confiar en compatibilidad hacia adelante. |

---

### Decisiones Resueltas — DECISION-01

#### DECISION-01 — MODO F en jira-writer ✅ Resuelta 2026-04-14

**Decisión tomada: Opción A — MODO F unificado.**

**Motivación:** Robustez a largo plazo para un pipeline corriendo en GitHub Actions de forma
continua. Un único punto de entrada en jira-writer simplifica el contrato inter-agente,
centraliza la lógica de idempotencia y reduce la superficie de fallo cuando el job se re-ejecuta.

**Implementación:**
- `jira-writer/SKILL.md` ya contenía MODO F como routing layer — se enriqueció con:
  - F1.5: chequeo de idempotencia explícito (re-run safe)
  - F2.1: tabla de entornos incluyendo `testing`
  - F6: escritura de `test_reporter_output` en Execution Context
- `.claude/pipelines/test-reporter/PIPELINE.md` creado (Fase 3 desbloqueada)
- `jira-reader/references/pipeline-schema.md` ya referenciaba MODO F correctamente — sin cambios necesarios

**Fase 3 puede arrancar directamente.**

---

### Decisiones Resueltas en v3.0

| ID | Decisión | Resolución |
|----|----------|-----------|
| D-01 | MODO F en jira-writer | Opción A: MODO F unificado implementado. test-reporter usa un único payload; jira-writer enruta internamente. Ver sección DECISION-01 arriba. |
| D-02 | Trigger automático poll-jira.ts | Usar `CronCreate` de Claude Code para Fases 4-5. GitHub Actions schedule para Fase 6. |
| D-03 | Envelope de mensajes inter-pipeline | Eliminado. `pipeline_id` se agrega como campo en payloads directos existentes. |
| D-04 | Idempotencia de escrituras en Jira | `last_comment_id` en Execution Context. Verificar antes de postear. |
| D-05 | SQLite para histórico | Eliminado. JSON files en `pipeline-logs/` son suficientes para el volumen actual. |
| D-06 | test-generator como pipeline separado | Sí. Extraído de test-engine. Fase 5 es test-generator, no extensión de test-engine. |
| D-07 | Tests auto-generados → postear en Jira directamente | No. Dry_run obligatorio hasta validación manual. |
| D-08 | Account IDs en documento versionado | Mover a `.claude/references/team-accounts.md` (en .gitignore). |
| D-09 | Context window budget | Límite operativo: 80K tokens activos por pipeline run. Ver §11.6. |
| D-10 | Phase 6 scope | Solo GitHub Actions schedule. Jira webhooks fuera de alcance por ahora. |
