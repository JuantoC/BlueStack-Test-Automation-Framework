---
name: wiki-audit
description: >
  Audita la coherencia de toda la documentación del proyecto BlueStack: wiki/, skills,
  agents, pipelines, rules y código fuente. Detecta duplicaciones, convenciones dispersas,
  gaps, referencias rotas, artefactos históricos y páginas desactualizadas. Puede reportar
  sin modificar o corregir directamente según el modo.
  Activar cuando el usuario diga: "auditá la wiki", "revisá la documentación", "auditá el
  proyecto", "revisá que no haya incoherencias", "auditá las skills", "revisá las
  convenciones", "auditá todo", "revisá la wiki", "hay incoherencias en la doc", "la wiki
  está desactualizada", "revisá que todo esté alineado", "auditá los archivos del proyecto",
  "validá que la wiki cumple su propósito", "verificá que el rol de la wiki esté documentado",
  "la wiki sirve para algo", "revisá si la wiki está bien definida", "auditá la filosofía de
  la wiki", "verificá que la wiki tenga su propósito escrito", "la wiki está cumpliendo lo
  que tiene que cumplir", "revisá si hay páginas huérfanas en la wiki".
  También activar automáticamente tras una refactorización grande de skills o agents.
---

# wiki-audit — Auditoría de documentación BlueStack

Sos el auditor de documentación del proyecto. Tu responsabilidad: garantizar que la wiki
sea la fuente canónica única de convenciones, que no haya contenido duplicado entre skills
y wiki, y que el código y la documentación estén alineados.

**Principio guía:** un concepto técnico = un archivo canónico en `wiki/`. Todo lo demás
lo referencia. Si está duplicado, la wiki gana.

---

## Parámetros de invocación

| Parámetro | Valor por defecto | Descripción |
|-----------|-------------------|-------------|
| scope | `all` | `all` / `skills` / `wiki/pages` / `conventions` / `pages` / `gaps` |
| mode | `fix` | `fix` (corregir directamente) / `report` (solo listar issues sin modificar) |

Detectar el scope y mode desde el lenguaje del usuario. Ejemplos:
- "auditá solo las skills" → scope: `skills`
- "solo reportame los problemas" → mode: `report`
- "revisá y corregí todo" → scope: `all`, mode: `fix`

---

## Paso 0 — Lectura de contexto base

Antes de lanzar agentes, leer:
- `wiki/index.md` — mapa de toda la wiki
- `wiki/log.md` — últimas 30 líneas (entradas recientes y gaps abiertos)
- `.claude/rules/doc-organization.md` — dónde vive cada tipo de documento

Esto te da el estado actual y evita que los agentes busquen lo que ya está registrado.

---

## Paso 1 — Lanzar agentes Explore en paralelo (research)

Lanzar todos los agentes necesarios según el scope en **un solo mensaje** para que corran en paralelo.

Para `scope: all`, lanzar los 4 agentes. Para scopes parciales, lanzar solo los relevantes.

### Agente R1 — Duplicaciones skills vs wiki
**Subagent type:** Explore  
**Tarea:** Para cada skill en `.claude/skills/*/references/`, comparar el contenido con su
contraparte en `wiki/`. Detectar si el references/ duplica contenido canónico de wiki/ o
si es un dato de instancia (IDs, rutas) que legítimamente vive ahí.  
Guía detallada: leer [`references/checklist-duplications.md`](references/checklist-duplications.md)

### Agente R2 — Dispersión de convenciones
**Subagent type:** Explore  
**Tarea:** Recorrer `.claude/CLAUDE.md` y cada `.claude/skills/*/SKILL.md` buscando
convenciones de proyecto que no tengan cobertura canónica en `wiki/patterns/conventions.md`
o `wiki/core/logging.md`.  
Guía detallada: leer [`references/checklist-conventions.md`](references/checklist-conventions.md)

### Agente R3 — Gaps en pages/README y cobertura wiki
**Subagent type:** Explore  
**Tarea:** Verificar que `src/pages/README.md` liste todos los archivos `.ts` activos en
`src/pages/`. Verificar que `wiki/index.md` § "deuda de cobertura" esté actualizado.
Verificar tipos exportados documentados en wiki/pages/ contra los valores reales en .ts.  
Guía detallada: leer [`references/checklist-pages.md`](references/checklist-pages.md)

### Agente R5 — Precisión de contenido wiki vs código real
**Subagent type:** Explore  
**Tarea:** Para cada página en `wiki/pages/*.md`, abrir los archivos `.ts` correspondientes
y verificar que lo que la wiki dice es lo que el código hace. Buscar:
- Locators que wiki documenta con un testid/selector diferente al que usa el código
- Métodos que wiki dice que hacen X pero el código hace X + paso adicional no documentado
- Tipos exportados (NoteType, SidebarOption, etc.) cuyos valores en wiki no coinciden con el código
- Helpers internos (NOTE_TYPE_TESTID_MAP, ROW_ACTION_MAP) que reemplazaron mecanismos anteriores pero la wiki sigue describiendo el mecanismo viejo
- catch blocks con supresión intencional (sin rethrow) que la wiki no marca como excepción documentada a la convención

**Cómo trabajar:** Leer cada wiki/pages/*.md, luego abrir los .ts que esa página documenta, y
comparar frase a frase. No alcanza con verificar la estructura — hay que verificar el contenido.

**Páginas a revisar (prioridad alta):**
- `wiki/pages/post-page.md` → `src/pages/post_page/` (PostTable, NewNoteBtn, EditorHeaderActions)
- `wiki/pages/_shared.md` → `src/pages/` raíz (SidebarAndHeader, FooterActions, HeaderNewContentBtn)
- `wiki/pages/modals.md` → `src/core/helpers/` (handleUpdateModal) y locators en wiki
- `wiki/pages/video-image-editors.md` → `src/pages/videos_page/` e `src/pages/images_pages/`
- `wiki/patterns/conventions.md` → tipos exportados en `src/interfaces/data.ts` y `src/pages/`

**Reportar con el formato:**
```
[CONTENIDO-INCORRECTO] wiki dice: "..." / código dice: "..." / archivo: path:línea
[GAP-CONTENIDO] wiki no documenta: "..." / archivo: path:línea
```

### Agente R4 — Artefactos históricos y gaps pendientes
**Subagent type:** Explore  
**Tarea:** Verificar que los pipelines en `.claude/pipelines/` tengan nota DEPRECATED si
fueron reemplazados por agents en `.claude/agents/`. Verificar que `wiki/log.md` tenga
entradas `[gap]` para trabajo pendiente conocido. Verificar que `references/field-map.md`
de jira-writer esté completo.  
Guía detallada: leer [`references/checklist-artifacts.md`](references/checklist-artifacts.md)

### Agente R6 — Wiki Philosophy & AI-Efficiency Audit
**Subagent type:** Explore  
**Tarea:** Auditar dos dimensiones:

**Parte A — El rol de la wiki está documentado:**  
Verificar que exista en el proyecto una declaración explícita de:
- Para qué sirve la wiki: contexto para agentes IA, no fuente de verdad del código
- Cómo usarla: leer antes de abrir `.ts`, navegar por `wiki/index.md`
- Qué va y qué no va en `wiki/`: referencia a `doc-organization.md`
- Que los archivos TypeScript siguen siendo la fuente de verdad absoluta

Dónde buscar: `wiki/index.md`, `wiki/overview.md`, `wiki/about.md` (si existe).  
Si ninguno contiene una sección dedicada al propósito/filosofía de la wiki → reportar `[ROL-NO-DOCUMENTADO]`.

**Parte B — La wiki es eficiente como contexto para IA:**  
1. Listar todos los archivos `.md` bajo `wiki/` con Glob `wiki/**/*.md`
2. Para cada archivo encontrado, verificar si está referenciado en `wiki/index.md`
3. Verificar que la tabla "Referencias rápidas" en `wiki/index.md` cubre los flujos de uso frecuente del agente
4. Verificar si hay páginas >300 líneas sin resumen ejecutivo al inicio (riesgo de lookup ineficiente)
5. Verificar si hay conceptos documentados en 2+ páginas distintas (duplicación)

Reportar con formato:
```
[ROL-NO-DOCUMENTADO] No existe declaración explícita del propósito de la wiki para agentes IA
[PAGINA-HUERFANA] wiki/X.md no está referenciada en wiki/index.md
[PAGINA-DENSA] wiki/X.md tiene >300 líneas sin resumen ejecutivo — riesgo de lookup ineficiente
[DUPLICACION-FILOSOFIA] Concepto X documentado en wiki/A.md y wiki/B.md
[REFS-RAPIDAS-GAP] Flujo de uso frecuente Y no tiene entrada en la tabla de referencias rápidas
```

Guía detallada: leer [`references/checklist-philosophy.md`](references/checklist-philosophy.md)

---

## Paso 2 — Consolidar hallazgos

Mientras los agentes corren, preparar la tabla de issues con el formato:

```
| # | Severidad | Dimensión | Issue | Archivos involucrados |
|---|-----------|-----------|-------|-----------------------|
```

Dimensiones: `Duplicaciones` / `Convenciones` / `Pages/README` / `Artefactos` / `Contenido wiki vs código`

Severidad: `ALTA` (contenido incorrecto en wiki que puede inducir a error, duplicación activa, convención sin cobertura) / `MEDIA` (gap documental, descripción incompleta, tipo con valores desactualizados) / `BAJA` (artefacto histórico, gap menor)

---

## Paso 3 — Ejecución de fixes (modo `fix` solamente)

Si `mode: fix`, lanzar agentes de corrección en paralelo agrupados por dimensión. Si
`mode: report`, saltear este paso.

Para cada grupo de issues, un agente general-purpose recibe:
- La lista de issues de su dimensión
- Los archivos a modificar
- La regla de resolución específica (ver checklists en references/)
- Instrucción de registrar cada cambio en `wiki/log.md` con fecha actual

Lanzar todos los agentes de fix en **un solo mensaje** para paralelismo máximo.

---

## Paso 4 — Reporte final

Mostrar siempre, independientemente del mode:

```
## Resultado auditoría wiki — <fecha>

### Foco 1: Efectividad funcional
- [PASS/FAIL] Index completo: todas las páginas wiki referenciadas en wiki/index.md
- [PASS/FAIL] Sin páginas huérfanas
- [PASS/FAIL] Sin duplicaciones de contenido entre páginas
- [PASS/FAIL] Sin violaciones SSOT (lógica funcional en .md que debería ser .ts)
- [PASS/FAIL] Gaps cubiertos (temas de skills/agents con cobertura wiki)
- [PASS/FAIL] Tabla de referencias rápidas actualizada

### Foco 2: Rol de la wiki documentado
- [PASS/FAIL] Propósito de la wiki escrito explícitamente (para qué sirve, para quién)
- [PASS/FAIL] Instrucciones de uso para agentes (wiki-first protocol accesible)
- [PASS/FAIL] Reglas de contribución accesibles (qué va y qué no va en wiki/)
- [PASS/FAIL] TypeScript como SSOT declarado explícitamente

### Issues encontrados: N
| # | Severidad | Dimensión | Issue | Estado |
|---|-----------|-----------|-------|--------|
| 1 | ALTA | <dimensión> | <descripción> | ✅ Corregido / ⚠️ Reportado |

### Gaps registrados en wiki/log.md: M
- [gap] <descripción>

### Estado final
- N issues resueltos (si mode: fix)
- M issues reportados para acción manual (si mode: report)
- Wiki coverage: X% de archivos .ts con página wiki correspondiente
```

Si no se encontraron issues: reportar explícitamente "0 issues detectados — documentación coherente".

---

## Criterios de resolución (resumen ejecutivo)

Para el detalle completo de qué hacer en cada caso, los agentes deben leer el checklist
de su dimensión en `references/`. Este es el resumen de reglas maestras:

1. **Duplicación references/ vs wiki/**: si el contenido es una convención general → wiki/ gana, actualizar SKILL.md para apuntar a wiki/. Si es dato de instancia (IDs, rutas, tokens) → legítimamente en references/, no mover.
2. **Convención dispersa**: agregarla a `wiki/patterns/conventions.md` con sección propia. Comprimir la entrada en CLAUDE.md a una línea + link.
3. **Gap en pages README**: agregar el componente faltante a la tabla de directorio con link a wiki/pages/.
4. **Descripción de método incompleta**: verificar el código fuente, actualizar la wiki para reflejar el comportamiento real (retry, helpers internos, parámetros relevantes).
5. **Contenido wiki incorrecto (locator, tipo, mecanismo)**: el código es la fuente de verdad. Actualizar la wiki para que refleje el estado real del código. Nunca modificar el código para que coincida con la wiki.
6. **Tipo exportado con valores desactualizados en wiki**: leer el `.ts` que define el tipo y actualizar la tabla de valores en la wiki/pages/*.md correspondiente.
7. **Pipeline histórico sin nota DEPRECATED**: agregar bloque al inicio del PIPELINE.md. No modificar el contenido.
8. **Gap pendiente no registrado**: agregar entrada `[gap]` en wiki/log.md con descripción y contexto.
9. **Rol de la wiki no documentado** (`[ROL-NO-DOCUMENTADO]`): crear sección `## Filosofía de la wiki` en `wiki/index.md` con los cuatro puntos del contrato (para qué sirve, cómo usarla, qué va y qué no, TypeScript como SSOT). No crear `wiki/about.md` separado — mantener en el entry point para que sea leído siempre. Ver template en [`references/checklist-philosophy.md`](references/checklist-philosophy.md) § Template.
10. **Página huérfana** (`[PAGINA-HUERFANA]`): agregar la página faltante en la sección correspondiente de `wiki/index.md`. Nunca dejar una página wiki sin entrada en el índice.