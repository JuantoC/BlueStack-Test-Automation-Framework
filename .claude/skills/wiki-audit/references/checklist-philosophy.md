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

---

## Acciones por caso

| Tipo de issue | Severidad | Acción |
|---------------|-----------|--------|
| `[ROL-NO-DOCUMENTADO]` | ALTA | Crear sección `## Filosofía de la wiki` en `wiki/index.md` usando el template de arriba |
| `[PAGINA-HUERFANA]` | ALTA | Agregar entrada en la sección correspondiente de `wiki/index.md` |
| `[REFS-RAPIDAS-GAP]` | MEDIA | Agregar fila en la tabla `## Referencias rápidas` de `wiki/index.md` |
| `[PAGINA-DENSA]` | MEDIA | Agregar resumen ejecutivo de 3-5 líneas al inicio de la página |
| `[DUPLICACION-FILOSOFIA]` | MEDIA | Comprimir la página secundaria a una referencia: "Ver X en wiki/Y.md" |