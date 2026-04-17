---
last-updated: 2026-04-17
---

# Pipeline Routing — criterion_scope y testability_summary.action

Lookup rápido para resolver el routing del pipeline QA sin tener que leer los agentes completos.

---

## criterion_scope

Campo de cada `acceptance_criteria[]`. Define en qué capa se verifica el criterio.

| Valor | Qué verifica | Implicación para el pipeline |
|-------|--------------|------------------------------|
| `"ui"` (default) | Comportamiento visible en navegador | Automatizable con Selenium si hay POM |
| `"vfs"` | Propiedad persistida en el VFS de OpenCms | Fuerza `automatable: false` — `reason_if_not: "backend_data_validation"` |
| `"backend_data"` | Dato persistido en DB/backend por un job | Fuerza `automatable: false` — `reason_if_not: "backend_data_validation"` |
| `"api"` | Respuesta de API directa (sin navegar el CMS) | Fuerza `automatable: false` — `reason_if_not: "backend_data_validation"` |

**Inferencia automática (TA-4.2):**
- `customfield_10040` o `customfield_10069` (Cambios VFS) con valor → `criterion_scope: "vfs"`
- `customfield_10036` o `customfield_10066` (Cambios SQL) con valor → `criterion_scope: "backend_data"`
- Si ambos presentes → `"vfs"` tiene precedencia
- **Guarda:** si el criterio menciona palabras UI explícitas (pantalla, botón, modal, click, formulario, DOM, navegador, elemento, visible) → mantener `"ui"` aunque el customfield esté populado

---

## testability_summary

Objeto de primer nivel en `ticket_analyst_output`. Resume la automatizabilidad del ticket.

```json
{
  "total_criteria": 3,
  "automatable_count": 2,
  "non_automatable_count": 1,
  "all_automatable": false,
  "partial_automatable": true,
  "human_escalation_needed": false,
  "escalation_reasons": ["..."],
  "action": "partial_run_and_escalate"
}
```

### testability_summary.action — valores posibles

Calculado en TA-7b. Determina qué paso del pipeline activa ORC-2.5.

| Condición | action |
|-----------|--------|
| Todos automatable + todos con `covered_by_existing_session: true` | `"full_run"` |
| Todos automatable + ≥1 con `covered_by_existing_session: false` | `"generate_tests"` |
| Algunos automatable + automatables todos con `covered_by_existing_session: true` | `"partial_run_and_escalate"` |
| Algunos automatable + ≥1 automatable con `covered_by_existing_session: false` | `"generate_tests"` |
| Ninguno automatable | `"escalate_all"` |

---

## Tabla de routing (ORC-2.5)

| testability_summary.action | Siguiente paso | Qué ocurre |
|---------------------------|----------------|------------|
| `"full_run"` | ORC-3 (test-engine) | Ejecuta sessions existentes del módulo |
| `"generate_tests"` | ORC-4.1 directo (test-generator) | Genera un test nuevo; saltea test-engine hasta que el nuevo test pase dry-run |
| `"partial_run_and_escalate"` | ORC-3 (test-engine), luego ORC-6 con `escalation_mode: true` | Ejecuta lo que hay; postea resultados + bloque ⚠️ con criterios no automatizables |
| `"escalate_all"` | ORC-6 con `outcome: "non_automatable"` | Sin ejecución; escalación inmediata a humano |
| `null` o ausente | ORC-3 (legacy fallback) | Comportamiento pre-TA-7b; no interrumpir |

> **Nota:** `"generate_tests"` saltea test-engine porque ejecutar sessions del módulo sin cobertura de los criterios del ticket produciría resultados irrelevantes para el ticket.

---

## Casos especiales

### testable: false — cuándo el pipeline aborta antes de ORC-2.5

Si ticket-analyst produce `testable: false`, el orchestrator no llega a ORC-2.5:

| Razón | outcome | Destino |
|-------|---------|---------|
| `criteria_source: "none"` (sin criterios extraíbles) | `"human_escalation"` | ORC-6 directo |
| Todos los criterios `automatable: false` (y `criteria_source != "none"`) | `"non_automatable"` | ORC-6 directo |
| `confidence: "low"` (1 sola keyword en fuzzy match) | depende de sessions_found | ORC-6 directo |

### partial_automatable: true — ejecución parcial

Cuando `partial_automatable: true` y `action: "partial_run_and_escalate"`:
- test-reporter NO aplica transición de estado en Jira
- El comentario incluye bloque ⚠️ con los criterios no automatizables y su `manual_test_guide[]`
- Se notifica al humano en el chat qué criterios quedan pendientes de validación manual

### generate_tests → dry-run falla

Si test-generator produce `dry_run_result: "fail"` o `"infra_error"`:
- outcome: `"auto_generated_dry_run_failed"`
- ORC-6 invoca test-reporter en modo escalación para notificar en Jira
- El test generado queda en `sessions/` pero requiere revisión manual antes de ejecutarse

---

## Ver también

- `.claude/agents/ticket-analyst.md` — TA-4b (automatizabilidad) y TA-7b (cálculo de `testability_summary.action`)
- `.claude/agents/qa-orchestrator.md` — ORC-2.5 (routing) y ORC-6 (escalación)
- [wiki/qa/comment-invalidation.md](comment-invalidation.md) — TA-4.4: cómo los comentarios invalidan criterios antes del routing
- [wiki/qa/visual-validation.md](visual-validation.md) — Doctrina de `visual_check` y `requires_screenshot`
- [wiki/qa/manual-test-validation.md](manual-test-validation.md) — Habilitar tests auto-generados tras revisión humana
- [wiki/qa/environments.md](environments.md) — Mapping ambiente ↔ Jira ↔ TARGET_ENV
