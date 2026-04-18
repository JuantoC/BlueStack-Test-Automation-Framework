---
last-updated: 2026-04-17
---

# Lógica de Transición Condicional (TR-4b)

> Determina si test-reporter ejecuta `transitionJiraIssue` después de postear el comentario. Esta decisión es interna de test-reporter — no está en el payload de jira-writer.

---

## Tabla de decisión

| Condición | ¿Transicionar? | Transición | Acción adicional |
|-----------|---------------|-----------|-----------------|
| Todos ✔ + `confidence: "high"/"medium"` + `all_automatable: true` + `partial_coverage: false` | ✅ Sí | `42` (A Versionar) para master / `31` (Done) para dev_saas | Normal |
| Todos ✔ + `confidence: "low"` | ⛔ No | — | Agregar ⚠️ al pie del comentario |
| Algún ✘ | ✅ Sí | `2` (FEEDBACK) para master | Normal |
| Todos ✔ + `partial_coverage: true` | ⛔ No | — | Agregar ⚠️ al pie del comentario |

---

## Cómo resolver los inputs

### `confidence`

```
context.ticket_analyst_output.classification.confidence
```

Valores: `"high"`, `"medium"`, `"low"`. **No incluir en el payload enviado a jira-writer** — es una decisión interna de test-reporter.

### `partial_coverage`

Campo seteado por qa-orchestrator en ORC-2 cuando `testability_summary.partial_automatable: true`. Test-reporter lo lee del Execution Context (no de `ticket_analyst_output` directamente).

### `all_automatable`

```
context.ticket_analyst_output.testability_summary.all_automatable
```

---

## Texto del ⚠️ cuando no se transiciona

```
⚠️ _Clasificación con baja confianza o cobertura parcial — validar manualmente antes de versionar._
```

Se agrega como párrafo ADF al pie del comentario Jira.

---

## Por qué existe esta regla

Un `confidence: "low"` indica que ticket-analyst identificó el módulo con solo 1 keyword de fuzzy match. En ese caso, es posible que las sessions corridas sean de un módulo incorrecto. Pasar el ticket a "A Versionar" con baja confianza generaría falsos positivos.

---

## Referencias

- `.claude/agents/test-reporter.md` — TR-4b
- [wiki/qa/jira-operations-and-transitions.md](jira-operations-and-transitions.md) — tabla de operaciones con IDs
- [wiki/qa/pipeline-routing.md](pipeline-routing.md) — routing por `testability_summary.action`
