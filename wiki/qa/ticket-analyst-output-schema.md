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

## Notas de campos clave

- `escalation_report` es `null` salvo que `human_escalation: true`. En ese caso contiene `criteria_attempted[]` y `manual_test_guide[]`.
- `master_validation` se popula solo en flujo Dev_SAAS: el orchestrator lee el Execution Context del run previo de master.
- `human_escalation` en `classification`: si `testable: false` por cualquier razón, setear `human_escalation: true` siempre. Default es `false`.
- `test_hints` vs `test_data_hints`: `test_data_hints` son datos concretos del ticket (prompts, ejemplos); `test_hints` son hints de cobertura por criterio.
- Para routing por `testability_summary.action` y `criterion_scope`, ver `wiki/qa/pipeline-routing.md`.

---
_Schema extraído de `.claude/agents/ticket-analyst.md` §TA-9 — esta página wiki es la fuente canónica._
