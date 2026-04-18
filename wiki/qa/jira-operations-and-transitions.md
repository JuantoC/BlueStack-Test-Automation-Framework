---
last-updated: 2026-04-17
---

# Operaciones Jira y Transiciones de Estado

> Fuente canónica de las operaciones del pipeline y los IDs de transición de Jira NAA. Consumida por test-reporter y qa-orchestrator en runtime.

---

## Tabla de operaciones

| `operation` | `environment` | `result` | Acción Jira | Transition ID |
|-------------|--------------|----------|-------------|---------------|
| `validate_master` | `master` | `passed` | Comentario ✔ + transicionar a A Versionar | `42` |
| `validate_master` | `master` | `failed` | Comentario ✘ + transicionar a FEEDBACK | `2` |
| `validate_master` | `[cliente]` | `passed` | Comentario ✔ con header de cliente | `42` |
| `validate_master` | `[cliente]` | `failed` | Comentario ✘ con header de cliente | `2` |
| `validate_devsaas` | `dev_saas` | `passed` | Comentario ✔ + transicionar a Done | `31` |
| `validate_devsaas` | `dev_saas` | `failed` | Comentario ✘ + crear tickets por cada ✘ (MODO D) | — |
| `escalation_comment` | cualquiera | — | Postea comentario ADF de escalación, sin transición | — |
| `create_bug` | `dev_saas` | — | Crea un QA Bug ticket desde test fallido | — |

> **Entorno `testing`:** Si `environment == "testing"`, **no llamar a jira-writer**. Registrar `status: "skipped"`, razón `"environment=testing"`. Es el entorno de desarrollo del framework, los resultados son informativos.

---

## IDs de transición NAA

| ID | Estado destino | Cuándo aplicar |
|----|---------------|----------------|
| `42` | A Versionar | Master: todos ✔ + confianza high/medium + cobertura total |
| `2` | FEEDBACK | Master: algún ✘ |
| `31` | Done | Dev_SAAS: todos ✔ |

> IDs verificados en el proyecto NAA. Para el contexto completo de estados y flujo: `.claude/skills/jira-writer/references/transition-ids.md`.

---

## Lógica de determinación de `operation` (TR-2)

La operación se determina en test-reporter antes de llamar a jira-writer:

1. Si `environment == "testing"` → skip, sin operación.
2. Si `environment == "master"` o `"[cliente]"` → `operation: "validate_master"`.
3. Si `environment == "dev_saas"` → `operation: "validate_devsaas"`.
4. Si `escalation_mode: true` en el Execution Context → `operation: "escalation_comment"`.

---

## Regla de transición condicional (TR-4b)

La transición NO es automática — depende de `confidence` y `partial_coverage`:

| Condición | Transición | Notas |
|-----------|-----------|-------|
| Todos ✔ + `confidence: "high"/"medium"` + `all_automatable: true` + `partial_coverage: false` | Aplicar (normal) | — |
| Todos ✔ + `confidence: "low"` | ⛔ NO transicionar | Agregar ⚠️ en comentario |
| Algún ✘ | Aplicar (FEEDBACK o Done según env) | Normal |
| Todos ✔ + `partial_coverage: true` | ⛔ NO transicionar | Agregar ⚠️ en comentario |

Ver lógica completa: [wiki/qa/transition-logic.md](transition-logic.md).

---

## Spec de `create_bug` (dev_saas + failed)

Para cada test con `result: "✘"`:

- **Proyecto:** NAA
- **issuetype:** inferir de `classification.domain`:
  - `"post"`, `"video"`, `"images"` → `"QA Bug Front"`
  - `"auth"` → `"QA Bug Back"`
  - sin domain claro → `"QA Bug Front"` (default)
- **summary:** `"[Auto] <session_name> falló en Dev_SAAS — <ticket_key>"`
- **Linkeo:** `linked_issue: { key: "<ticket_key>", type: "is caused by" }`
- **assignee:** unassigned
- **No crear duplicados:** verificar via jira-reader si ya existe bug linkeado antes de crear.

---

## Referencias

- `.claude/agents/test-reporter.md` — TR-2 (determinación de operation), TR-4b (transición condicional)
- `.claude/skills/jira-writer/references/transition-ids.md` — IDs y estados completos
- [wiki/qa/transition-logic.md](transition-logic.md) — lógica TR-4b en detalle
- [wiki/qa/pipeline-integration-schema.md](pipeline-integration-schema.md) — contrato test-reporter → jira-writer
