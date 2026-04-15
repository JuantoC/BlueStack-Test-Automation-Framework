# Apéndices — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## Apéndice A — Glosario

| Término | Definición |
|---------|-----------|
| Agent | Archivo `.claude/agents/X.md` — agente personalizado de Claude Code con tools restringidas y system prompt de rol |
| Session | Test E2E en `sessions/{domain}/PascalCase.test.ts` — unidad ejecutable del framework |
| Trigger | Evento normalizado que inicia el qa-orchestrator |
| Test hint | Descripción en lenguaje natural de qué debería probarse, inferida del ticket |
| Discovery | Proceso de encontrar sessions existentes que corresponden a un módulo del ticket |
| Escalación | Derivación a humano cuando el pipeline no puede resolver |
| Execution Context | Estado acumulado durante la ejecución del qa-orchestrator (persistido a disco) |
| Module | Agrupación funcional del CMS con sessions asociadas (ej: `ai-post`, `video`) |
| ADF | Atlassian Document Format — formato JSON obligatorio para todo contenido rich text en Jira |
| dry_run | Ejecución del pipeline donde los tests corren pero los resultados NO se postean en Jira |
| confidence | Nivel de certeza del ticket-analyst al clasificar un módulo: high / medium / low |
| validated | Flag en test-map.json: true = session revisada manualmente; false = auto-generada sin review |
| DLQ | Dead Letter Queue — en este sistema: `pipeline-logs/failed-reports.json` |

---

## Apéndice B — Jira Cloud y Transiciones

- **Cloud ID:** `c303d73b-75df-492e-9e64-479b722035cf`
- **Proyecto:** `NAA` (Nuevo Administrador - AGIL)
- **Base URL:** `https://bluestack-cms.atlassian.net`

| transition.id | Destino | Cuándo usarlo en el pipeline |
|---|---|---|
| `2` | FEEDBACK | Validación Master con algún ✘ |
| `31` | Done | Validación Dev_SAAS toda ✔ |
| `42` | A Versionar | Validación Master toda ✔ |

Referencia completa de transiciones: `.claude/skills/jira-reader/references/transitions.md`

> **Account IDs del equipo:** Ver `.claude/references/team-accounts.md` (archivo no versionado en git — ver §9.3).

---

## Apéndice C — Referencias cruzadas de skills

| Paso del pipeline | Skill | Operación | Ubicación |
|---|---|---|---|
| ticket-analyst: contexto del ticket | `jira-reader` | OP-1 `read_ticket` | `.claude/skills/jira-reader/` |
| ticket-analyst: buscar tickets por JQL | `jira-reader` | OP-2 `search_jql` | `.claude/skills/jira-reader/` |
| ticket-analyst: extraer test_cases del Master | `jira-reader` | OP-3 `extract_test_cases` | `.claude/skills/jira-reader/` |
| ticket-analyst: extraer criterios para mapear tests | `jira-reader` | OP-6 `extract_criteria` | `.claude/skills/jira-reader/` |
| test-generator: generar session nueva | `create-session` | — | `.claude/skills/create-session/` |
| test-generator: generar POM faltante | `pom-generator` | — | `.claude/skills/pom-generator/` |
| test-reporter: validar en Master | `jira-writer` | `validate_master` (Modo B) | `.claude/skills/jira-writer/` |
| test-reporter: validar en Dev_SAAS | `jira-writer` | `validate_devsaas` (Modo C→D) | `.claude/skills/jira-writer/` |
| test-reporter: crear bug por fallo | `jira-writer` | `create_bug` (Modo A) | `.claude/skills/jira-writer/` |

### Contratos de integración

- Input/Output de `jira-reader` → `.claude/skills/jira-reader/references/pipeline-schema.md` *(archivo legacy — contiene contratos vigentes)*
- Input/Output de `jira-writer` → `.claude/skills/jira-writer/references/pipeline-schema.md` *(archivo legacy — contiene contratos vigentes)*
- Flujo Dev_SAAS completo → `.claude/skills/jira-writer/references/devsaas-flow.md`

---

## Apéndice D — DECISION-01: MODO F en jira-writer

**Contexto:** `jira-reader/references/pipeline-schema.md` referenciaba "MODO F" como punto de entrada unificado para el pipeline. Actualmente no existe en jira-writer/SKILL.md.

**Estado:** ✅ RESUELTA — Ver sección DECISION-01 en [00-meta.md](00-meta.md).
