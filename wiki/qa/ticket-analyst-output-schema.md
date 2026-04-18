---
last-updated: 2026-04-17
---

# ticket_analyst_output — Schema

> Fuente canónica del output del agente `ticket-analyst`. Se escribe en el Execution Context al completar TA-9.

```json
{
  "pipeline_id": "...",
  "ticket_key": "NAA-XXXX",
  "summary": "...",
  "issue_type": "...",
  "status": "...",
  "priority": "...",
  "component_jira": "...",
  "classification": {
    "domain": "...",
    "module": "...",
    "action_type": "regression_test | retest | new_feature",
    "testable": true,
    "confidence": "high | medium | low",
    "confidence_reason": "...",
    "criteria_source": "extracted | inferred | none",
    "human_escalation": false,
    "attachment_hint": false,
    "test_data_hints": [
      {
        "type": "prompt | input_data | example_content",
        "label": "...",
        "content": "..."
      }
    ],
    "test_hints": []
  },
  "testability_summary": {
    "total_criteria": 0,
    "automatable_count": 0,
    "non_automatable_count": 0,
    "all_automatable": false,
    "partial_automatable": false,
    "human_escalation_needed": false,
    "escalation_reasons": [],
    "action": "full_run | partial_run_and_escalate | generate_tests | escalate_all"
  },
  "acceptance_criteria": [
    {
      "criterion_id": 1,
      "description": "...",
      "test_approach": { "precondition": "...", "action": "...", "assertion": "..." },
      "criterion_type": "...",
      "criterion_scope": "ui | vfs | backend_data | api",
      "automatable": true,
      "reason_if_not": null,
      "requires_screenshot": false,
      "use_specific_test_data": false,
      "coverage": {
        "covered_by_existing_session": false,
        "session_file": "...",
        "gap_description": "..."
      }
    }
  ],
  "master_validation": null,
  "linked_tickets": [],
  "escalation_report": null,
  "jira_metadata": {
    "jiraSummary": "...",
    "ticketType": "...",
    "ticketStatus": "...",
    "assignee": "...",
    "component": "...",
    "sprint": "...",
    "executiveSummary": "...",
    "parentKey": "...",
    "linkedIssues": [],
    "fixVersion": "...",
    "priority": "...",
    "jiraLabels": [],
    "jiraAttachments": []
  }
}
```

## Schema de `jira_metadata.jiraAttachments[]`

Cada adjunto extraído del ticket (TA-2) se registra con este formato:

```json
{
  "filename": "video_demo.webm",
  "mediaType": "video/webm",
  "origin": "comment | ticket"
}
```

| Campo | Descripción |
|-------|-------------|
| `filename` | Nombre del archivo adjunto |
| `mediaType` | MIME type. Si la API retorna `null` o `application/octet-stream`, se infiere desde la extensión. Adjuntos con extensión desconocida se ignoran. |
| `origin` | `"comment"` si está embebido en un comentario; `"ticket"` si viene del campo `attachment` del ticket raíz. `"description"` **no es un origen válido**. |

> Si `mediaType` contiene `video/*` o `audio/*` y `origin: "comment"` → setear `classification.attachment_hint: true`.

---

## Schema de `classification.test_hints[]`

Cada elemento documenta un hint de cobertura por criterio, usado por ORC-4.1 para construir el input a test-generator:

```json
{
  "hint_id": 1,
  "description": "Verificar que el campo X acepta el valor Y",
  "automatable": true,
  "criterion_type": "field_validation | functional_flow | state_transition | error_handling | visual_check | responsive | performance",
  "specific_action": "Descripción de la acción Selenium a ejecutar",
  "specific_assertion": "Descripción de la aserción esperada en DOM/estado",
  "covered_by_existing_session": false,
  "session_file": "sessions/post/NewAIPost.test.ts",
  "gap_description": "La session existente no cubre el escenario de error"
}
```

> `test_hints[]` es un array de hints generados en TA-5. ORC-4.1 extrae solo el campo `description` de cada elemento y los une con ` | ` antes de pasarlos a test-generator.

## Schema de `escalation_report`

Solo se popula cuando `classification.human_escalation: true`. Estructura completa:

```json
{
  "summary": "No fue posible extraer ni inferir criterios automatizables.",
  "visual_attachments_available": false,
  "attachment_files": [],
  "criteria_attempted": [
    "Criterio 1 descartado por: demasiado ambiguo — sin comportamiento observable definido",
    "Criterio 2 descartado por: requiere validación visual en video adjunto"
  ],
  "manual_test_guide": [
    {
      "criterion": "Descripción del comportamiento a verificar",
      "precondition": "Estado inicial necesario del sistema",
      "steps": ["Paso 1 en el CMS", "Paso 2", "Paso 3"],
      "assertion": "Qué observar para dar el criterio por válido",
      "reason_not_automatable": "Razón técnica por la que no puede automatizarse"
    }
  ]
}
```

> Si `attachment_hint: true`, agregar `visual_attachments_available: true` y `attachment_files: [lista]`. Esto indica que hay videos/imágenes adjuntos en comentarios de dev que el QA humano debe revisar.

## Schema de `acceptance_criteria[]` (por ítem)

Cada criterio generado en TA-4 / TA-4b tiene esta estructura:

```json
{
  "criterion_id": 1,
  "description": "Descripción del criterio de aceptación",
  "test_approach": {
    "precondition": "Estado inicial del sistema",
    "action": "Acción a ejecutar",
    "assertion": "Qué verificar (observable en DOM)"
  },
  "criterion_type": "field_validation | functional_flow | state_transition | error_handling | visual_check | responsive | performance",
  "criterion_scope": "ui | vfs | backend_data | api",
  "automatable": true,
  "reason_if_not": null,
  "requires_screenshot": false,
  "use_specific_test_data": false,
  "coverage": {
    "covered_by_existing_session": false,
    "session_file": "sessions/post/NewPost.test.ts",
    "gap_description": "..."
  }
}
```

| Campo | Descripción |
|-------|-------------|
| `criterion_type` | Categoría del criterio. Sub-casos especiales en TA-4b: `visual_check`, `timezone_display_check`, `pom_gap_clipboard`, `ckeditor_plugin_interaction_not_supported`. |
| `criterion_scope` | `"ui"` (default) · `"vfs"` (requiere acceso OpenCms VFS) · `"backend_data"` (verificar DB/job) · `"api"` (validar respuesta REST). `vfs` y `backend_data` fuerzan `automatable: false`. |
| `automatable` | `false` en criterios que requieren percepción humana, acceso al servidor o POM inexistente. Si todos los criterios son `false` → `human_escalation: true`. |
| `requires_screenshot` | Solo relevante para `visual_check`. Sin screenshot capturada, el pipeline no puede afirmar que algo "se ve bien". |
| `use_specific_test_data` | `true` cuando hay `test_data_hints[]` del ticket que deben usarse — tienen precedencia sobre datos de factory. |

---

## Schema de `testability_summary`

Resumen calculado en TA-4b tras evaluar automatizabilidad de todos los criterios:

```json
{
  "total_criteria": 0,
  "automatable_count": 0,
  "non_automatable_count": 0,
  "all_automatable": false,
  "partial_automatable": false,
  "human_escalation_needed": false,
  "escalation_reasons": [],
  "action": "full_run | partial_run_and_escalate | generate_tests | escalate_all"
}
```

| `action` | Condición |
|----------|-----------|
| `full_run` | Todos automatable Y todos con `covered_by_existing_session: true` |
| `generate_tests` | Todos automatable Y ≥1 sin cobertura; o parcial con ≥1 automatable sin cobertura |
| `partial_run_and_escalate` | Algunos automatable, los automatables todos con cobertura existente |
| `escalate_all` | Ningún criterio automatable |

> Para routing completo por `testability_summary.action`, ver `wiki/qa/pipeline-routing.md`.

---

## Schema de `classification.test_data_hints[]`

Datos concretos extraídos de la descripción del ticket en TA-3. Tienen precedencia sobre datos random de factory:

```json
[
  {
    "type": "prompt | input_data | example_content",
    "label": "Descripción breve de qué es",
    "content": "Texto exacto copiado literalmente de la descripción"
  }
]
```

> Obligatorio extraer cuando el criterio es `visual_check`. Recomendado para `functional_flow`.

---

## Notas de campos clave

- `escalation_report` es `null` salvo que `human_escalation: true`. En ese caso contiene `criteria_attempted[]` y `manual_test_guide[]`.
- `master_validation` se popula solo en flujo Dev_SAAS: el orchestrator lee el Execution Context del run previo de master.
- `human_escalation` en `classification`: si `testable: false` por cualquier razón, setear `human_escalation: true` siempre. Default es `false`.
- `test_hints` vs `test_data_hints`: `test_data_hints` son datos concretos del ticket (prompts, ejemplos); `test_hints` son hints de cobertura por criterio.
- Para routing por `testability_summary.action` y `criterion_scope`, ver `wiki/qa/pipeline-routing.md`.

---
_Schema extraído de `.claude/agents/ticket-analyst.md` §TA-9 — esta página wiki es la fuente canónica._
