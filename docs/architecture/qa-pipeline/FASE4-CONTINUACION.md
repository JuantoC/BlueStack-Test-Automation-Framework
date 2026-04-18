# FASE4-CONTINUACION — Completar Fase 4: qa-orchestrator E2E + poll-jira.ts

> **Cuándo ejecutar:** Cuando el usuario quiera continuar el desarrollo del pipeline QA y terminar la integración de Fase 4.
> **Quién lo ejecuta:** Un agente nuevo, sin contexto previo de sesiones anteriores.
> **Regla de oro:** Los agentes implementados están bien. No modificar `.claude/agents/` salvo para corregir bugs descubiertos en la ejecución.

---

## Estado al iniciar este prompt

**Fases completas:** 0, 1, 2, 2.5, 3  
**Fase activa:** 4 — qa-orchestrator + poll-jira.ts + CronCreate  
**Blocker actual:** E2E completo del orchestrator no ejecutado sobre ticket real.

### Qué está hecho en Fase 4
- Agent `qa-orchestrator.md` implementado y smoke test de idempotencia validado.
- `pipeline-logs/failed-reports.json` creado (estructura base).
- `failed-reports.json` (DLQ) listo.

### Qué falta para cerrar Fase 4

| Ítem | Descripción | Milestone |
|------|-------------|-----------|
| **E2E completo en ticket real** | Ejecutar qa-orchestrator sobre un ticket NAA en `master` de inicio a fin: ticket-analyst → test-engine → test-reporter → Jira actualizado | A |
| **Verificar pipeline multimedia** | Asegurar que `JIRA_API_TOKEN` está cargado y que screenshots suben correctamente cuando hay fallos | A |
| **Agent Execution Record schema** | Definir en `05-contratos-y-persistencia.md` §8.1 el delta entre Execution Context y Agent Execution Record antes de cerrar Milestone A | A |
| **Implementar `poll-jira.ts`** | Crear `.claude/agents/scripts/poll-jira.ts` ejecutable con `tsx` | B |
| **Configurar CronCreate** | Activar sweep automático cada 30 min | B |

---

## Instrucciones de ejecución

### Paso 1 — Leer el estado real antes de empezar

Leer estos archivos (en paralelo):
- `docs/architecture/qa-pipeline/01-vision-y-estado.md` — backlog de Fase 4 y estado de componentes
- `.claude/agents/qa-orchestrator.md` — contrato completo del orchestrator
- `docs/architecture/qa-pipeline/05-contratos-y-persistencia.md` — schema del Execution Context y Agent Execution Record

Objetivo: entender exactamente qué espera el orchestrator como input, qué escribe en cada stage, y cuál es el schema actual de `pipeline-logs/completed/<ticket>.json`.

---

### Paso 2 — Elegir el ticket para el E2E

El usuario debe proveer un ticket NAA en estado `Revisión` (ambiente `master`) que:
- Tenga un módulo con session existente en `test-map.json`
- No haya sido procesado antes por el pipeline (o si fue procesado, usar trigger manual que bypasea `already_reported`)

**Si el usuario no especificó un ticket:** preguntar antes de continuar.

Para verificar si el ticket tiene session mapeada:
1. Leer `.claude/pipelines/test-engine/references/test-map.json`
2. Leer `.claude/pipelines/ticket-analyst/references/component-to-module.json`
3. Confirmar que el `component_jira` del ticket tiene un entry en `component-to-module.json`

---

### Paso 3 — Resolver el gap del Agent Execution Record (pre-Milestone A)

Antes de ejecutar el E2E, leer la sección §8.1 de `05-contratos-y-persistencia.md`.

Si el schema del Agent Execution Record **no define explícitamente** qué campos agrega el orchestrator al mover el Execution Context de `active/` a `completed/`, definirlo ahora. El delta mínimo que el orchestrator debe agregar:

```json
{
  "pipeline_id": "pipe-YYYYMMDD-NNN",
  "ticket_key": "NAA-XXXX",
  "completed_at": "ISO 8601",
  "total_duration_ms": 12345,
  "final_outcome": "passed | failed | escalated | non_automatable | no_sessions | error",
  "stages_completed": ["ticket-analyst", "test-engine", "test-reporter"],
  "error": null
}
```

Si ya está definido con ese nivel de detalle, saltear este paso.

Si necesita actualización: editar `05-contratos-y-persistencia.md` §8.1 con el schema completo antes de continuar.

---

### Paso 4 — Ejecutar el E2E completo (Milestone A)

Invocar el qa-orchestrator usando el Agent tool o directamente desde conversación:

```
Ejecutar el qa-orchestrator para el ticket NAA-XXXX en ambiente master.
```

Durante la ejecución, observar y registrar:

1. ¿El Execution Context se crea correctamente en `pipeline-logs/active/`?
2. ¿ticket-analyst produce el JSON de análisis con `module` correcto?
3. ¿test-engine encuentra la session y ejecuta Jest sin errores de infra?
4. ¿test-reporter postea el comentario ADF en Jira y aplica la transición correcta?
5. ¿El contexto se mueve a `pipeline-logs/completed/` con el Agent Execution Record completo?

**Si algún paso falla:**
- Diagnosticar la causa raíz antes de hacer cualquier cambio
- Si es un bug en un agente: corregir solo la línea específica que falla, sin reescribir el agente
- Si es un problema de infra (grid caído, `.env` incompleto): resolverlo primero
- Documentar el bug y la corrección en `wiki/qa/error-handling-catalog.md`

**Si el test tiene screenshots de fallos:**
- Verificar que `JIRA_API_TOKEN` está cargado en `.env`
- Verificar que JiraAttachmentUploader sube correctamente los archivos PNG/MP4
- Si falla el upload, documentar el error — no bloquear el pipeline completo por esto (Fase 2.5 tiene su propia validación pendiente)

---

### Paso 5 — Verificar idempotencia

Una vez que el E2E pasó exitosamente, ejecutar el orchestrator **una segunda vez** sobre el mismo ticket.

Verificar que:
- El pipeline detecta `idempotency.already_reported: true`
- No se postea un segundo comentario en Jira
- El Execution Context no se sobreescribe (o se sobreescribe correctamente si es trigger manual)

---

### Paso 6 — Implementar `poll-jira.ts` (Milestone B)

Una vez validado el E2E (Milestone A), implementar el script de polling.

**Leer primero:**
- `docs/architecture/qa-pipeline/03-triggers-y-flujos.md` — JQL queries de §4.3 y configuración del polling
- `.claude/agents/qa-orchestrator.md` — formato exacto del trigger event que espera el orchestrator

**El script debe:**

```typescript
// .claude/agents/scripts/poll-jira.ts
// Ejecutar con: tsx .claude/agents/scripts/poll-jira.ts
// Propósito: query Jira → lista de tickets → invocar qa-orchestrator por cada uno con throttling
```

Requisitos mínimos:
1. Ejecutar las JQL queries definidas en §4.3 (tickets en estado `Revisión` y `Done` del proyecto NAA)
2. Para cada ticket encontrado, construir el trigger event normalizado
3. Invocar qa-orchestrator por cada ticket con throttling (esperar resultado antes del siguiente)
4. Si un ticket falla, escribir en `failed-reports.json` y continuar con el siguiente
5. Loguear inicio, cantidad de tickets encontrados, y resultado por ticket
6. El script es idempotente: si el orchestrator detecta `already_reported`, skip silencioso

**Restricciones:**
- Usar `tsx` para ejecutar (no `npx tsx` — ver CLAUDE.md sobre npm/npx en WSL2)
- Imports internos con extensión `.js` (requisito ESM)
- Todo `catch` debe re-lanzar o escribir en DLQ — nunca silenciar errores

---

### Paso 7 — Configurar CronCreate

Una vez que `poll-jira.ts` está implementado y probado manualmente, configurar el CronCreate.

**Documentar en `.claude/agents/qa-orchestrator.md`** (sección dedicada al final del archivo) el comando exacto de CronCreate:

```
CronCreate: cada 30 minutos, ejecutar tsx .claude/agents/scripts/poll-jira.ts
```

El formato de CronCreate y el prompt exacto que debe ejecutar se configura via el tool `CronCreate` de Claude Code. Documentar el prompt de activación en el agente.

---

### Paso 8 — Actualizar documentación post-Fase 4

Al completar ambos milestones:

1. **`docs/architecture/qa-pipeline/09-plan-implementacion.md`:** Marcar Fase 4 como `✅ COMPLETA` con la fecha y milestones alcanzados.

2. **`docs/architecture/qa-pipeline/01-vision-y-estado.md`:**
   - Actualizar estado de `Agent qa-orchestrator` de `⚠️ EN CURSO` a `✅ Implementado + E2E validado`
   - Actualizar estado de `Script poll-jira.ts` de `❌ No iniciado` a `✅ Creado`
   - Cambiar `Próxima fase activa` a: `Fase 5 — test-generator dry_run sobre módulos sin cobertura` (aunque ya está implementado, falta la validación E2E de Fase 5)

3. **`docs/architecture/qa-pipeline/00-meta.md`:** Agregar entrada de changelog con la fecha y los milestones A y B alcanzados.

4. **`wiki/qa/context-resumption.md`:** Si durante el E2E se descubrieron comportamientos de resumption no documentados, actualizar esta página.

---

### Paso 9 — Reportar

Al finalizar, producir un resumen con:

1. **Milestone A:** ¿El E2E funcionó? ¿Qué ticket se usó? ¿Hubo bugs? ¿Se corrigieron?
2. **Multimedia:** ¿`JIRA_API_TOKEN` funcionó? ¿Screenshots subieron?
3. **Milestone B:** ¿`poll-jira.ts` implementado? ¿CronCreate configurado?
4. **Pendientes reales:** Qué quedó sin resolver para Fase 5.
5. **Decisiones abiertas:** Estado de D-11 (ticket-analyst abstracción) y D-12 (schema_version validation) — si quedaron resueltas implícitamente durante la implementación, cerrarlas en `00-meta.md`.

---

## Restricciones

- **No modificar agentes** (`.claude/agents/*.md`) salvo para corregir bugs descubiertos en la ejecución E2E. Cada cambio debe ser puntual y justificado.
- **No implementar Fase 5** en esta sesión — el objetivo es cerrar Fase 4 completamente.
- Si se descubre que el orchestrator tiene una brecha de diseño que bloquea el E2E (no un bug de código sino una decisión arquitectural), escalar al usuario antes de proceder.
- Ante cualquier duda sobre qué ticket usar para el E2E, preguntar al usuario — es mejor elegir bien que tener que limpiar un ticket de producción.
