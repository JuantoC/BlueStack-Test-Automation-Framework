# Arquitectura de Agentes — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## 3. Arquitectura de Agentes

### 3.1 Principio de diseño

Cada agente tiene **una responsabilidad única**, un **contrato de entrada/salida** definido, y **no conoce la implementación interna de los otros agentes**. Se comunican por mensajes estructurados en JSON con `pipeline_id` como campo de trazabilidad. Todos los agentes viven en `.claude/agents/` porque son invocados exclusivamente por otros agentes o por el orchestrator — nunca directamente por el usuario en conversación.

### 3.2 Mapa de agentes (5 agentes)

```
                    ┌──────────────────────────────┐
                    │        qa-orchestrator        │
                    │  Coordina el flujo, decide    │
                    │  qué sub-agentes invocar      │
                    │  y en qué orden               │
                    └──────────┬────────────────────┘
                               │
            ┌──────────────────┼──────────────────────┬────────────────────┐
            │                  │                      │                    │
            ▼                  ▼                      ▼                    ▼
   ┌─────────────────┐ ┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐
   │  ticket-analyst │ │  test-engine │  │  test-reporter   │  │  test-generator │
   │                 │ │              │  │                  │  │                 │
   │  Lee ticket,    │ │  Descubre    │  │  Escribe Jira:   │  │  Crea sessions  │
   │  clasifica,     │ │  y ejecuta   │  │  comentario,     │  │  y POMs nuevos  │
   │  extrae hints   │ │  sessions    │  │  transición,     │  │  cuando no hay  │
   │                 │ │  existentes  │  │  bugs nuevos     │  │  cobertura      │
   └────────┬────────┘ └──────┬───────┘  └────────┬─────────┘  └────────┬────────┘
            │                 │                   │                     │
            ▼                 ▼                   ▼                     ▼
   ┌─────────────┐    ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐
   │ jira-reader │    │  sessions/*.ts   │  │  jira-writer    │  │ create-session   │
   │ (skill MCP) │    │  Jest + Selenium │  │  (skill MCP+ADF)│  │ pom-generator    │
   └─────────────┘    └──────────────────┘  └─────────────────┘  └──────────────────┘
```

> **test-engine** opera solo en modo `discover_and_run` y `run_existing`. No genera tests.  
> **test-generator** es el agente responsable de `generate_and_run`. Se invoca desde qa-orchestrator cuando test-engine no encuentra sessions para el módulo.

### 3.3 Mapa de agentes

---

#### qa-orchestrator (agente principal)

**Responsabilidad:** Recibir el trigger, decidir el flujo, invocar sub-agentes en secuencia, manejar errores, decidir escalaciones, registrar el Agent Execution Record.

**No hace:** No lee tickets directamente, no ejecuta tests, no escribe en Jira. Solo coordina.

**Input:** Trigger event normalizado (ver §4.2).  
**Output:** Agent Execution Record final (ver §8.1).

**Decisiones que toma:**
- ¿El trigger corresponde a ticket específico, polling sweep, o CI hook?
- ¿Qué tipo de flujo aplica? (§5)
- ¿El módulo tiene sessions → test-engine, o no → test-generator primero?
- ORC-2.5 — Routing granular por `testability_summary.action`: `"full_run"` → ORC-3 (test-engine); `"generate_tests"` → ORC-4.1 (test-generator); `"partial_run_and_escalate"` → ORC-3 luego ORC-6; `"escalate_all"` → ORC-6.
- ¿El resultado del test-engine requiere feedback positivo o negativo?
- ¿Hay que crear tickets nuevos por fallos en Dev_SAAS?
- ¿Se debe escalar a humano?
- ¿Ya existe un comentario de esta ejecución en Jira? (idempotencia — ver §7.2)

---

#### ticket-analyst (sub-agente de análisis)

**Responsabilidad:** Dado un ticket key, leer todo su contenido y producir un análisis estructurado.

**Usa:** Llama directamente a MCP Atlassian — tools: `getJiraIssue`, `search`, `searchJiraIssuesUsingJql`, `atlassianUserInfo`, `getAccessibleAtlassianResources`.

> **Nota:** La skill `jira-reader` sigue vigente para uso humano directo; `ticket-analyst` no la invoca. El diagrama de §3.2 muestra `jira-reader` como simplificación conceptual, pero el contrato técnico real es MCP directo.

**Input:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "action": "analyze_ticket",
  "ticket_key": "NAA-XXXX"
}
```

**Output:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "ticket_key": "NAA-4429",
  "summary": "CREACION NOTA IA - No respeta el prompt inyectado",
  "issue_type": "QA Bug - Front",
  "status": "En desarrollo",
  "priority": "Medium",
  "component_jira": "AI",
  "classification": {
    "domain": "post",
    "module": "ai-post",
    "action_type": "regression_test",
    "testable": true,
    "confidence": "high | medium | low",
    "test_hints": [
      {
        "hint_id": 1,
        "description": "Verificar que el prompt enviado se refleja en la nota generada",
        "automatable": true,
        "specific_action": "Ingresar prompt en el campo correspondiente y confirmar generación",
        "specific_assertion": "El contenido generado contiene el texto del prompt",
        "covered_by_existing_session": false
      }
    ]
  },
  "acceptance_criteria": [
    {
      "criterion_id": 1,
      "description": "La nota generada contiene el tema del prompt",
      "test_approach": { "precondition": "...", "action": "...", "assertion": "..." },
      "criterion_type": "functional_flow",
      "automatable": true,
      "reason_if_not": null
    }
  ],
  "testability_summary": {
    "total_criteria": 2,
    "automatable_count": 2,
    "non_automatable_count": 0,
    "all_automatable": true,
    "partial_automatable": false,
    "human_escalation_needed": false,
    "escalation_reasons": [],
    "action": "full_run"
  },
  "linked_tickets": ["NAA-4400"],
  "jira_metadata": {
    "jiraSummary":      "CREACION NOTA IA - No respeta el prompt inyectado",
    "ticketType":       "QA Bug - Front",
    "ticketStatus":     "En desarrollo",
    "assignee":         "Paula Rodriguez",
    "component":        "AI",
    "sprint":           "NUEVA FUNCIONALIDAD / MODULOS, 22/12/2025-31/12/2025",
    "executiveSummary": "...",
    "parentKey":        "NAA-1977",
    "linkedIssues":     ["NAA-4400"],
    "fixVersion":       "8.6.16.X",
    "priority":         "Medium",
    "jiraLabels":       [],
    "jiraAttachments":  []
  }
}
```

> `jira_metadata` sigue el contrato exacto de `TestMetadata` (`src/core/wrappers/testWrapper.ts`).  
> Se propaga sin transformación hasta `runSession()` para poblar Allure.  
> `classification.confidence` indica certeza del matching: "high" = component_jira match directo; "medium" = keyword intersection ≥2; "low" = 1 keyword o inferencia.

**Lógica interna:**
1. Leer ticket completo vía MCP Atlassian directo (`getJiraIssue`) — siempre incluir `comment` y campos custom
   (Componente, Resumen Ejecutivo, Sprint, deploy, cambios SQL, cambios VFS).
2. Sintetizar `criteria[]` desde TODO el contenido del ticket (en orden de precedencia):
   - Sección "Criterios de aceptación" en descripción → `source: "extracted"`
   - Sección "Casos de prueba" en descripción → `source: "extracted"`
   - Comentarios de devs/QA con comportamiento descrito → `source: "inferred"`
   - Campos custom: deploy (cambios desplegados), cambios SQL (impacto BD), cambios VFS → `source: "inferred"`
   - Título + Resumen Ejecutivo → `source: "inferred"`
   - Si ninguna fuente produce ≥ 1 criterio accionable → `criteria: []`, `source: "none"`,
     `testable: false`, `human_escalation: true`, pedir al equipo descripción del flujo a probar.
3. TA-3b: Si el ticket tiene `linkedIssues[]` con tipo "Relates", "is parent of" o "is blocked by", leer tickets relacionados para enriquecer el contexto del análisis.
4. TA-3c: Si se detecta una URL de validación externa en descripción o comentarios, acceder a ella con credenciales `basic_auth_user`/`basic_auth_pass` del trigger context.
5. Si `requested_env = "dev_saas"` en el trigger: extraer `test_cases` del comentario master
   previo vía MCP Atlassian directo (`search` o `searchJiraIssuesUsingJql`) — re-test del mismo set validado en Master.
6. Clasificar `domain` y `module`: primero por `component_jira` exacto (§6.3), luego por keywords (§6.2).
7. Determinar `testable`: QA Bug Front/Back con `criteria[]` ≥ 1 → `true`;
   tickets de diseño/UX sin criterios inferibles → `false`.
8. Determinar `action_type` según estado del ticket: ver §classification-rules (archivo de referencia).
9. Construir `test_hints` desde `criteria[]`. Para bugs: **principio de derivación** — el test reproduce la condición del bug y aserta que el fix la corrige.
10. Determinar `confidence` y `confidence_reason`; si `confidence = "low"` → `testable: false` + escalación.
11. Realizar **coverage gap analysis**: para cada criterio automatable, determinar si existe una session existente que lo cubra (campo `covered_by_existing_session` en cada `TestHint`). Ver modelo de capacidades en `.claude/pipelines/ticket-analyst/references/agent-capabilities.md`.
12. Construir `testability_summary` con conteos y campo `action` que el Orchestrator usa para routing granular.

---

#### test-engine (sub-agente de ejecución — solo discovery y runner)

**Responsabilidad:** Dado el output del ticket-analyst, encontrar sessions existentes, ejecutarlas y devolver resultados estructurados. **No genera tests nuevos.**

**Usa:** Filesystem del repositorio, Bash tool para ejecutar Jest, `test-map.json`.

**Input:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "action": "run_tests",
  "ticket_key": "NAA-4429",
  "classification": {
    "domain": "post",
    "module": "ai-post",
    "action_type": "regression_test"
  },
  "test_hints": ["Verificar que el prompt enviado se refleja en la nota generada"],
  "acceptance_criteria": ["La nota generada contiene el tema del prompt"],
  "mode": "discover_and_run | run_existing",
  "jira_metadata": { }
}
```

**Output (schema unificado v2 — compatible GitHub Actions + test-reporter TR-3):**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "ticket_key": "NAA-4429",
  "execution_id": "exec-20260413-001",
  "executed_at": "2026-04-14T11:39:34.000-03:00",
  "mode_used": "discover_and_run",
  "environment": "master | dev_saas | testing",
  "grid": true,
  "headless": true,
  "sessions_found": true,
  "result": "passed | failed | error",
  "total_tests": 1,
  "passed": 1,
  "failed": 0,
  "results": [
    {
      "session_file": "sessions/post/NewAIPost.test.ts",
      "session_name": "NewAIPost",
      "status": "pass | fail | error",
      "duration_ms": 42000,
      "failure_messages": [],
      "mapped_to_hint": "Verificar que el prompt enviado se refleja en la nota generada"
    }
  ],
  "failure_summary": null,
  "console_errors_detected": [],
  "jest_output_path": "pipeline-logs/results-NAA-4429-exec-001.json",
  "screenshots": []
}
```

> `screenshots[]` — capturas de pantalla generadas por Allure en fallos Jest (ver [11-multimedia-attachments.md](11-multimedia-attachments.md))

> Cuando `sessions_found = false`, el orchestrator invoca `test-generator` (no test-engine).

**Dos modos de operación:**

| Modo | Cuándo | Qué hace |
|------|--------|----------|
| `discover_and_run` | Default. | Busca en `test-map.json` por module, verifica paths en disco, ejecuta. |
| `run_existing` | Re-test (Orchestrator ya sabe qué sessions correr). | Ejecuta sin discovery. |

**Comando de ejecución Jest:**

Para `environment: "master"`:
```bash
NODE_OPTIONS='--experimental-vm-modules' TARGET_ENV=master USE_GRID=true IS_HEADLESS=true node node_modules/.bin/jest NewAIPost --json --outputFile=pipeline-logs/results-NAA-4429-exec-001.json
```

Para `environment: "dev_saas"`: usar `TARGET_ENV=testing` (no `TARGET_ENV=master`).

> *Campo adicional en el input: `role` (string, opcional, default `"editor"`) — valores: `"editor" | "admin" | "basic"`. Cuando `role !== 'editor'`, el comando Jest incluye `TEST_ROLE={role}` como variable de entorno. La anotación `@default-role` en el .test.ts puede ser sobreescrita por el campo `role` del input.*

---

#### test-reporter (sub-agente de feedback)

**Responsabilidad:** Recibir resultados del test-engine y traducirlos a acciones Jira: comentario de validación, transición de estado, tickets nuevos por fallos en Dev_SAAS.

**Usa:** `jira-writer` vía Skill tool en **MODO F**. El skill `jira-writer` rutea internamente a los modos B/C/D/A según el caso. Todo contenido en formato ADF.

**Input (agente → jira-writer) — schema v2.0:**  
Ver `.claude/skills/jira-writer/references/pipeline-schema.md` para el schema completo.

> Si `test_engine_output.screenshots[]` no está vacío, incluir `attachments[]` en el payload (schema v3.1). Ver [11-multimedia-attachments.md](11-multimedia-attachments.md)

**Mapeo resultado → acciones Jira:**

| Resultado | `operation` → jira-writer | Transición | Tickets nuevos |
|-----------|---------------------------|------------|----------------|
> Fase F2.5 — Si el payload incluye `attachments[]`, ejecutar upload a Jira REST API antes de postear el comentario ADF. Ver [11-multimedia-attachments.md](11-multimedia-attachments.md)

| Todos ✔, env=master | `validate_master` | `42` → A Versionar | — |
| Algún ✘, env=master | `validate_master` | `2` → FEEDBACK | — |
| Todos ✔, env=dev_saas | `validate_devsaas` | `31` → Done | — |
| Algún ✘, env=dev_saas | `validate_devsaas` | Sin transición | 1 ticket por cada ✘ |

---

#### test-generator (sub-agente de generación)

**Responsabilidad:** Cuando no hay sessions para un módulo, generarlas usando `create-session` y `pom-generator`. **Modo dry_run obligatorio en primera ejecución** — no postea en Jira hasta validación humana.

> *Nota: test-generator implementado y operativo a 2026-04-17. Ver `.claude/agents/test-generator.md` (TG-1 a TG-6).*

**Usa:** `create-session`, `pom-generator`, filesystem del repositorio.

**Input:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "action": "generate_tests",
  "ticket_key": "NAA-XXXX",
  "module": "tags",
  "test_hints": ["Crear un tag nuevo", "Verificar que aparece en la lista"],
  "acceptance_criteria": ["El tag creado aparece en la grilla"],
  "jira_metadata": { }
}
```

**Output:**
```json
{
  "pipeline_id": "pipe-20260413-001",
  "generated_session": "sessions/tags/AutoGenerated_NAA-XXXX.test.ts",
  "generated_pom": "src/pages/tags_page/",
  "compiles": true,
  "dry_run": true,
  "dry_run_results": {
    "total": 1, "passed": 1, "failed": 0
  },
  "ready_for_pipeline": false,
  "validation_required": "Test auto-generado. Revisar manualmente antes de habilitar en pipeline."
}
```

**Regla de habilitación:** Un test generado por este agente entra en `test-map.json` (y por ende puede ser ejecutado por test-engine) **solo después** de que sea commiteado con `[validated]` en el mensaje de commit. El Orchestrator verifica esta condición antes de invocar test-engine sobre módulos generados.
