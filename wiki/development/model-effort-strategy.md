# Estrategia de Modelo y Effort por Componente

**Alcance:** `.claude/agents/` · `.claude/skills/` · subagents invocados dinámicamente.

Esta página es la **fuente canónica** de cómo se asigna `model:` y `effort:` a cada agent y skill del framework. El plan histórico que la generó vive en `~/.claude/plans/definir-una-estrategia-integral-sequential-clarke.md`; esta página la reemplaza como referencia viva.

---

## Principio rector

**Calidad ≥ baseline.** El objetivo es alinear el modelo y el effort con la complejidad real de cada tarea, **sin degradar la calidad actual en ningún punto**. Cuando hay duda entre dos modelos, elegir el superior — el upgrade siempre es reversible, la pérdida de calidad no.

---

## Marco de decisión

### Modelo según complejidad

| Perfil de tarea | Modelo |
|---|---|
| Lectura/formateo/extracción determinística (JSON parse, MCP CRUD, grep) | `haiku` |
| Generación/análisis guiado por schema cerrado, branches acotadas | `sonnet` |
| Reasoning abierto, meta-diseño, orquestación multi-rama, ambigüedad | `opus` |

### Effort según profundidad de reasoning

| Profundidad | Effort |
|---|---|
| Tarea 1-paso, sin bifurcación | `low` |
| Flujo 2–5 pasos con branches claras | `medium` |
| Múltiples decisiones entrelazadas, síntesis cross-source | `high` |

Reserva: `xhigh` y `max` no se usan en la iteración actual; validar empíricamente antes de subir.

---

## Arquitectura de 3 capas

```
Capa 1 — Frontmatter de agent (.claude/agents/<nombre>.md)
  ↓ hereda si no hay override
Capa 2 — Frontmatter de skill (.claude/skills/<nombre>/SKILL.md)
  ↓ parámetro `model` del tool Agent tiene precedencia
Capa 3 — Invocación dinámica: Agent({ subagent_type, model, prompt })
```

- **Capa 1:** fijar `model` y `effort` siempre.
- **Capa 2:** fijar `model` y `effort` siempre.
- **Capa 3:** pasar `model` cuando la tarea del subagent diverge del perfil del invocador (ej: un skill sonnet lanza un Explore haiku).

---

## Tabla maestra — Agents (`.claude/agents/`)

| Agent | Modelo | Effort | Motivo |
|---|---|---|---|
| **qa-orchestrator** | `opus` | `high` | Routing ORC-2.5 (4 branches), idempotencia, resumption, cascada TA-4.4 |
| **ticket-analyst** | `sonnet` | `high` | 9 pasos (TA-1..TA-9), invalidación + coverage gap + clasificación fuzzy |
| **test-engine** | `haiku` | `low` | Discovery determinístico + exec Jest + parse JSON, sin reasoning |
| **test-generator** | `sonnet` | `medium` | Validación + invocación a `create-session`/`pom-generator` + dry-run |
| **test-reporter** | `sonnet` | `medium` | Construcción ADF + transiciones condicionales (MODO F/G) |

---

## Tabla maestra — Skills (`.claude/skills/`)

### Lectura / consulta

| Skill | Modelo | Effort |
|---|---|---|
| jira-reader | `haiku` | `low` |
| commit-report | `haiku` | `low` |
| sanitize-docs | `sonnet` | `low` |

**Nota sanitize-docs:** sonnet y no haiku — produce JSDoc persistente en código público (regla de no-regresión).

### Escritura determinista

| Skill | Modelo | Effort |
|---|---|---|
| jira-writer | `sonnet` | `medium` |
| smart-commit | `sonnet` | `medium` |
| update-testids | `sonnet` | `medium` |

**Nota jira-writer:** sonnet y no haiku — write-to-production con 7 modos (A–G) y construcción ADF (regla de no-regresión).

### Generación estructurada

| Skill | Modelo | Effort |
|---|---|---|
| create-session | `sonnet` | `medium` |
| pom-generator | `sonnet` | `medium` |
| generate-readme | `haiku` | `low` |

### Auditoría / análisis

| Skill | Modelo | Effort |
|---|---|---|
| agent-auditor | `opus` | `high` |
| audit-logs | `haiku` | `low` |
| wiki-audit | `sonnet` | `high` |

### Diseño / meta

| Skill | Modelo | Effort |
|---|---|---|
| senior-prompt-engineer | `opus` | `high` |
| skill-creator | `opus` | `high` |

### Orquestación / post-ejecución

| Skill | Modelo | Effort |
|---|---|---|
| pipeline-run | `sonnet` | `medium` |
| skill-retrospective | `sonnet` | `medium` |

---

## Subagents dinámicos

Los subagents built-in (Explore, general-purpose) no tienen frontmatter propio — su modelo se controla vía el parámetro `model` del tool `Agent` en el prompt del skill/agent que los invoca.

| Origen | Subagent | Modelo |
|---|---|---|
| `agent-auditor` | 5× Explore de auditoría | `sonnet` |
| `agent-auditor` | Ejecutores Write/Edit de Fase 3 | `haiku` |
| `wiki-audit` | 7× Explore de dimensiones | `sonnet` |
| `wiki-audit` | general-purpose de fix | `sonnet` |
| `update-testids` | Agente A (Jira read) | `haiku` |
| `update-testids` | Agente B (POM read) | `haiku` |
| `update-testids` | Agente C (visión + clasif.) | `sonnet` |
| `update-testids` | Agente D (editar locators) | `sonnet` |
| `update-testids` | Agente E (generar sessions + grid) | `sonnet` |
| `update-testids` | Agente F (KB update) | `haiku` |
| `skill-creator` | Test-case runners paralelos | `sonnet` |
| `skill-creator` | Grader/analyzer/comparator | `opus` |
| `jira-reader` OP-6 | Explore de chunking overflow | `haiku` |

---

## Skills del harness (no alcanzadas por esta estrategia)

`update-config`, `fewer-permission-prompts`, `keybindings-help`, `loop`, `schedule`, `simplify`, `init`, `review`, `security-review`, `claude-api` son consumidas directamente por el usuario y heredan del contexto de sesión. **No llevan `model:` ni `effort:` en frontmatter.**

---

## Protocolo de drift (subir / bajar modelo)

Cuando observes degradación de calidad en un componente:

1. **Subir un nivel** (haiku → sonnet, sonnet → opus) editando el frontmatter correspondiente.
2. Registrar el cambio en `wiki/log.md` con formato `[YYYY-MM-DD] update | model upgrade <componente>: <X> → <Y> — <motivo>`.
3. Re-validar: correr la skill/agent con un caso conocido y comparar contra el baseline previo al downgrade.

Cuando sospeches over-modeling (opus/sonnet donde haiku alcanza):

1. **No bajar directamente.** Primero medir: ¿la latencia extra justifica un cambio? ¿Hay evidencia de que el output de haiku cubre el caso?
2. Si decidís bajar, subir de vuelta al primer síntoma de regresión. La regla de no-regresión pesa más que el ahorro marginal.

---

## No tocar

- `.claude/settings.json` — nunca fijar `CLAUDE_CODE_SUBAGENT_MODEL` global ni otros overrides. La estrategia opera a nivel frontmatter.
- Variables de entorno globales relacionadas a model/effort.
- Skills del harness (sección anterior).

---

## Ver también

- `.claude/rules/doc-organization.md` — dónde vive cada tipo de documento
- `wiki/development/skill-conventions.md` — convenciones generales de skills
- `wiki/log.md` — bitácora de cambios (buscar "model upgrade" / "effort" para historial de drift)
