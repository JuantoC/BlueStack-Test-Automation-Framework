# Plan de Implementación — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## 15. PLAN DE IMPLEMENTACIÓN — FASES

### Flowchart

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    QA PIPELINE — FLOWCHART DE IMPLEMENTACIÓN                    ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  PIEZAS EXISTENTES (no tocar)                                                    ║
║  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ ┌──────────────────┐    ║
║  │ jira-reader ✅│ │ jira-writer ✅│ │ create-session ✅│ │ pom-generator ✅ │    ║
║  └──────────────┘ └──────────────┘ └─────────────────┘ └──────────────────┘    ║
║        │                │                 │                      │              ║
║        └────────────────┴─────────────────┴──────────────────────┘              ║
║                                       │                                          ║
║                                       ▼                                          ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║  FASE 0 — Prerequisitos ✅ COMPLETA                               sin deps       ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ test-map.json · component-to-module.json · pipeline-logs/ · .gitignore  │   ║
║  │ sync-test-map.ts · team-accounts.md (no-git) · verificar skills E2E     │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 1 — ticket-analyst ✅ COMPLETA  deps: Fase 0 + jira-reader                 ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ Agent ticket-analyst (.claude/agents/ticket-analyst.md)                  │   ║
║  │ Validado sobre NAA-4429, NAA-3964, NAA-4120                              │   ║
║  │ Milestone: ✅ JSON de análisis correcto en tickets reales                │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 2 — test-engine ✅ COMPLETA     deps: Fase 1 + test-map.json               ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ Agent test-engine (.claude/agents/test-engine.md)                        │   ║
║  │ Milestone: ✅ E2E validado 2026-04-14 (NewLiveBlog, 317s, grid on)      │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 3 — test-reporter ✅ COMPLETA    deps: Fase 2 + jira-writer                 ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ DECISION-01 resuelta ✅ · Agent test-reporter implementado ✅             │   ║
║  │ Milestone: ✅ E2E validado 2026-04-14 (NAA-4467, comentario ADF id       │   ║
║  │ 39678 + transición FEEDBACK aplicada)                                    │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 4 — qa-orchestrator + CronCreate  ⚠️ EN CURSO  deps: Fases 1-3            ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ Agent qa-orchestrator (.claude/agents/qa-orchestrator.md)                │   ║
║  │ poll-jira.ts · CronCreate configurado (cada 30 min)                      │   ║
║  │ failed-reports.json (DLQ)                                                │   ║
║  │ Milestone A: pipeline E2E con trigger manual → Jira actualizado          │   ║
║  │ Milestone B: CronCreate ejecuta sweep automático                         │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 5 — test-generator              deps: Fase 4 + create-session + pom-gen   ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ Agent test-generator (.claude/agents/test-generator.md)                  │   ║
║  │ ⚠️ dry_run obligatorio: tests auto-generados NO postean en Jira          │   ║
║  │ Validación manual requerida antes de habilitar en test-map.json          │   ║
║  │ Milestone: 3 módulos sin cobertura generan tests que compilan            │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
║                                       │                                          ║
╠══════════════════════════════════════ ▼ ═════════════════════════════════════════╣
║  FASE 6 — GitHub Actions schedule     deps: Fase 4 validada y estable           ║
║  ┌──────────────────────────────────────────────────────────────────────────┐   ║
║  │ .github/workflows/qa-pipeline.yml (schedule trigger)                    │   ║
║  │ Alcance: solo schedule automático — NO webhooks Jira (fuera de alcance) │   ║
║  │ Pipeline corre sin sesión local de Claude Code activa                   │   ║
║  │ Milestone: pipeline corre de madrugada sin intervención manual          │   ║
║  └──────────────────────────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

### Fase 0 — Prerequisitos

**Objetivo:** Asegurar que las piezas existentes están listas y crear los archivos base del sistema.

**Checklist completo:**
- [ ] Verificar `jira-reader` end-to-end: invocar sobre un ticket real de NAA (OP-1, OP-6).
- [ ] Verificar `jira-writer` end-to-end: postear comentario de prueba en ticket no-productivo.
- [ ] Crear `pipeline-logs/active/`, `pipeline-logs/completed/` con `.gitkeep`.
- [ ] Crear `pipeline-logs/failed-reports.json` con `[]` como contenido inicial.
- [ ] Crear `.claude/pipelines/test-engine/references/test-map.json` (§6.1). *(archivo activo consumido por los agentes)*
- [ ] Crear `.claude/pipelines/ticket-analyst/references/component-to-module.json` (§6.3). *(archivo activo consumido por los agentes)*
- [ ] Crear `scripts/sync-test-map.ts` y verificar que detecta las 14 sessions existentes.
- [ ] Crear `.claude/references/team-accounts.md` (no versionado — ver §9.3).
- [ ] Agregar `.claude/references/team-accounts.md` al `.gitignore`.
- [ ] Verificar que el `.env` del repo tiene todas las variables de §11.4 configuradas.
- [ ] Elegir un ticket real de NAA para caso de prueba del pipeline completo (E2E manual).
- [ ] **Primer test E2E manual:** ejecutar ticket-analyst sobre el ticket elegido + test-engine manualmente + test-reporter manualmente. Verificar el ciclo antes de automatizar.
- [ ] Resolver **DECISION-01** (MODO F en jira-writer) antes de comenzar Fase 3.

**Entregables:**
```
.claude/pipelines/
├── test-engine/references/test-map.json
└── ticket-analyst/references/component-to-module.json
.claude/references/team-accounts.md   (no en git)
pipeline-logs/
├── active/.gitkeep
├── completed/.gitkeep
└── failed-reports.json
scripts/sync-test-map.ts
```

---

### Fase 1 — Agent ticket-analyst (semanas 1-2)

**Objetivo:** Dado un ticket key, producir el JSON de análisis completo.

**Entregables:**

1. **`.claude/agents/ticket-analyst.md`:**
   - Procedimiento paso a paso usando jira-reader OP-1, OP-6, OP-3.
   - Reglas de clasificación: mapear `component_jira` → `domain` + `module` usando `component-to-module.json`.
   - Lógica de `confidence_score`: cuando usar "high", "medium", "low".
   - Lógica de extracción de `test_hints` desde criteria del ticket.
   - Construcción del objeto `jira_metadata` desde el output de jira-reader OP-6.
   - Output contract JSON (schema del §3.3 de este documento).

2. **Validación:**
   - Correr ticket-analyst manualmente sobre 10+ tickets reales de NAA.
   - Verificar que `module` matchea correctamente con `test-map.json`.
   - Verificar que `test_hints` son accionables.
   - Verificar que `confidence` es "high" o "medium" en tickets con component_jira mapeado.

**Trigger de prueba:**
```
"Analizá el ticket NAA-XXXX y dame el JSON de análisis completo"
```

---

### Fase 2 — Agent test-engine: discovery + runner (semanas 2-4)

**Objetivo:** Dado el output del ticket-analyst, encontrar y ejecutar sessions existentes.

**Entregables:**

1. **`.claude/agents/test-engine.md`:**
   - Test Discoverer: cómo leer `test-map.json`, precedencia del matching (§6.2).
   - Test Runner: comando exacto con todos los flags (§11.1).
   - Result Parser: cómo interpretar el JSON output de Jest (`--json`).
   - Verificación del grid antes de correr Jest.
   - Lógica de `sessions_found = false` → señalar al Orchestrator.
   - **Solo modos `discover_and_run` y `run_existing`.** No implementar `generate_and_run`.

2. **Formato del JSON output de Jest:**
   ```json
   {
     "numPassedTests": 1,
     "numFailedTests": 0,
     "testResults": [
       {
         "testFilePath": "sessions/post/NewAIPost.test.ts",
         "status": "passed",
         "testResults": [
           { "fullName": "NewAIPost", "status": "passed", "duration": 42000, "failureMessages": [] }
         ]
       }
     ]
   }
   ```

3. **Validación:**
   - Ejecutar ticket-analyst → test-engine sobre 3+ tickets con sessions existentes.
   - Verificar que el JSON de resultados es correcto.
   - Verificar que errores de infra (grid caído) se distinguen de errores de aplicación.

---

### Fase 3 — Agent test-reporter (semanas 4-5)

**Objetivo:** Dado el output del test-engine, escribir feedback correcto en Jira.

> ⚠️ **DECISION-01 debe estar resuelta antes de iniciar esta fase.** Ver §META.

**Entregables:**

1. **`.claude/agents/test-reporter.md`:**
   - Mapeo `pass/fail` → payload jira-writer (schema v2.0 completo en §3.3).
   - Construcción ADF del body del comentario.
   - Lógica de transición: `42` vs `2` vs `31`.
   - Flujo Dev_SAAS con fallos: invocar jira-writer Modo D por cada ✘.
   - Idempotencia: verificar `idempotency.already_reported` antes de escribir.
   - **Spec de `create_bug` para Dev_SAAS + failed:** proyecto = NAA, issuetype inferido del domain del ticket original (ej. `"QA Bug Front"` si domain = post/images/video; `"QA Bug Back"` si domain = auth/api), `parent_key` = ticket original como linked issue tipo "is caused by", assignee = unassigned.

2. **Validación E2E pendiente (milestone de cierre de Fase 3):**
   - [ ] Ejecutar test-reporter sobre un ticket real en ambiente `master` con resultado `passed`. Verificar: comentario ADF posteado correctamente, transición a "A Versionar" (ID 42) aplicada.
   - [ ] Ejecutar test-reporter sobre un ticket real con resultado `failed`. Verificar: comentario ADF posteado, transición a "FEEDBACK" (ID 2) aplicada.
   - [ ] Verificar idempotencia: ejecutar dos veces sobre el mismo ticket → solo un comentario posteado.
   - [ ] Probar flujo Dev_SAAS con al menos 1 test fallido: verificar comentario + creación de QA Bug en NAA.
   - [ ] Verificar que `test_reporter_output` es escrito correctamente en el Execution Context.
   - [ ] Confirmar que `pipeline-logs/completed/<ticket>.json` tiene el schema completo de §8.1 al cerrar.

---

### Fase 4 — Agent qa-orchestrator + CronCreate (semanas 5-7)

**Objetivo:** Conectar todo. Un único punto de entrada que ejecuta el pipeline completo.

**Entregables:**

1. **`.claude/agents/qa-orchestrator.md`:**
   - Recepción del trigger event normalizado.
   - Inicialización del Execution Context con `pipeline_id` único.
   - Verificación de idempotencia antes de proceder.
   - Secuencia: ticket-analyst → test-engine → (test-generator si `sessions_found=false`) → test-reporter.
   - Persistencia del Execution Context en cada stage.
   - Lógica de resumption (§8.3).
   - Registro del Agent Execution Record en `pipeline-logs/completed/`.

2. **`poll-jira.ts`:** Ejecutable con `tsx`. JQL queries de §4.3. Produce trigger events para cada ticket encontrado y los pasa al qa-orchestrator.

3. **CronCreate configurado:** prompt y schedule documentados en `.claude/agents/qa-orchestrator.md`.

4. **Pipeline Execution Record — schema diferencial (pre-Milestone A):**
   Antes de cerrar Milestone A, definir en `05-contratos-y-persistencia.md` §8.1 los campos que el Orchestrator agrega al mover el context de `active/` a `completed/` (el "delta" entre Execution Context y Agent Execution Record). Sin schema fijo, los registros de auditoría son inconsistentes entre ejecuciones. Ver issue #4.10 de la revisión arquitectónica.

5. **Validación end-to-end:**
   - Pipeline completo sobre ticket real: trigger → Jira actualizado.
   - Verificar Agent Execution Record en `pipeline-logs/completed/` (schema §8.1 completo).
   - Verificar que `failed-reports.json` funciona cuando jira-writer falla.
   - Probar resumption: interrumpir después de test-engine, retomar con qa-orchestrator.

**Milestone de Fase 4:** Pipeline ejecutable E2E con trigger manual para tickets con sessions existentes. CronCreate activo haciendo sweep cada 30 minutos.

---

### Fase 5 — Agent test-generator (semanas 7-9)

**Objetivo:** Cuando no hay sessions para un módulo, generarlas automáticamente con dry_run obligatorio.

**Entregables:**

1. **`.claude/agents/test-generator.md`:**
   - Recepción del input desde qa-orchestrator (`sessions_found = false`).
   - Verificación de POM existente → invocar pom-generator si falta.
   - Invocación de create-session con test_hints + acceptance_criteria + POM.
   - Naming: `sessions/{domain}/AutoGenerated_{ticket_key}.test.ts`.
   - **dry_run obligatorio:** Jest corre, resultados NO van a Jira.
   - Actualización provisional de test-map.json con `validated: false`.
   - Escalación a humano para revisión manual.
   - Proceso de habilitación: solo cuando el commit tiene `[validated]`.

2. **Convenciones para tests auto-generados:**
   ```typescript
   // @auto-generated: true
   // @ticket: NAA-XXXX
   // @validated: false  ← cambiar a true después de revisión manual
   runSession("AutoGenerated NAA-XXXX — Nombre del flujo", async ({ driver, opts, log }) => {
     // lógica generada
   }, {
     issueId: "NAA-XXXX",
     epic:    "Módulo",
     // ...campos jira_metadata del ticket-analyst
   });
   ```

3. **Validación:**
   - Generar sessions para 3 módulos sin tests (Tags, Planning, Admin).
   - Verificar que los archivos generados compilan: `npx tsc --noEmit`.
   - Verificar dry_run: Jest ejecuta, `pipeline-logs/` tiene el resultado, Jira NO tiene comentario.
   - Revisar manualmente, marcar `[validated]`, verificar que pipeline los usa en la siguiente ejecución.

---

### Fase 6 — GitHub Actions schedule (semanas 9-12)

**Objetivo:** Pipeline corre sin sesión local de Claude Code activa.

**Alcance definido:** Solo `schedule` trigger de GitHub Actions. No webhooks Jira. No trigger por PR merge (eso es Fase 6 futura si el equipo crece).

**Entregable:**
```yaml
# .github/workflows/qa-pipeline.yml
name: QA Pipeline — Scheduled sweep
on:
  schedule:
    - cron: '0 */4 * * *'  # cada 4 horas
jobs:
  qa-sweep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run poll-jira and invoke Claude
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          # credenciales CMS y Jira en secrets
        run: |
          # Invocar Claude API con el orchestrator prompt
          # (implementación específica a definir en Fase 6)
```

> ⚠️ La invocación de Claude en GitHub Actions requiere migrar de Claude Code CLI a Claude API directa o usar `claude --print` si el CLI está disponible en CI. La implementación específica se define al inicio de Fase 6.

**Milestone de Fase 6:** Pipeline ejecuta automáticamente sin que nadie tenga Claude Code abierto.

---

## 16. Resumen de Implementación

```
Fase     Entregable                                  Dependencia              Estado
─────────────────────────────────────────────────────────────────────────────────────────
0        test-map.json + archivos base               —                        ✅ COMPLETA
1        Agent ticket-analyst                         jira-reader ✅           ✅ COMPLETA
         Validado: NAA-4429, NAA-3964, NAA-4120
2        Agent test-engine (discover + run)           test-map.json            ✅ COMPLETA
         Milestone E2E: NewLiveBlog 2026-04-14
3        Agent test-reporter                          jira-writer ✅           ✅ COMPLETA
         Milestone E2E: NAA-4467 comentario ADF + transición 2026-04-14
4        Agent qa-orchestrator + poll-jira.ts         Fases 1-3                ⚠️ EN CURSO
         + CronCreate + failed-reports.json           Smoke test ✅
         Pre-cond: mapear customfield IDs deploy/SQL/VFS
5        Agent test-generator (dry_run first)         create-session ✅        ❌ No iniciado
                                                      pom-generator ✅
6        GitHub Actions schedule                       Fase 4 validada         ❌ No iniciado
```

**Próximos pasos (Fase 4):**
1. Resolver pre-condición: ejecutar discovery curl para mapear customfield IDs deploy/SQL/VFS
2. Ejecutar E2E completo del orchestrator sobre un ticket NAA real en `master`
3. Implementar `poll-jira.ts` (`.claude/agents/scripts/`)
4. Configurar CronCreate (sweep cada 30 min)

**Milestone Fase 4:** Pipeline E2E con trigger manual → Jira actualizado. CronCreate activo.  
**Milestone Fase 5:** Generación de tests para módulos sin cobertura (con dry_run).  
**Milestone Fase 6:** Pipeline autónomo sin sesión local activa.
