# Prompt: Terminología y Arquitectura — Deuda Técnica v3.1
**Sesión autónoma de corrección exhaustiva — BlueStack QA Framework**

---

## CONTEXTO OBLIGATORIO

Este proyecto migró de "pipelines-as-prompts" a "custom agents de Claude Code". Una primera
pasada de migración corrigió la terminología en docs, wiki y skills, pero dejó dos categorías
de deuda técnica sin resolver:

**A) Terminología residual** — los archivos `.claude/agents/*.md` (los system prompts que los
agentes leen en runtime) y varios docs/wiki todavía usan el vocabulario del modelo anterior.
Esto es riesgo real: si un agente lee su propio system prompt y ve "Pipeline Context", puede
generar nombres de archivo, mensajes de error y logs inconsistentes con el sistema actual.

**B) Inconsistencias arquitecturales** — la documentación de arquitectura describe el diseño
anterior en varios puntos clave (flujo de integración Jira, schema del Execution Context,
routing del orchestrator). La decisión ya fue tomada: **los docs reflejan el código real**,
no al revés. Los agentes en `.claude/agents/` son el sistema en producción — son la verdad.

---

## VOCABULARIO DE MIGRACIÓN

### Terminología (aplicar en TODO el proyecto excepto excepciones)

| Texto actual (deprecated) | Reemplazar por | Condición |
|---|---|---|
| `Pipeline Context` | `Execution Context` | Cuando se refiere al concepto del objeto JSON compartido |
| `Pipeline Execution Record` | `Agent Execution Record` | Siempre |
| `sub-pipeline` / `sub-pipelines` | `sub-agente` / `sub-agentes` | Siempre |
| `pipeline automatizado` | `agente automatizado` | Siempre |
| `inter-pipeline` | `inter-agente` | Siempre |
| `orquestador del pipeline` | `agente orquestador` | Siempre |
| `invocar sub-pipelines` | `invocar sub-agentes` | Siempre |

### Excepciones VÁLIDAS — nunca tocar

- El campo JSON `pipeline_id` — es nombre de campo legacy intencional (compatibilidad con logs)
- Nombres de archivo: `pipeline-schema.md`, `pipeline-integration-schema.md` — tienen links entrantes
- Bloques `> **DEPRECATED — Referencia histórica v3.0**` en `.claude/pipelines/*/PIPELINE.md`
- Tablas de historial o changelog que documentan el modelo v3.0 como **pasado** (están en tiempo pasado)
- El directorio `.claude/pipelines/` completo y su contenido — es referencia histórica intencional
- El directorio `.claude/prompts/` — son prompts de sesión, no docs operativos
- `node_modules/`, `.git/`

---

## FASE 0 — EXPLORACIÓN EXHAUSTIVA EN PARALELO (OBLIGATORIA, ANTES DE CORREGIR)

**No confiar en ninguna lista preexistente.** Lanzar 4 agentes exploradores simultáneamente.
Cada explorador reporta solo sus hallazgos — no edita nada.

Esperar a que los 4 completen antes de avanzar a las fases de corrección.

### EXPLORADOR 1 — `.claude/agents/`

Buscar en los 4 archivos de `.claude/agents/` (qa-orchestrator.md, ticket-analyst.md,
test-engine.md, test-reporter.md) todas las ocurrencias de los patrones deprecated.

Por cada hit: archivo, número de línea, texto exacto, clasificación (RESIDUAL / EXCEPCIÓN VÁLIDA).

Contar totales por archivo y por patrón.

### EXPLORADOR 2 — `docs/` (excluyendo `docs/audit/` que es historial)

Buscar en todo `docs/architecture/` todas las ocurrencias de los patrones deprecated.

Incluir `docs/architecture/qa-pipeline/INDEX.md` y todos los archivos numerados.
Excluir `docs/audit/` — es registro histórico, no documentación operativa.

Por cada hit: archivo, número de línea, texto exacto, clasificación (RESIDUAL / EXCEPCIÓN VÁLIDA).

### EXPLORADOR 3 — `wiki/` y `.claude/skills/`

Buscar en todo `wiki/` y en `.claude/skills/` todas las ocurrencias de los patrones deprecated.

Por cada hit: archivo, número de línea, texto exacto, clasificación.

Nota especial: en `wiki/log.md` las entradas de historial son excepciones válidas si están en tiempo pasado describiendo lo que fue.

### EXPLORADOR 4 — Resto del proyecto

Buscar en `.claude/rules/`, `.claude/CLAUDE.md`, `.claude/pipelines/ticket-analyst/references/`,
`.claude/pipelines/test-engine/references/`, y cualquier `.md` no cubierto por los otros tres.

Excluir `.claude/pipelines/*/PIPELINE.md` (son el bloque DEPRECATED intencional).

Por cada hit: archivo, número de línea, texto exacto, clasificación.

---

## FASE 1 — PUNTO A: CORRECCIÓN DE TERMINOLOGÍA EN PARALELO

Con los resultados consolidados de los 4 exploradores, lanzar 3 equipos correctores
**simultáneamente**. Cada equipo opera en su zona de archivos sin solaparse.

### EQUIPO A1 — `.claude/agents/` (PRIORIDAD ALTA — runtime)

Estos son los system prompts que los agentes leen en ejecución. Son la corrección más urgente.

**Archivos confirmados (más los que encontró Explorador 1):**
- `.claude/agents/qa-orchestrator.md`
- `.claude/agents/ticket-analyst.md`
- `.claude/agents/test-engine.md`
- `.claude/agents/test-reporter.md`

**Regla crítica para este equipo:**
- Al reemplazar `Pipeline Context` → `Execution Context` en los agentes, verificar que **las rutas
  de archivo que nombran el objeto siguen siendo correctas**. Ejemplo: si un agente escribe
  `pipeline-logs/active/<ticket_key>.json`, ese nombre de archivo no cambia (es el archivo en disco,
  no el concepto). Solo cambia el término cuando se usa como nombre del concepto, no como nombre de ruta.
- Aplicar todas las sustituciones del vocabulario de migración.
- Respetar todas las excepciones.

### EQUIPO A2 — `docs/architecture/` (PRIORIDAD MEDIA)

**Archivos confirmados (más los que encontró Explorador 2):**
- `docs/architecture/qa-pipeline/00-meta.md` — `Pipeline Context` ×3
- `docs/architecture/qa-pipeline/INDEX.md` — `sub-pipeline` ×2, `inter-pipeline` ×2
- `docs/architecture/qa-pipeline/06-seguridad-y-observabilidad.md` — `Pipeline Context` ×2, `Pipeline Execution Record` ×1
- `docs/architecture/qa-pipeline/07-entorno-riesgos-metricas.md` — `Pipeline Context` ×1
- `docs/architecture/qa-pipeline/01-vision-y-estado.md` — `pipeline automatizado` ×1

Aplicar sustituciones. En `INDEX.md`, actualizar también la descripción de §05 si menciona
"Schema de mensajes inter-pipeline" sin haberlo corregido antes.

### EQUIPO A3 — `wiki/`, `.claude/skills/`, y resto

**Archivos confirmados (más los que encontraron Exploradores 3 y 4):**
- `wiki/qa/adf-format-guide.md` — `pipeline automatizado` ×1
- `wiki/core/docker-grid.md` — `Pipeline Context` ×1

Aplicar sustituciones según vocabulario de migración. Respetar excepciones de historial.

---

## FASE 2 — PUNTO B: CORRECCIÓN ARQUITECTURAL (2 agentes en secuencia)

### LECTOR ARQUITECTURAL (ejecutar primero, solo lectura)

Leer los 4 archivos de `.claude/agents/` completos y extraer los hechos arquitecturales
que se usarán para corregir los docs. Reportar explícitamente:

1. **ticket-analyst**: ¿qué tools declara en frontmatter? ¿invoca la skill `jira-reader` o
   llama MCP directamente? ¿cuáles son los tools MCP de Atlassian que usa?

2. **test-reporter**: ¿cómo llama a jira-writer? ¿qué modo usa? ¿cuál es la instrucción exacta
   (buscar `Skill({ skill: "jira-writer" })` o equivalente)?

3. **qa-orchestrator** — Execution Context: ¿cuál es el schema JSON exacto que crea en ORC-1?
   ¿qué campos tiene? ¿cuál es la ruta de archivo donde lo guarda?

4. **qa-orchestrator** — Routing: ¿qué condiciones evalúa después de recibir el output de
   ticket-analyst? ¿cuántas ramas tiene? ¿cuáles son las condiciones exactas para escalar vs.
   continuar a test-engine?

5. **test-engine**: ¿cuál es el comando Jest exacto con todas sus variables de entorno?

### CORRECTOR ARQUITECTURAL (ejecutar después del LECTOR, con sus resultados)

Con los hechos extraídos por el LECTOR, corregir los siguientes archivos:

**1. `docs/architecture/qa-pipeline/02-arquitectura-agentes.md` — sección test-reporter**

Actualizar para reflejar MODO F:
- Reemplazar la descripción "Usa jira-writer Modos B, C, D" por la descripción correcta
  según lo que encontró el LECTOR (MODO F via Skill tool).
- Eliminar (o marcar como resuelto) el aviso `⚠️ Ver DECISION-01 (§META) antes de implementar
  este agente.` — la decisión ya fue tomada e implementada.

**2. `docs/architecture/qa-pipeline/02-arquitectura-agentes.md` — sección ticket-analyst**

Actualizar la descripción de integración Jira:
- Reemplazar "Usa skill jira-reader OP-1, OP-2, OP-3, OP-6" por la descripción de las tools MCP
  reales (nombres exactos de los tools MCP que encontró el LECTOR en el frontmatter del agente).
- Agregar nota breve: ticket-analyst llama MCP Atlassian directamente sin pasar por la skill
  jira-reader (la skill sigue vigente para uso humano directo).

**3. `docs/architecture/qa-pipeline/02-arquitectura-agentes.md` — comando Jest de test-engine**

Agregar `TARGET_ENV=master` donde el LECTOR confirmó que falta.

**4. `docs/architecture/qa-pipeline/05-contratos-y-persistencia.md` — schema del Execution Context**

Esta es la corrección más crítica. El LECTOR extrajo el schema real. Usar esos datos para:
- Corregir los nombres de campos en la sección del schema (§7.2 o equivalente)
- Corregir la ruta de persistencia del archivo (de `pipe-{id}-context.json` a la ruta real)
- Mantener la nota sobre `pipeline_id` como campo legacy si existe

**5. `docs/architecture/qa-pipeline/03-triggers-y-flujos.md` — routing de qa-orchestrator**

El LECTOR extrajo la lógica real de routing. Usar esos datos para:
- Reemplazar el routing granular de 4 ramas (`full_run`, `partial_run_and_escalate`,
  `generate_tests`, `escalate_all`) por el routing real del agente (2 condiciones según el LECTOR)
- Actualizar el flowchart correspondiente para que refleje las ramas reales
- El campo `testability_summary.action` probablemente no es leído por el orchestrator — verificar
  y eliminar referencias si es el caso

---

## FASE 3 — VALIDACIÓN FINAL EN PARALELO

Lanzar 3 validadores simultáneamente una vez completadas las Fases 1 y 2.

### VALIDADOR 1 — Terminología (grep exhaustivo)

Ejecutar búsquedas grep en todo el proyecto (excluyendo excepciones válidas) y confirmar
que no quedan ocurrencias de:
- `Pipeline Context` (como concepto)
- `Pipeline Execution Record`
- `sub-pipeline`
- `pipeline automatizado`
- `inter-pipeline`
- `orquestador del pipeline`

Para cada ocurrencia residual encontrada: reportar archivo, línea y texto. Si es excepción
válida, justificarlo. Si es residual real, reportarlo como fallo de validación.

### VALIDADOR 2 — Coherencia arquitectural

Verificar que los docs corregidos en Fase 2 son consistentes con los agentes reales:
- ¿El schema del Execution Context en el doc coincide con lo que crea qa-orchestrator?
- ¿Las rutas de archivos mencionadas en el doc coinciden con las que usa el agente?
- ¿La descripción del routing en el doc coincide con la lógica del agente?
- ¿La integración Jira de ticket-analyst en el doc describe MCP directo (no via skill)?
- ¿test-reporter en el doc menciona MODO F?

### VALIDADOR 3 — Integridad de los agentes

Verificar que los agentes modificados en Fase 1 (Equipo A1) siguen siendo válidos:
- ¿Las rutas de archivo siguen siendo correctas? (nombres de archivo en disco no cambiaron)
- ¿Las instrucciones de los agentes siguen siendo coherentes internamente?
- ¿No se introdujo "Execution Context" donde debería decir `pipeline_id` (el campo JSON)?
- Verificar específicamente que el schema JSON que genera qa-orchestrator en ORC-1 sigue
  usando los nombres de campo correctos (no se "tradujo" el contenido JSON, solo el concepto)

---

## CRITERIOS DE ÉXITO

Al finalizar la sesión, debe ser verdad que:

```bash
# Ninguno de estos grep debe devolver hits fuera de excepciones válidas:
grep -r "Pipeline Context" .claude/agents/ docs/ wiki/ .claude/skills/ --include="*.md"
grep -r "Pipeline Execution Record" .claude/agents/ docs/ wiki/ --include="*.md"
grep -r "sub-pipeline" .claude/agents/ docs/ wiki/ --include="*.md"
grep -r "pipeline automatizado" .claude/agents/ docs/ wiki/ .claude/skills/ --include="*.md"
grep -r "inter-pipeline" .claude/agents/ docs/ wiki/ --include="*.md"

# Los 4 agentes deben seguir existiendo y tener coherencia interna:
ls .claude/agents/

# Los docs de arquitectura deben referenciar los campos reales:
grep "ticket_analyst_output" docs/architecture/qa-pipeline/05-contratos-y-persistencia.md
grep "MODO F" docs/architecture/qa-pipeline/02-arquitectura-agentes.md
grep "TARGET_ENV" docs/architecture/qa-pipeline/02-arquitectura-agentes.md
```

---

## QUÉ NO HACER

- **No eliminar** ningún archivo en `.claude/pipelines/` — son referencia histórica intencional
- **No mover** las `references/` dentro de `.claude/pipelines/` — los agentes apuntan a esas rutas
- **No cambiar** el nombre del campo `pipeline_id` en schemas JSON — es legacy intencional
- **No renombrar** archivos `pipeline-schema.md` o `pipeline-integration-schema.md` — tienen links
- **No tocar** `.claude/pipelines/*/PIPELINE.md` más allá de lo ya hecho — tienen DEPRECATED notice
- **No cambiar** la lógica de negocio de los agentes en Fase 1 — solo terminología
- **No "traducir"** el contenido de los objetos JSON que los agentes escriben en disco
  (el nombre del campo `pipeline_id` en el JSON persiste; solo el nombre del concepto cambia)
- **No corregir** cosas pendientes de desarrollo futuro (test-generator, Fase 5) — dejar como están