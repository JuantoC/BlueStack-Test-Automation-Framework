# Checklist: Wiki Philosophy & AI-Efficiency Audit

## Parte A — El rol de la wiki está documentado

### Qué verificar

La wiki de este proyecto es una **herramienta de contexto para agentes IA**, no una wiki para humanos.
Su propósito declarado es:

1. **Reducir tokens consumidos** — el agente lee una página wiki compacta en vez de abrir 3-5 archivos `.ts`
2. **Single lookup point** — un concepto = un lugar. El agente no tiene que buscar en múltiples fuentes
3. **Eficiencia de navegación** — `wiki/index.md` como entry point real y funcional
4. **No es SSOT del comportamiento** — los archivos TypeScript son la fuente de verdad absoluta

Este rol debe estar documentado explícitamente en `wiki/index.md` como sección `## Filosofía de la wiki`.
Si no existe → es un `[ROL-NO-DOCUMENTADO]` de severidad ALTA.

### Criterios de PASS

- [ ] Existe una sección en `wiki/index.md` que declara para qué sirve la wiki y para quién (agentes IA)
- [ ] La sección menciona explícitamente que TypeScript sigue siendo la SSOT
- [ ] La sección explica qué va en wiki/ (convenciones, ejemplos, firmas públicas) y qué no va (lógica funcional, definiciones de tipos, interfaces)
- [ ] La sección referencia `doc-organization.md` para el decision tree de dónde va cada cosa

### Template para `## Filosofía de la wiki` en `wiki/index.md`

```markdown
## Filosofía de la wiki

Esta wiki es una herramienta de contexto para **agentes IA**, no una wiki para humanos.

**Para qué sirve:**
- Brindar al agente el contexto que necesita en un solo lugar, con pocas lecturas
- Reducir tokens consumidos: una página wiki compacta reemplaza abrir 3-5 archivos `.ts`
- Ser el único lugar donde el agente busca convenciones, firmas públicas y ejemplos del equipo

**Para qué NO sirve:**
- No es la fuente de verdad del comportamiento del código — eso son los archivos TypeScript
- No define tipos, interfaces ni lógica funcional — eso va en `.ts`, nunca en `.md`
- No reemplaza leer el código cuando la wiki no cubre lo que se necesita

**Cómo usarla:**
1. Leer `wiki/index.md` (este archivo) como entry point
2. Navegar a la página relevante usando el índice o la tabla de referencias rápidas
3. Solo abrir el `.ts` fuente si la wiki no cubre lo que se necesita — y registrar el gap en `wiki/log.md`

**Cómo contribuir:**
- Decision tree de dónde va cada tipo de documento: `.claude/rules/doc-organization.md`
- Un concepto técnico = un archivo canónico en `wiki/`. Nunca duplicar
- Toda página wiki nueva debe quedar referenciada en `wiki/index.md` antes de hacer commit
```

---

## Parte B — La wiki es eficiente como contexto para IA

### Qué verificar

#### B1 — Cobertura del índice (páginas huérfanas)

Pasos:
1. Listar todos los archivos `.md` bajo `wiki/` con Glob `wiki/**/*.md`
2. Para cada archivo, verificar si su path aparece en `wiki/index.md`
3. Excluir de la verificación: `wiki/index.md` (es el índice), `wiki/log.md` (log operativo)
4. Reportar como `[PAGINA-HUERFANA]` cualquier `.md` no referenciado

**Archivos conocidos en la wiki (al 2026-04-16):**
```
wiki/overview.md
wiki/log.md (excluir del check)
wiki/core/docker-grid.md
wiki/core/run-session.md
wiki/core/actions.md
wiki/core/driver-setup.md
wiki/core/errors.md
wiki/core/utils.md
wiki/core/logging.md
wiki/interfaces/data-types.md
wiki/patterns/conventions.md
wiki/patterns/factory-api.md
wiki/pages/_shared.md
wiki/pages/login-page.md
wiki/pages/post-page.md
wiki/pages/videos-page.md
wiki/pages/images-page.md
wiki/pages/tags-page.md
wiki/pages/modals.md
wiki/pages/video-image-editors.md
wiki/sessions/catalog.md
wiki/development/commit-conventions.md
wiki/development/skill-conventions.md
wiki/qa/adf-format-guide.md
wiki/qa/devsaas-flow.md
wiki/qa/environments.md
wiki/qa/pipeline-integration-schema.md
wiki/qa/validation-session-2026-04-15.md
wiki/qa/multimedia-attachment-integration.md  ← verificar si está en el índice
```

#### B2 — Tabla de referencias rápidas

Verificar que la tabla `## Referencias rápidas` en `wiki/index.md` incluye entradas para:
- Crear un test
- Instanciar un PO
- Usar datos de prueba (factories)
- Hacer acciones UI (click, write, wait)
- Navegar el CMS (sidebar)
- Ver tests existentes
- Entender logs
- Arquitectura del pipeline QA
- Levantar infra / Grid
- Comandos de ejecución

Si falta alguno relevante → `[REFS-RAPIDAS-GAP]`

#### B3 — Densidad de páginas

Para cada página wiki con más de 300 líneas, verificar si tiene un resumen ejecutivo
(primeras 15 líneas deben cubrir "qué hace este módulo" de forma escaneabe).

Páginas probablemente densas a revisar:
- `wiki/patterns/conventions.md`
- `wiki/qa/pipeline-integration-schema.md`
- `wiki/core/run-session.md`

#### B4 — Duplicaciones conceptuales

Buscar si el mismo concepto aparece definido en dos páginas distintas.
Señales de alerta:
- Dos páginas con el mismo encabezado de sección
- El mismo tipo exportado documentado en `interfaces/data-types.md` Y en una `pages/*.md`
- La misma convención de código en `patterns/conventions.md` Y en `development/skill-conventions.md`

#### B5 — Lookup path analysis

Para cada concepto frecuente de la lista siguiente, mapear cuántos archivos `.md` lo mencionan con detalle suficiente para resolver una consulta:
- retry boundary
- PO constructor (Maestro vs sub-componente)
- NoteType (valores válidos)
- SidebarOption / navegación CMS
- ambientes master vs dev_saas
- manejo de errores / rethrow
- `testability_summary.action` (enum de routing del pipeline)
- `criterion_scope` (ui, vfs, backend_data, api)
- test-map.json y coverage gap analysis

Para cada concepto:
1. Verificar si `wiki/index.md` § "Referencias rápidas" tiene entry point directo
2. Contar cuántas páginas wiki lo cubren con suficiente detalle
3. Verificar si hay jerarquía clara entre esas páginas (cuál es la canónica)

Reportar:
- `[LOOKUP-AMBIGUO]` concepto X: N páginas posibles, sin jerarquía clara entre ellas
- `[LOOKUP-DIRECTO]` concepto X: entry point único en wiki/Y.md — OK

#### B6 — Cobertura de flujos críticos del pipeline

Fuentes a leer: `.claude/agents/qa-orchestrator.md` · `.claude/agents/ticket-analyst.md`
Extraer los conceptos de dominio que los agentes referencian durante su ejecución.
Para cada concepto, verificar si existe una página wiki que lo cubra con suficiente detalle.

Flujos críticos a verificar (mínimo):
- ORC-1: derivación de environment desde estado Jira
- ORC-1.2: stage routing e idempotencia
- ORC-2.5: routing decision por `testability_summary.action`
- TA-3: lazy loading de ticket (3A vs 3B)
- TA-4.2: inferencia de `criterion_scope` desde customfields
- TA-4.4: invalidación de criterios por comentario QA
- TA-4b: sub-casos de automatizabilidad (visual_check, clipboard, ckeditor, timezone)
- TA-5b: coverage gap analysis y test-map.json lookup
- ORC-5/6: test-reporter, ADF, transición Jira, escalación

Formato de reporte:
- `[FLUJO-CUBIERTO]` concepto X → `wiki/Y.md`
- `[FLUJO-SIN-COBERTURA]` concepto X → agente debe leer `.md` del agente o `.ts` (gap)

Severidad: `[FLUJO-SIN-COBERTURA]` = MEDIA si el concepto es simple / ALTA si es complejo (>1 archivo involucrado o es un enum/tabla de routing crítica).

---

## Acciones por caso

| Tipo de issue | Severidad | Acción |
|---------------|-----------|--------|
| `[ROL-NO-DOCUMENTADO]` | ALTA | Crear sección `## Filosofía de la wiki` en `wiki/index.md` usando el template de arriba |
| `[PAGINA-HUERFANA]` | ALTA | Agregar entrada en la sección correspondiente de `wiki/index.md` |
| `[REFS-RAPIDAS-GAP]` | MEDIA | Agregar fila en la tabla `## Referencias rápidas` de `wiki/index.md` |
| `[PAGINA-DENSA]` | MEDIA | Agregar resumen ejecutivo de 3-5 líneas al inicio de la página |
| `[DUPLICACION-FILOSOFIA]` | MEDIA | Comprimir la página secundaria a una referencia: "Ver X en wiki/Y.md" |
| `[LOOKUP-AMBIGUO]` | ALTA | Definir jerarquía explícita entre páginas: una es canónica, las demás la referencian con link |
| `[FLUJO-SIN-COBERTURA]` | MEDIA/ALTA | Crear o actualizar página wiki para cubrir el concepto; registrar gap en `wiki/log.md` |