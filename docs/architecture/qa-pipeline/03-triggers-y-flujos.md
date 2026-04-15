# Triggers y Flujos de Ejecución — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## 4. Sistema de Triggers

### 4.1 Tipos de trigger

| # | Trigger | Origen | Fase | Estado |
|---|---------|--------|------|--------|
| T1 | **Manual prompt** | Usuario en Claude Code | Fase 0 | ✅ Operativo |
| T2 | **Polling sweep manual** | `poll-jira.ts` invocado manualmente | Fase 4 | ❌ Pendiente — script no existe aún |
| T3 | **CronCreate** | Claude Code `CronCreate` tool | Fase 4 | ⚠️ Disponible con limitación (ver nota) |
| T4 | **GitHub Actions schedule** | `.github/workflows/qa-pipeline.yml` | Fase 6 | ❌ Pendiente |
| T5 | **CI hook (PR merge)** | GitHub Actions → workflow en PR merge | Fase 6 | ❌ Pendiente |

> **T2 — poll-jira.ts:** Script pendiente de implementación. Las queries JQL están definidas en §4.3 pero el script `.claude/agents/scripts/poll-jira.ts` no existe. Hasta que se implemente, T2 no está disponible.
>
> **T3 — CronCreate:** Requiere que la sesión de Claude Code esté activa en el momento de ejecución. No es alta disponibilidad — si la sesión se cierra, el cron no dispara. Depende además de que T2 esté implementado (CronCreate invoca poll-jira.ts). Correcto para Fases 4-5; para Fase 6 se migra a GitHub Actions.
>
> **Triggers T4 y T5 requieren GitHub Actions.** Difieren a Fase 6. No dependen de sesión local de Claude Code activa.
>
> **Jira webhooks eliminados del alcance:** Requieren servidor externo con IP pública. No se implementarán hasta que el equipo crezca y haya infraestructura dedicada.

### 4.2 Schema del evento trigger

```json
{
  "event_id": "evt-20260413-001",
  "timestamp": "2026-04-13T14:30:00Z",
  "trigger_type": "manual | polling | cron | ci_hook",
  "event_type": "test_request | status_change | dev_comment | scheduled_sweep",
  "ticket_key": "NAA-4429",
  "metadata": {
    "from_status": "En desarrollo",
    "to_status": "A Versionar",
    "actor": "Paula Rodriguez",
    "requested_env": "master | dev_saas",
    "comment_id": null
  }
}
```

### 4.3 JQL queries del polling

```typescript
// .claude/agents/scripts/poll-jira.ts
const JQL_QUERIES = {
  // Tickets en "Revisión" = QA debe actuar AHORA (primera validación o re-test en Master)
  ready_for_qa_review:   `project = NAA AND status = "Revisión" AND updated >= -2h ORDER BY updated DESC`,
  // Tickets que volvieron a "Revisión" desde "Feedback" = dev corrigió, QA re-valida
  retest_after_feedback: `project = NAA AND status changed to "Revisión" after -2h AND status WAS "Feedback"`,
  // Nuevos QA Bugs abiertos (para priorización, no ejecuta tests automáticamente)
  new_qa_bugs:           `project = NAA AND issuetype in ("QA Bug - Front","QA Bug - Back") AND status = "Abierto" AND created >= -24h`,
  // Sweep Dev_SAAS: todos los tickets "Done" de la versión que acaba de liberarse al entorno pre-prod
  // Trigger: manual — Juanto informa qué versión se liberó al ambiente Dev_SAAS
  devsaas_by_version:    `project = NAA AND status = "Done" AND fixVersion = "{VERSION}" ORDER BY updated DESC`
  // NOTA: "A Versionar" NO es trigger para QA.
  // Ese estado indica que QA YA aprobó el ticket en Master y está esperando que el equipo
  // versione los commits a la rama local de Dev_SAAS. No hay acción QA en ese estado.
};
```

### 4.4 Implementación concreta: T3 con CronCreate

El script `poll-jira.ts` produce los trigger events pero no invoca Claude directamente. El puente es `CronCreate` de Claude Code:

```
CronCreate configuración:
  schedule: "*/30 * * * *"   (cada 30 minutos)
  prompt:   "Correr poll-jira.ts. Para cada ticket encontrado, invocar qa-orchestrator
             con el trigger event correspondiente. Registrar resultados en pipeline-logs/."
```

**Limitaciones de CronCreate para T3:**
- Requiere que la sesión de Claude Code esté activa en el momento de ejecución.
- No es alta disponibilidad — si la sesión se cierra, el cron no dispara.
- Correcto para Fases 4-5 (entorno de desarrollo). Para Fase 6 se migra a GitHub Actions.

---

## 5. Flujos de Ejecución

### 5.1 Flujo Principal — Validación en Master

Trigger: T1 (manual) o T2/T3 cuando un ticket está en estado **"Revisión"**
(el dev envió el ticket a QA para que lo valide en el entorno Master/desarrollo).

```
Trigger
  │
  ▼
qa-orchestrator — inicializa Execution Context (pipeline_id nuevo, campo legacy de v3.0)
  │               verifica idempotencia: ¿already_reported = true en Execution Context?
  │               si SÍ → abortar (ya procesado)
  │
  ├──▶ ticket-analyst
  │       MCP getJiraIssue → ticket completo (incluye comments + campos custom)
  │       Sintetizar criteria[] desde TODO el contenido del ticket
  │       si criteria = [] → testable: false → escalación (pedir más info al equipo)
  │       Clasificar: domain, module, confidence
  │       si confidence = "low" → testable: false → escalación
  │
  ▼
  ¿testable = true? Y ¿confidence ≠ "low"?    [Etapa 1 de routing]
  │              │
 SÍ             NO (testable: false O confidence: "low")
  │              └──▶ ORC-6: escalar — jira-writer add_observation: "Requiere validación manual"
  │                   Escalación = true → Agent Execution Record
  │
  ├──▶ test-engine (mode: discover_and_run, env: master)
  │       Buscar module en test-map.json
  │       Verificar confidence_score ≥ 2 keywords (si fuzzy match)
  │       si sessions_found = false → señalar al Orchestrator
  │
  ▼
  ¿sessions_found?     [Etapa 2 de routing]
  │              │
 SÍ             NO
  │              └──▶ ORC-6: outcome "no_sessions" — escalar (invocar test-generator si Fase 5)
  │
  ├──▶ test-reporter (operation: validate_master)
  │       Construir payload v2.0 para jira-writer
  │       jira-writer: comentario ADF + transición
  │       Guardar last_comment_id en Execution Context
  │
  ▼
DONE — guardar Agent Execution Record en pipeline-logs/completed/
```

### 5.2 Flujo de Re-test (post-FEEDBACK)

Trigger: T1 (manual) o T2/T3 cuando un ticket vuelve a estado **"Revisión"** desde **"Feedback"**
(el dev corrigió los problemas reportados por QA y lo reenvía para re-validación).
El `action_type` en este caso es `retest` — se identifica porque el ticket tiene comentario
master previo de QA en su historial.

```
qa-orchestrator
  ├──▶ ticket-analyst
  │       MCP getJiraIssue + search → extraer test_cases del comentario anterior
  │       Output: classification + test_cases previos
  │
  ├──▶ test-engine (mode: run_existing)
  │       Ejecutar las mismas sessions (sin discovery)
  │
  ├──▶ test-reporter (env: master)
  │       Nuevo comentario en el mismo ticket
  │
  ▼
DONE
```

### 5.3 Flujo Dev_SAAS (pre-liberación)

Trigger: T1 (manual) cuando un lote de tickets está listo para pre-prod.

```
Trigger (metadata: requested_env = "dev_saas", version = "8.6.16.X")
  │
  ▼
qa-orchestrator
  ├──▶ ticket-analyst
  │       MCP getJiraIssue → verificar ticket en "A Versionar"
  │       MCP search → extraer test_cases del comentario Master
  │       (BLOQUEAR si no hay comentario Master previo)
  │
  ├──▶ test-engine (mode: run_existing, env: dev_saas)
  │       TESTING_URL → URL de Dev_SAAS (ver §11.5)
  │       Ejecutar mismas sessions con ambiente diferente
  │
  ├──▶ test-reporter (operation: validate_devsaas, prerelease_version: "8.6.16.X")
  │       jira-writer MODO C: comentario Dev_SAAS con bullets ✔/✘ reales
  │       Si todo ✔: transición Done (31)
  │       Si hay ✘: jira-writer MODO D × cada ✘ → crear ticket + link "Relates"
  │
  ▼
DONE
```

### 5.4 Flujo de Generación de Tests Nuevos (Fase 5 — dry_run obligatorio)

Trigger: test-engine detecta `sessions_found = false` para el módulo.

```
Orchestrator recibe: sessions_found = false para module = "tags"
  │
  ├──▶ test-generator
  │       ¿Existe POM para el módulo? (buscar src/pages/tags_page/)
  │       si NO: invocar pom-generator → src/pages/tags_page/
  │       invocar create-session con test_hints + acceptance_criteria + POM
  │       Session generada → sessions/tags/AutoGenerated_NAA-XXXX.test.ts
  │       Ejecutar en dry_run: Jest corre pero resultados NO van a Jira
  │       Si compila y corre: reportar resultado al Orchestrator
  │       Si errores de setup: escalar a humano
  │
  ├──▶ Orchestrator
  │       Agent Execution Record: auto_generated_tests = true, dry_run = true
  │       Actualizar test-map.json con módulo provisional (marcado como "unvalidated")
  │       Escalar: notificar que hay tests pendientes de revisión manual
  │
  ▼
DONE — Session queda en repo con flag auto_generated. NO postea en Jira.
       Se habilita para el pipeline cuando [validated] aparece en el commit.
```
