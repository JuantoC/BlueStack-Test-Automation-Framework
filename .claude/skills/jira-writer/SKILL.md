---
name: jira-writer
description: >
  Crea tickets y escribe comentarios de validación QA en el proyecto NAA de Bluestack,
  siguiendo las convenciones del equipo. Usar siempre que se necesite: crear un QA Bug
  (Front o Back), escribir un comentario de validación sobre Master, Dev_SAAS o ambiente
  de cliente, reportar resultados de pruebas automatizadas Selenium, ticketear un bug,
  transicionar el estado de un ticket, o linkear tickets relacionados.
  Se activa con frases como: "creá un ticket", "levantá un bug", "comentá la validación",
  "validé sobre master", "validé en dev_saas", "el ticket tiene errores", "pasá a versionar",
  "linkeá con", "basate en el NAA-XXXX", "los tests pasaron", "los tests fallaron",
  "registrá los resultados en jira", "el pipeline terminó con errores", "actualizá el ticket
  con los resultados del test", "crear bug desde el test fallido".
  También se activa cuando un pipeline automatizado envía un JSON con resultados de tests.
  Depende de jira-reader para leer contexto previo cuando se necesita.
---

# jira-writer

Skill de **escritura** para el proyecto NAA. Crea tickets, postea comentarios y transiciona
estados siguiendo las convenciones del equipo de QA de Bluestack.
Opera en dos modos: **conversacional** (Juanto describe una validación) y **automatizado**
(pipeline de Selenium envía JSON con resultados de tests del framework en `/sessions`).

## Contexto fijo

- **Cloud ID:** `c303d73b-75df-492e-9e64-479b722035cf`
- **Proyecto:** `NAA` — `bluestack-cms.atlassian.net`
- **Reporter default (Juanto):** `712020:59e4ac7b-f44f-45cb-a444-44746cecec49`
- **MCP:** configurado en `.mcp.json` (`@sooperset/mcp-atlassian`)

## Ambientes soportados

| Ambiente | `environment` | Header del comentario |
|----------|---------------|-----------------------|
| Master | `master` | `Se valida sobre **Master** los cambios aplicados:` |
| Dev_SAAS | `dev_saas` | `Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación [VERSION]:` |
| Cliente | `[nombre]` | `Se valida sobre **[NOMBRE]** los cambios aplicados:` |

> Para ambiente de cliente: usar el nombre tal como aparece en Labels de soporte.
> Si el ambiente no es claro, preguntar antes de proceder.

---

## ⚠ REGLA MANDATORIA: Formato ADF en todo contenido rich text

> **NUNCA usar `contentFormat: "markdown"`.**
> Siempre `contentFormat: "adf"` con el contenido como objeto ADF JSON.

**Por qué:** Los tools MCP de Atlassian double-escapean `\n` en strings markdown,
produciendo `\\n` literal en Jira. Aplica a `description`, `comment`, y cualquier campo
rich text custom.

**Cómo:** Redactar el contenido en markdown mentalmente → convertir a ADF JSON →
ver [`references/adf-format-guide.md`](references/adf-format-guide.md) para nodos y ejemplos.

**Validación pre-envío:**
- `contentFormat` == `"adf"` (nunca `"markdown"`)
- Campo rich text es un **objeto JSON** `{ "type": "doc", "version": 1, ... }`
- Sin `\n` literales en strings — los saltos son nodos ADF separados

---

## MODO A — Crear ticket nuevo

### A1: Recolectar inputs
Extraer del mensaje o del payload: descripción del bug, Front/Back, componente, ambiente,
épica padre, prioridad.

**Assignee por contexto:**
| Área | Assignee | accountId |
|------|----------|-----------|
| Angular / UI | Paula Rodriguez | `633b5c898b75455be4580f5b` |
| Backend / API / Java | Verónica Tarletta | `5c51d02898c1ac41b4329be3` |
| CKEditor / rich text | Claudia Tobares | `5c1d65c775b0e95216e8e175` |
| Ambiguo | Preguntar | — |

Ver [`references/field-map.md`](references/field-map.md) para prioridades, issue types y épicas.

### A2: Construir summary
```
[COMPONENTE EN MAYUS] - [Descripción breve del problema]
```
Ejemplos:
- `CREACION NOTA IA - Genera una nota sobre la cumbre de la IA y no sobre el prompt inyectado`
- `VIDEOS - El modal de upload no muestra el progreso de la subida`

### A3: Construir descripción (ADF)
Secciones en orden:
1. **Resumen** (h3 + párrafo)
2. **Contexto** (h3 + párrafo) — ambiente, URL, versión, `test_file` si viene de automation
3. **Pasos para reproducir** (h3 + orderedList) — o "Ejecutar `npm run test:dev -- [suite]`"
4. **Resultado actual** (h3 + párrafo + `codeBlock` si hay stacktrace)
5. **Resultado esperado** (h3 + párrafo)
6. **Criterios de aceptación** (h3 + bulletList)
7. **Otra información** (h3 + codeBlock) — logs, `log_excerpt`, referencias

Ver [`references/adf-format-guide.md`](references/adf-format-guide.md) → "Ejemplo completo: Descripción de ticket".

### A4: Ejecutar createJiraIssue
```json
{
  "cloudId": "c303d73b-75df-492e-9e64-479b722035cf",
  "projectKey": "NAA",
  "issueTypeName": "QA Bug - Back | QA Bug - Front",
  "summary": "...",
  "description": { "type": "doc", "version": 1, "content": [ ...nodos ADF... ] },
  "contentFormat": "adf",
  "assignee_account_id": "...",
  "additional_fields": {
    "priority": { "name": "..." },
    "customfield_10061": ["COMPONENTE"],
    "parent": { "key": "NAA-XXXX" }
  }
}
```

### A5: Post-creación
- Mostrar key y URL: `https://bluestack-cms.atlassian.net/browse/NAA-XXXX`
- Si viene de Dev_SAAS con ✘ → linkear al ticket original (MODO D)

---

## MODO B — Comentario de validación en Master

### Cuándo usar
El usuario dice "validé sobre master" o el pipeline envía `operation: "validate_master"`.

### B1: Clasificar resultado y construir comentario

**Todos ✔:**
```
Se valida sobre **Master** los cambios aplicados:
* [caso] ✔
Se ve bien! Podemos pasar **a versionar** ! @[dev]
```

**Al menos un ✘:**
```
Se valida sobre **Master** los cambios aplicados:
* [caso OK] ✔
* [caso con error] ✘
  > [Detalle del error — en línea aparte. Puede incluir URL, versión, condiciones.]
Quedan observaciones. @[dev] por favor revisar los ítems marcados con ✘
```

**Reglas estrictas:**
- ✔/✘ **siempre al final** del bullet, nunca al principio
- Si hay ✘: el detalle va **en línea aparte** indentada con `>`
- `"Se ve bien!..."` **solo** cuando todos los casos son ✔
- Para resultados de pipeline: agregar al pie `_Suite: [test_suite] — Archivo: [test_file]_`

### B2: Postear y transicionar
1. `addCommentToJiraIssue` con `contentFormat: "adf"`
2. Todos ✔ → `transitionJiraIssue` `transition.id: "42"` (A Versionar)
3. Algún ✘ → `transitionJiraIssue` `transition.id: "2"` (FEEDBACK)

Ver [`references/comment-examples.md`](references/comment-examples.md) para ejemplos ADF completos.

---

## MODO C — Validación en Dev_SAAS

### Cuándo usar
El usuario menciona "valido en dev_saas" o el pipeline envía `operation: "validate_devsaas"`.

### C1: Obtener casos de prueba (obligatorio antes de construir el comentario)
Invocar `jira-reader OP-3` sobre el ticket para extraer los bullets del comentario master previo.

### C2: Construir comentario
```
Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación [VERSION]:
Se tuvo en cuenta:
* [caso exacto del comentario master] ✔
```

**VERSION** es obligatoria — preguntar si no se especifica.
Los bullets vienen de los casos del comentario master; no se inventan nuevos.
El comentario no tiene cierre (termina en el último bullet).

### C3: Post-comentario
- Todos ✔ → `addComment` + `transitionJiraIssue` `transition.id: "31"` (Done)
- Algún ✘ → `addComment` sin transición + ir a MODO D por cada ✘

Ver [`references/devsaas-flow.md`](references/devsaas-flow.md) para flujo completo y ejemplos.

---

## MODO D — Error en Dev_SAAS → Crear ticket nuevo

**Regla del proyecto:** los errores en Dev_SAAS no se corrigen sobre el ticket original.
Por cada bullet con ✘: crear ticket nuevo + linkear + comentar en el original.

### D1: Crear ticket por cada ✘
- **Summary:** `[COMPONENTE] - [caso que falló] (detectado en Dev_SAAS pre-liberación [VERSION])`
- **Hereda del original:** épica, assignee, prioridad mínima `High`, componente
- **Descripción:** referencia al original + caso + error + pasos en Dev_SAAS

### D2: Linkear (`createIssueLink` con type `"Relates"`)

### D3: Comentar en el ticket original (sin transicionarlo)
- Informar el hallazgo y el nuevo ticket creado
- bullet con ✘ + blockquote con el detalle

Ver [`references/devsaas-flow.md`](references/devsaas-flow.md) para pasos detallados.

---

## MODO E — Basar ticket en uno existente

Si el usuario menciona "basate en el NAA-XXXX" o "dividí el NAA-XXXX":

1. `jira-reader OP-1` para leer el ticket fuente
2. Heredar: épica, assignee, prioridad, `customfield_10061`
3. Adaptar summary y descripción al nuevo hallazgo
4. Linkear con `Relates` al ticket fuente
5. Continuar desde A4

---

## MODO F — Input automatizado del pipeline de tests Selenium

### Cuándo usar
El pipeline automatizado envía un JSON estructurado con resultados de tests del framework
(archivos en `/sessions`). Sin intervención humana. El skill parsea el objeto y ejecuta
las operaciones Jira correspondientes.

Ver [`references/pipeline-schema.md`](references/pipeline-schema.md) para el schema completo de input/output.

### F1: Parsear y validar el payload
Campos obligatorios mínimos: `operation`, `ticket_key`, `test_results[]`.
Si alguno falta → retornar output de error estructurado (ver pipeline-schema.md → Output).

### F2: Routing por `operation`

| `operation` | Flujo | Notas |
|-------------|-------|-------|
| `validate_master` | MODO B | Mapear test_results a bullets Juanto-style |
| `validate_devsaas` | MODO C + MODO D | Leer casos master vía jira-reader OP-3 primero |
| `create_bug` | MODO A | Poblar descripción con datos técnicos del test |
| `add_observation` | Solo comentar | Sin transición de estado |

### F3: Mapeo de test_results a comentario

Para cada `test_result`:
- `description` → texto del bullet
- `result` (`✔` / `✘`) → al final del bullet
- `error_message` → blockquote bajo el bullet ✘
- `stacktrace` → nodo `codeBlock` dentro del blockquote (primeras 5-8 líneas)
- `environment_url` → incluir en el error como referencia

Agregar al pie del comentario para trazabilidad:
- `_Suite: [test_suite] — Archivo: [test_file]_` (si están presentes)

### F4: Crear bug desde test fallido (operation = create_bug)

Summary: `[COMPONENTE] - [test_name]: [resumen del error en ≤10 palabras]`

Descripción ADF poblada automáticamente:
- **Contexto:** `environment`, `environment_url`, `test_suite`, `test_file`
- **Resultado actual:** `error_message` + `stacktrace` en `codeBlock`
- **Resultado esperado:** `description` del test case
- **Pasos:** `"Ejecutar npm run test:dev -- [test_suite]"` si no vienen en el payload
- **Otra información:** `log_excerpt`, `duration_ms` del test

Prioridad automática: `High` si `environment == dev_saas` o cliente; `Medium` para master.

### F5: Output al pipeline
Generar siempre el objeto de respuesta al terminar.
Ver [`references/pipeline-schema.md`](references/pipeline-schema.md) → Output Schema.

---

## Operaciones Jira disponibles

| Acción | Tool MCP |
|--------|----------|
| Crear ticket | `createJiraIssue` |
| Editar ticket | `editJiraIssue` |
| Agregar comentario | `addCommentToJiraIssue` |
| Transicionar estado | `transitionJiraIssue` |
| Linkear tickets | `createIssueLink` |
| Lookup usuario | `lookupJiraAccountId` |

---

## Exception handlers

| Caso | Acción |
|------|--------|
| Falta `prerelease_version` para Dev_SAAS | Preguntar antes de continuar |
| Assignee ambiguo (Front y Back mezclados) | Preguntar explícitamente |
| Sin comentario de validación master previo | Avisar y pedir los casos manualmente |
| Ticket base no encontrado | Informar y pedir el key correcto |
| Transición no permitida para el estado actual | Reportar estado + `getTransitionsForJiraIssue` |
| Campo rich text es string en vez de objeto ADF | **Bloquear** — reconstruir como ADF JSON |
| `contentFormat` es `"markdown"` | **Bloquear** — cambiar a `"adf"` y reconstruir |
| Payload automatizado con campos faltantes | Retornar output de error estructurado |
| Ambiente de cliente no reconocido | Usar el nombre literal sin transformación |

---

## Referencias

- [`references/adf-format-guide.md`](references/adf-format-guide.md) → **[MANDATORIO]** Nodos ADF, ejemplos completos, checklist pre-envío
- [`references/field-map.md`](references/field-map.md) → issue types, prioridades, campos custom, accountIds, épicas
- [`references/comment-examples.md`](references/comment-examples.md) → ejemplos reales (master, dev_saas, automation)
- [`references/devsaas-flow.md`](references/devsaas-flow.md) → flujo Dev_SAAS completo, pasos D1-D3, ejemplos
- [`references/pipeline-schema.md`](references/pipeline-schema.md) → schema input/output para integración automatizada
- **jira-reader** → skill de lectura del que depende este skill