# Prompt: Migración Masiva a Custom Agents
**Sesión autónoma de corrección documental — BlueStack QA Framework**

---

## CONTEXTO OBLIGATORIO (leer antes de actuar)

Este proyecto implementó una migración arquitectural de **pipelines-as-prompts** a **custom agents de Claude Code**. El cambio ya está hecho en código (`.claude/agents/`), pero toda la documentación, wikis, skills y archivos de referencia siguen usando la terminología y rutas del modelo anterior. Esta sesión corrige eso de forma sistemática.

### Qué cambió

**Antes (modelo deprecated):**
- Los pipelines vivían en `.claude/pipelines/*/PIPELINE.md`
- El qa-orchestrator "invocaba" un pipeline leyendo su PIPELINE.md e interpretando los pasos en su propio contexto Claude (un solo contexto para todo)

**Ahora (modelo vigente):**
- Los agentes viven en `.claude/agents/*.md` con frontmatter `tools` + system prompt inline
- El qa-orchestrator invoca sub-agentes via `Agent({ subagent_type: "nombre" })` — cada uno con contexto aislado y herramientas restringidas
- Los archivos en `.claude/pipelines/` se conservan como **referencia histórica** — NO se eliminan, pero su terminología interna se actualiza para reflejar que son documentación legacy

### Estado actual del repositorio

```
.claude/agents/           ← MODELO VIGENTE
├── qa-orchestrator.md    (tools: Agent, Read, Write, Glob)
├── ticket-analyst.md     (tools: Read, Glob, Write + MCP Atlassian read)
├── test-engine.md        (tools: Bash, Read, Glob, Grep, Write)
└── test-reporter.md      (tools: Read, Write, Glob, Skill + MCP Atlassian write)

.claude/pipelines/        ← REFERENCIA HISTÓRICA (no eliminar)
├── ticket-analyst/PIPELINE.md
├── test-engine/PIPELINE.md
├── test-reporter/PIPELINE.md
├── qa-orchestrator/PIPELINE.md
├── ticket-analyst/references/  ← referencias que los agentes aún consumen
│   ├── component-to-module.json
│   ├── classification-rules.md
│   └── agent-capabilities.md
└── test-engine/references/
    └── test-map.json

.claude/skills/           ← skills que los agentes invocan (vigentes)
├── jira-reader/
└── jira-writer/
```

---

## REGLAS DE TRANSFORMACIÓN GLOBALES

Aplicar estas reglas en todos los archivos que se editen. Son decisiones ya tomadas — no re-debatirlas.

### Terminología

| Texto actual | Reemplazar por | Condición |
|---|---|---|
| `sub-pipeline` | `sub-agente` | siempre |
| `pipeline de ticket-analyst` | `agente ticket-analyst` | siempre |
| `pipeline de test-engine` | `agente test-engine` | siempre |
| `pipeline de test-reporter` | `agente test-reporter` | siempre |
| `invocar sub-pipelines` | `invocar sub-agentes` | siempre |
| `pipeline automatizado` | `agente automatizado` | siempre |
| `pipeline de Selenium` | `agente test-engine` | siempre |
| `orquestador del pipeline` | `agente orquestador` | siempre |
| `contrato inter-pipeline` | `contrato inter-agente` | siempre |
| `5 sub-pipelines` | `5 agentes` | siempre |
| `Pipeline Context` | `Execution Context` | solo cuando se refiere al concepto general; mantener `pipeline_id` como nombre de campo JSON (es legado de v3.0, documentado) |
| `Pipeline Execution Record` | `Agent Execution Record` | siempre |

### Rutas

| Ruta desactualizada | Ruta correcta |
|---|---|
| `.claude/pipelines/ticket-analyst/PIPELINE.md` | `.claude/agents/ticket-analyst.md` |
| `.claude/pipelines/test-engine/PIPELINE.md` | `.claude/agents/test-engine.md` |
| `.claude/pipelines/test-reporter/PIPELINE.md` | `.claude/agents/test-reporter.md` |
| `.claude/pipelines/qa-orchestrator/PIPELINE.md` | `.claude/agents/qa-orchestrator.md` |
| `.claude/pipelines/test-generator/PIPELINE.md` | `.claude/agents/test-generator.md` *(Fase 5, pendiente)* |
| `.claude/pipelines/test-engine/references/` | **NO mover** — los agentes ya apuntan a esta ruta |
| `.claude/pipelines/ticket-analyst/references/` | **NO mover** — los agentes ya apuntan a esta ruta |

### Nota sobre `pipeline_id`

El campo `pipeline_id` en los schemas JSON se mantiene con ese nombre (compatibilidad con logs existentes). Donde el texto lo mencione como concepto se puede aclarar: *"`pipeline_id` (nombre de campo legacy de v3.0, identifica la ejecución)"*.

### Nota sobre los PIPELINE.md en `.claude/pipelines/`

**No eliminar.** Agregar al inicio de cada PIPELINE.md el siguiente bloque:

```markdown
> **DEPRECATED — Referencia histórica v3.0**
> Este archivo fue el prompt de invocación del pipeline en el modelo anterior.
> El agente vigente está en `.claude/agents/<nombre>.md`.
> Este documento se conserva como referencia de la lógica interna.
```

---

## TRABAJO A EJECUTAR — 3 EQUIPOS EN PARALELO

Lanzar los 3 equipos simultáneamente con `Agent` en paralelo.

---

### EQUIPO A — Documento funcional de arquitectura

**Archivos:** `docs/architecture/qa-pipeline/` (8 archivos)
**Prioridad:** Alta — es el documento canónico que todos los agentes leen

**Instrucciones al agente:**

Sos el agente corrector del documento funcional de arquitectura QA. Tu tarea es actualizar 8 archivos en `docs/architecture/qa-pipeline/` para reflejar el modelo de custom agents. No tocás skills, no tocás wiki, no tocás `.claude/agents/`.

Aplicar las Reglas de Transformación Globales del prompt maestro.

**Orden de trabajo (ejecutar en secuencia — cada archivo informa al siguiente):**

**1. `08-estructura-archivos.md`** — REESCRIBIR la sección de estructura de carpetas.
La estructura de pipelines está completamente desactualizada. Reemplazar el árbol de `.claude/pipelines/*/PIPELINE.md` por:
```
.claude/
├── agents/                     ← MODELO VIGENTE
│   ├── qa-orchestrator.md      (tools: Agent, Read, Write, Glob)
│   ├── ticket-analyst.md       (tools: Read, Glob, Write + MCP Atlassian read)
│   ├── test-engine.md          (tools: Bash, Read, Glob, Grep, Write)
│   └── test-reporter.md        (tools: Read, Write, Glob, Skill + MCP Atlassian write)
│
├── pipelines/                  ← REFERENCIA HISTÓRICA (v3.0)
│   ├── ticket-analyst/
│   │   ├── PIPELINE.md         (deprecated — ver .claude/agents/ticket-analyst.md)
│   │   └── references/         ← referencias activas que los agentes consumen
│   │       ├── component-to-module.json
│   │       ├── classification-rules.md
│   │       └── agent-capabilities.md
│   ├── test-engine/
│   │   ├── PIPELINE.md         (deprecated — ver .claude/agents/test-engine.md)
│   │   └── references/
│   │       └── test-map.json   ← activo — los agentes lo consumen
│   ├── test-reporter/PIPELINE.md  (deprecated)
│   └── qa-orchestrator/PIPELINE.md (deprecated)
│
└── skills/                     ← skills que los agentes invocan
    ├── jira-reader/
    └── jira-writer/
```

**2. `09-plan-implementacion.md`** — Actualizar todos los entregables de fases:
- En el flowchart: reemplazar `PIPELINE.md ticket-analyst` → `Agent ticket-analyst (.claude/agents/ticket-analyst.md)` (y similares)
- En tabla de resumen de fases: reemplazar "Pipeline X" → "Agent X"
- En checklists de cada fase: reemplazar rutas `.claude/pipelines/*/PIPELINE.md` → `.claude/agents/*.md`

**3. `02-arquitectura-agentes.md`** — Actualizar:
- Primera sección: `"Todos los pipelines viven en .claude/pipelines/"` → `"Todos los agentes viven en .claude/agents/"`
- Diagrama: reemplazar "sub-pipelines" → "sub-agentes" en comentarios del diagrama
- Secciones de definición: `"ticket-analyst (sub-pipeline de análisis)"` → `"ticket-analyst (sub-agente de análisis)"` (y similares para los otros 3)
- Encabezado "Mapa de pipelines": → "Mapa de agentes"

**4. `03-triggers-y-flujos.md`** — Actualizar:
- Ruta en línea ~42: `.claude/pipelines/qa-orchestrator/scripts/poll-jira.ts` → `.claude/agents/scripts/poll-jira.ts` *(nota: script pendiente de creación)*
- En el flowchart (~líneas 85-132): `"qa-orchestrator — inicializa Pipeline Context"` → `"qa-orchestrator — inicializa Execution Context"`
- Reemplazar `"Pipeline Context"` → `"Execution Context"` en descripciones de flujo (NO en nombres de campos JSON)

**5. `05-contratos-y-persistencia.md`** — Actualizar:
- Título de sección: `"Contratos de Comunicación Inter-Pipeline"` → `"Contratos de Comunicación Inter-Agente"`
- `"Todos los mensajes inter-pipeline incluyen pipeline_id"` → `"Todos los mensajes inter-agente incluyen pipeline_id (campo legacy de v3.0 — identifica la ejecución)"`
- `"Pipeline Context (estado compartido)"` → `"Execution Context (estado compartido)"`
- `"Pipeline Execution Record"` → `"Agent Execution Record"`
- En tabla de errores: `"Pipeline que lo detecta"` → `"Agente que lo detecta"`

**6. `01-vision-y-estado.md`** — Actualizar:
- Línea ~8: `"Todos los pipelines viven en .claude/pipelines/"` → `"Todos los agentes viven en .claude/agents/"`
- Rutas en tabla §2.2: reemplazar `.claude/pipelines/*/` → `.claude/agents/` para los 4 agentes principales
- Retener la nota sobre `.claude/pipelines/` como referencia histórica con sus `references/` activos

**7. `10-apendices.md`** — Actualizar glosario:
- Entrada `"Pipeline"`: `"Archivo .claude/pipelines/X/PIPELINE.md invocado por Claude"` → `"Agent | Archivo .claude/agents/X.md — agente personalizado de Claude Code con tools restringidas y system prompt de rol"`
- Entrada `"Pipeline Context"` → `"Execution Context"`
- Tabla de referencias cruzadas de skills: `"pipeline-schema.md"` → aclarar que son archivos legacy redirected a wiki

**8. `00-meta.md`** — Solo si hay menciones de "contrato inter-pipeline" o "pipeline separado" que no fueron corregidas en los pasos anteriores (los demás archivos ya los corrigen). Verificar y parchear.

**Al terminar:** Verificar que en ningún archivo quede `".claude/pipelines/*/PIPELINE.md"` como ruta vigente sin el deprecation notice.

---

### EQUIPO B — Skills jira-reader y jira-writer

**Archivos:** `.claude/skills/jira-reader/SKILL.md`, `.claude/skills/jira-writer/SKILL.md`, `.claude/skills/jira-writer/references/pipeline-schema.md`, `.claude/skills/jira-reader/references/pipeline-schema.md`
**Prioridad:** Media — las skills son consumidas por los agentes en producción

**Instrucciones al agente:**

Sos el agente corrector de las skills de integración Jira. Tu tarea son cambios quirúrgicos en 4 archivos. No tocás docs de arquitectura, no tocás wiki.

Aplicar las Reglas de Transformación Globales del prompt maestro.

**Cambios en `jira-reader/SKILL.md`:**

1. En el frontmatter `description:` — buscar la frase `"el pipeline necesita leer el ticket"` → reemplazar por `"un agente necesita leer el ticket"`

2. En el cuerpo (~línea 20) — buscar: `"Provee contexto a jira-writer, al pipeline automatizado de Selenium, y a agentes externos del sistema QA."` → reemplazar por: `"Provee contexto a jira-writer, al agente test-engine del sistema QA, y a agentes externos."`

3. En la sección de referencia a `agent-capabilities.md` (~línea 231) — buscar: `".claude/pipelines/ticket-analyst/references/agent-capabilities.md"` → mantener la ruta (el archivo existe ahí y los agentes lo consumen) pero agregar nota: `"(referencia activa — los agentes la consumen desde su ubicación en .claude/pipelines/)"`

4. En "Modo automatizado" (~línea 405) — buscar: `"Cuando jira-reader es invocado por el orquestador del pipeline (no por el usuario):"` → reemplazar por: `"Cuando jira-reader es invocado por un agente orquestador (no por el usuario):"`

**Cambios en `jira-writer/SKILL.md`:**

1. En el frontmatter `description:` (~línea 14) — buscar: `"También se activa cuando un pipeline automatizado envía un JSON con resultados de tests."` → reemplazar por: `"También se activa cuando un agente automatizado (test-reporter) envía un JSON con resultados de tests."`

2. En el cuerpo (~línea 23) — buscar: `"(pipeline de Selenium envía JSON con resultados de tests del framework en /sessions)"` → reemplazar por: `"(agente test-reporter envía JSON con resultados de tests del framework en /sessions)"`

3. En "MODO F" (~línea 222) — buscar: `"El pipeline automatizado envía un JSON estructurado"` → reemplazar por: `"El agente test-reporter envía un JSON estructurado"`

4. En la sección de output de MODO F (~línea 326) — buscar: `"Pipeline Context JSON"` → reemplazar por: `"Execution Context JSON"`

**Cambios en `jira-reader/references/pipeline-schema.md` y `jira-writer/references/pipeline-schema.md`:**

Leer ambos archivos. Si solo contienen una redirección a wiki (contenido muy breve), agregar al inicio:
```markdown
> **Nota terminológica:** Este archivo se llama "pipeline-schema" por legado histórico (v3.0).
> El contrato que documenta es entre el **agente test-reporter** y las skills Jira.
```
Si tienen contenido sustancial, aplicar las Reglas de Transformación Globales.

**Al terminar:** Verificar que en ninguna skill quede "pipeline automatizado" sin el cambio aplicado.

---

### EQUIPO C — Wiki y referencias legacy

**Archivos:** `wiki/index.md`, `wiki/qa/pipeline-integration-schema.md`, `wiki/qa/devsaas-flow.md`, `wiki/overview.md`, `wiki/log.md`, `.claude/pipelines/ticket-analyst/references/classification-rules.md`, `.claude/pipelines/ticket-analyst/references/agent-capabilities.md`, PIPELINE.md files (deprecation notices)
**Prioridad:** Media — la wiki es el knowledge base de referencia de todos los agentes

**Instrucciones al agente:**

Sos el agente corrector de la wiki y las referencias legacy. Aplicar las Reglas de Transformación Globales.

**1. `wiki/index.md`** — Sección "Pipelines / Agents":
- Renombrar encabezado a `"Agents (`.claude/agents/`)"` 
- Actualizar descripción para reflejar que son custom agents: `"5 agentes personalizados de Claude Code con roles y herramientas definidas: ticket-analyst · test-engine · test-reporter · qa-orchestrator · test-generator (Fase 5)"`
- Mantener link a `docs/architecture/qa-pipeline/INDEX.md`
- Agregar nota: `"Referencias activas de los agentes (component-to-module.json, test-map.json) permanecen en .claude/pipelines/*/references/ — no se migraron para no romper rutas hardcoded en los agentes."`

**2. `wiki/qa/pipeline-integration-schema.md`** — Contenido del archivo:
- Si el archivo tiene contenido sustancial: aplicar Reglas de Transformación Globales. Reemplazar "el pipeline" → "el qa-orchestrator", "pipeline automatizado" → "agente test-reporter"
- Si solo es un stub/redirect: agregar una línea de contexto: `"Documenta el contrato entre el agente test-reporter y las skills jira-reader/jira-writer."`
- **NO renombrar el archivo** — hay links desde otros archivos que apuntan a esta ruta

**3. `wiki/qa/devsaas-flow.md`** — Cambios puntuales:
- ~línea 96: `"Para pipeline automatizado:"` → `"Para orquestador automatizado:"`
- ~línea 131: `"...si viene del pipeline"` → `"...si viene del orquestador"`
- ~líneas 202-204: `"## Uso desde el pipeline automatizado"` → `"## Uso desde el agente orquestador"` y `"Cuando el pipeline envía"` → `"Cuando el qa-orchestrator envía"`

**4. `wiki/overview.md`** — Cambios puntuales:
- Buscar `"pipeline"` en el archivo y reemplazar por `"agente"` o `"orquestador"` según el contexto. Máximo 2-3 ocurrencias esperadas.

**5. `wiki/log.md`** — Agregar entrada al inicio del log (no modificar entradas existentes):
```markdown
[2026-04-15] migration | Migración a Custom Agents completada
Los pipelines ticket-analyst, test-engine, test-reporter y qa-orchestrator fueron
migrados a custom agents de Claude Code en `.claude/agents/`. Los PIPELINE.md en
`.claude/pipelines/` se conservan como referencia histórica (deprecated v3.0).
Las referencias activas (test-map.json, component-to-module.json, classification-rules.md,
agent-capabilities.md) permanecen en `.claude/pipelines/*/references/`.
```

**6. `.claude/pipelines/ticket-analyst/references/classification-rules.md`** — Cambio de 1 línea:
- Buscar `"pipeline ticket-analyst"` → reemplazar por `"agente ticket-analyst"`

**7. `.claude/pipelines/ticket-analyst/references/agent-capabilities.md`** — Cambio de 1 línea:
- Buscar `"QA Pipeline"` en el encabezado → reemplazar por `"QA Orchestration"`

**8. DEPRECATION NOTICES en PIPELINE.md files** — Agregar al inicio de cada archivo:

Archivos a modificar:
- `.claude/pipelines/ticket-analyst/PIPELINE.md`
- `.claude/pipelines/test-engine/PIPELINE.md`
- `.claude/pipelines/test-reporter/PIPELINE.md`
- `.claude/pipelines/qa-orchestrator/PIPELINE.md`

Agregar al inicio (después del frontmatter YAML, antes del primer `#`):
```markdown
> **DEPRECATED — Referencia histórica v3.0**  
> Este archivo fue el prompt de invocación en el modelo pipelines-as-prompts.  
> El agente vigente está en `.claude/agents/<nombre>.md`.  
> Este documento se conserva como referencia de la lógica interna del agente.
```

**Al terminar:** Verificar que `wiki/index.md` no tenga "Pipelines" como encabezado de sección sin aclarar que son agents.

---

## CRITERIOS DE VALIDACIÓN (post-ejecución)

Al finalizar los 3 equipos, verificar:

```bash
# No debe haber referencias a PIPELINE.md como ruta vigente (sin deprecation notice):
grep -r "\.claude/pipelines/.*/PIPELINE\.md" docs/ wiki/ .claude/skills/ --include="*.md"

# No debe haber "sub-pipeline" en ningún doc de arquitectura:
grep -r "sub-pipeline" docs/ wiki/ --include="*.md"

# Los 4 agentes deben existir:
ls .claude/agents/

# Las referencias activas deben seguir en su lugar:
ls .claude/pipelines/ticket-analyst/references/
ls .claude/pipelines/test-engine/references/
```

---

## QUÉ NO HACER

- **No eliminar** ningún archivo en `.claude/pipelines/`
- **No mover** los `references/` — los agentes apuntan a esas rutas hardcoded
- **No cambiar** el nombre de campo `pipeline_id` en schemas JSON (es legado intencional)
- **No cambiar** `.claude/agents/*.md` — esos archivos ya están correctos
- **No cambiar** la lógica de negocio de ningún archivo — solo terminología y rutas
- **No renombrar** `wiki/qa/pipeline-integration-schema.md` — tiene links entrantes
- **No crear** nueva documentación de arquitectura — el equipo A ya actualiza la existente