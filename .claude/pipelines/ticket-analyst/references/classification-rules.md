# classification-rules — ticket-analyst

Documento de referencia para las reglas de clasificación del pipeline ticket-analyst.
Formaliza el algoritmo de §6.2 del architecture doc y los edge cases de producción.

---

## 1. Mapeo component_jira → domain / module

Fuente de verdad: `component-to-module.json`. Esta tabla es su versión con reglas de comportamiento:

| component_jira | domain | module | confidence | Notas |
|---|---|---|---|---|
| `AI` | `post` | `ai-post` | `high` | Notas generadas por IA. Backen y frontend de IA. |
| `Post` | `post` | `post` | `high` | Editor de notas, publicación, borradores, listados, liveblogs |
| `Editor` | `post` | `post` | `high` | Sinónimo funcional de Post — mapea al mismo módulo |
| `Video` | `video` | `video` | `high` | Upload, edición, publicación de videos (YouTube/embedded) |
| `Images` | `images` | `images` | `high` | Galería de imágenes, subida, gestión |
| `Auth` | `auth` | `auth` | `high` | Login, 2FA, credenciales, sesiones |
| `Tags` | `null` | `null` | — | Sin sessions — invocar test-generator (Fase 5) |
| `Planning` | `null` | `null` | — | Sin sessions — invocar test-generator (Fase 5) |
| `Admin` | `null` | `null` | — | Sin sessions — invocar test-generator (Fase 5) |

> **Módulos con `null`:** NO son un error. Significan `sessions_found: false` y que el
> orchestrator debe invocar test-generator. No escalar al usuario por este motivo.

> **component_jira ausente o `null` en el ticket:** el campo puede estar vacío si el dev
> no lo completó. Proceder con el fuzzy matching de keywords (ver §2).

---

## 2. Algoritmo de confidence scoring — 6 pasos

```
Input: component_jira del ticket + summary del ticket + test-map.json

Paso 1 — Lookup exacto en component-to-module.json
  component_jira = "AI" → module = "ai-post"   → confidence = "high"   ← STOP si hit
  component_jira = "Tags" → module = null       → sessions_found=false  ← STOP, test-generator

Paso 2 — Si component_jira ausente/null → Exact match del nombre de módulo en test-map.json
  summary contiene exactamente "ai-post" o "video" como módulo → confidence = "high" ← STOP si hit

Paso 3 — Fuzzy match por keywords
  Para cada módulo en test-map.json: calcular keywords ∩ summary_words
  score = |intersection|
  score ≥ 2 → confidence = "medium"  ← STOP con el módulo de mayor score
  score = 1 → confidence = "low"     ← registrar, ver Paso 3a
  score = 0 → no match

Paso 3a — Si confidence = "low":
  testable = false
  human_escalation = true
  Motivo: "Solo 1 keyword en común ('[kw]'). Clasificación insegura. Revisar módulo manualmente."

Paso 4 — Verificar existencia de paths en disco
  Para el módulo matcheado: verificar que sessions/XXX/YYY.test.ts existe
  Si algún path no existe → marcar en step_log, pero NO cambiar confidence
  (el test-map puede estar desactualizado → test-engine lo detectará)

Paso 5 — Verificar validated = true en test-map.json
  Si validated = false → dry_run = true en Pipeline Context
  Si validated = true  → dry_run = false (normal)

Paso 6 — Si sin match con confidence ≥ "medium":
  sessions_found = false
  Informar al orchestrator → invocar test-generator (Fase 5)
```

**Desempate entre múltiples módulos con igual score:**
Ganar el módulo cuyo `component_jira` es más específico. Jerarquía de especificidad:
`ai-post` > `post` > `cross` (AI es más específico que Post, Post es más específico que cross)

---

## 3. Reglas de action_type

El `action_type` determina cómo el test-engine y test-reporter interpretan los resultados.

| Condición | action_type | Descripción |
|---|---|---|
| Ticket en estado `Revisión` sin comentario master de QA previo | `regression_test` | Primera validación del ticket en Master. Se prueban los criterios del ticket. |
| Ticket en estado `Revisión` con historial de estado `Feedback` | `retest` | El dev corrigió problemas y reenvió a QA. Mismos criterios, nueva ejecución. |
| Story/Feature nueva sin ningún comentario QA previo | `new_feature` | Funcionalidad nueva. Puede que no haya session en test-map aún. |
| `requested_env = "dev_saas"` (cualquier estado) | `regression_test` | Re-test en entorno pre-prod de los mismos casos validados en Master. |

**Cómo detectar "viene de Feedback":**
1. Verificar en los comentarios del ticket si existe un comentario con texto que incluya
   "Se requiere corrección" o "Feedback enviado" escrito por Juanto/QA.
2. O verificar si el historial de transiciones del ticket incluye el estado `Feedback`
   (si el campo `changelog` está disponible en la respuesta de Jira).
3. Heurística alternativa: si el ticket tiene ≥ 1 comentario de QA con `✘` en los resultados
   → asumir que es un retest.

---

## 4. Reglas de testable

| Condición | testable | Motivo |
|---|---|---|
| QA Bug Front/Back con criteria ≥ 1 | `true` | Estándar — tiene definición y es un bug QA |
| Story/Feature con criteria ≥ 1 | `true` | Tiene criterios — se puede probar |
| Cualquier tipo con criteria = [] tras inferencia | `false` | Sin criterios no hay cómo definir los tests |
| `confidence = "low"` | `false` | Match inseguro — no ejecutar con baja certeza |
| Ticket de diseño/UX sin comportamiento funcional | `false` | No hay flujo automatizable |
| Ticket de documentación/admin | `false` | No es testeable funcionalmente |
| component_jira mapeado a `null` | puede ser `true` | Puede ser testeable pero sin session aún — Fase 5 |

---

## 5. Edge cases y cómo resolverlos

### 5.1 — component_jira null o vacío

El ticket no tiene componente asignado. Proceder directamente con fuzzy matching (Paso 3).
Si el fuzzy también falla → `confidence: "low"` → escalar para que el dev complete el campo.

### 5.2 — Componente desconocido (no en component-to-module.json)

El equipo agregó un nuevo componente Jira que no está mapeado. Acciones:
1. Intentar fuzzy matching por keywords.
2. Si hay match → usar ese módulo con `confidence: "medium"` aunque no haya mapeo directo.
3. Si no hay match → `confidence: "low"`, escalar, **y agregar el gap a `wiki/log.md`**:
   `[gap] Nuevo componente Jira '<X>' sin mapear — actualizar component-to-module.json`

### 5.3 — Ticket sin descripción (descripción vacía o solo whitespace)

La sección de criterios no existe. Ejecutar TA-4.2 (inferencia desde comentarios y campos custom).
Si los comentarios tampoco tienen información → ejecutar TA-4.3 (escalación).
**No asumir** que el ticket no es testeable sin intentar la inferencia desde comentarios primero.

### 5.4 — Ticket con descripción en idioma mixto (español/inglés)

El fuzzy matching opera sobre palabras individuales — el idioma no afecta el algoritmo.
Los keywords en `test-map.json` cubren ambos idiomas para los módulos principales.
Si hay ambigüedad por idioma → usar `component_jira` (más confiable).

### 5.5 — Múltiples keywords matchean módulos distintos con el mismo score

Aplicar regla de desempate por especificidad:
- Si un módulo es un subconjunto semántico de otro → ganar el más específico
- Si son semánticamente distintos (ej: `post` y `video` con igual score) → `confidence: "medium"`,
  tomar el módulo cuyo `component_jira` sea más cercano al del ticket
- Si ambos son igualmente válidos → tomar `post` como default (es el módulo más rico en sessions)

### 5.6 — Ticket Dev_SAAS sin comentario master previo

El flujo Dev_SAAS requiere re-testear los casos validados en Master (via OP-3).
Si OP-3 retorna vacío → el ticket nunca fue validado en Master.
**Acción:** abortar el flujo Dev_SAAS para este ticket. Informar al orchestrator.
**No intentar** correr tests en Dev_SAAS sin la referencia de los casos master.

### 5.7 — Ticket con múltiples componentes o cross-component

Algunos tickets afectan múltiples módulos. Si `component_jira` es uno solo pero el summary
menciona otro módulo → priorizar `component_jira` (más confiable).
Si la necesidad de cross-testing es explícita en los criterios → agregar ambos módulos a
`test_hints` y señalar al orchestrator que hay que correr sessions de más de un módulo.

### 5.8 — Ticket muy antiguo sin criterios formales

Especialmente en bugs o stories creadas antes de que el equipo documentara criterios.
La estrategia es la misma que 5.3: inferir desde comentarios y campos custom.
Si el ticket tiene un comentario master de QA (de validaciones previas) → ese comentario
contiene los casos que se probaron → usarlo como fuente de criterios (`source: "inferred"`).

---

## 6. Campos custom del equipo Bluestack

Estos campos contienen información valiosa para entender el flujo del ticket:

| Campo visible en Jira | Propósito | customfield_ID |
|---|---|---|
| **Componente** | Módulo funcional del ticket | `customfield_10061` |
| **Resumen Ejecutivo** | Descripción ejecutiva del cambio | `customfield_10062` |
| **Sprint** | Sprint activo | `customfield_10021` |
| **deploy** | Cambios desplegados en el build | pendiente de discovery |
| **cambios SQL** | Scripts de BD asociados al ticket | pendiente de discovery |
| **cambios VFS** | Archivos de configuración/assets modificados | pendiente de discovery |

> **Discovery de IDs pendientes:** Ejecutar `getJiraIssue` sobre un ticket que tenga
> los campos "deploy", "cambios SQL" y "cambios VFS" completados, sin filtrar `fields`.
> Identificar los `customfield_XXXXX` correspondientes y actualizar esta tabla y OP-1/OP-6
> de jira-reader.

---

## 7. Tabla resumen de decisiones rápidas

| Situación | Decisión |
|---|---|
| component_jira en JSON → módulo mapeado | `confidence: high`, ejecutar |
| component_jira null → keywords ≥ 2 | `confidence: medium`, ejecutar |
| component_jira null → keywords = 1 | `confidence: low`, escalar |
| component_jira → módulo null (Tags/Planning/Admin) | `sessions_found: false`, test-generator |
| criteria extraídos de descripción | `source: extracted`, `testable: true` |
| criteria inferidos de comentarios/custom fields | `source: inferred`, `testable: true`, warning en step_log |
| criteria = [] tras toda inferencia | `source: none`, `testable: false`, escalación |
| ticket en `Revisión` sin history FEEDBACK | `action_type: regression_test` |
| ticket en `Revisión` con history FEEDBACK | `action_type: retest` |
| trigger con `requested_env: dev_saas` | ejecutar OP-3, `action_type: regression_test` |
| OP-3 vacío en flujo dev_saas | abortar Dev_SAAS, blocker |