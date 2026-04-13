---
name: jira-writer
description: >
  Crea tickets y escribe comentarios de validación QA en el proyecto NAA de Bluestack,
  siguiendo las convenciones del equipo. Usar siempre que se necesite: crear un QA Bug
  (Front o Back), escribir un comentario de validación sobre Master o Dev_SAAS, reportar
  un hallazgo, ticketear un bug, comentar resultado de una validación, transicionar el
  estado de un ticket, o linkear tickets relacionados.
  Se activa con frases como: "creá un ticket", "levantá un bug", "comentá la validación",
  "validé sobre master", "validé en dev_saas", "el ticket tiene errores", "pasá a versionar",
  "linkeá con", "basate en el NAA-XXXX", "hay un error en el caso de prueba X".
  Depende de jira-reader para leer contexto previo cuando se necesita.
---

# jira-writer

Skill de **escritura** para el proyecto NAA. Crea tickets, postea comentarios y transiciona
estados siguiendo las convenciones del equipo de QA de Bluestack.

## Contexto fijo

- **Cloud ID:** `c303d73b-75df-492e-9e64-479b722035cf`
- **Proyecto:** `NAA`
- **Reporter default (Juanto):** `712020:59e4ac7b-f44f-45cb-a444-44746cecec49`
- **Ambientes:** `master` = entorno de desarrollo y pruebas | `Dev_SAAS` = pre-productivo (replica prod)

---

## ⚠ REGLA MANDATORIA: Formato ADF para todo contenido enriquecido

> **NUNCA usar `contentFormat: "markdown"` en ninguna operación de escritura.**
> Siempre usar `contentFormat: "adf"` con el contenido como objeto ADF JSON.

**Causa:** Los tools MCP de Atlassian double-escapean los `\n` cuando reciben strings
markdown, resultando en `\\n` literal renderizado en Jira. Esto aplica a `createJiraIssue`,
`editJiraIssue`, y `addCommentToJiraIssue`.

**Regla universal — aplica a TODOS los campos de texto enriquecido:**
- `description` en `createJiraIssue` y `editJiraIssue`
- `comment` en `addCommentToJiraIssue`
- Cualquier campo custom de tipo rich text

**Cómo construir ADF:**
1. Redactar mentalmente el contenido en markdown
2. Convertirlo a ADF JSON siguiendo la guía en `references/adf-format-guide.md`
3. Pasar el objeto ADF como valor del campo, con `contentFormat: "adf"`

**Validación pre-envío:** Antes de invocar cualquier tool de escritura, verificar que:
- El parámetro `contentFormat` es `"adf"` (nunca `"markdown"`)
- El valor del campo rich text es un **objeto JSON** (no un string)
- El objeto tiene `"type": "doc", "version": 1`
- No hay strings con `\n` literal — los saltos de línea se expresan como nodos ADF separados

---

## MODO A — Crear ticket nuevo

### A1: Recolectar inputs del prompt del usuario
Extraer del mensaje:
- Descripción del bug/hallazgo
- ¿Front (Angular/UI) o Back (servicio/API/Java)? → determina issueType
- Componente afectado (inferir o preguntar)
- Ambiente donde se detectó
- Épica padre (si se menciona)
- Prioridad (inferir por severidad)

**Reglas de assignee:**
| Contexto | Assignee | accountId |
|----------|----------|-----------|
| Angular, UI, componente visual | Paula Rodriguez | `633b5c898b75455be4580f5b` |
| Backend, API, servicio Java | Verónica Tarletta | `5c51d02898c1ac41b4329be3` |
| CKEditor, rich text, editor | Claudia Tobares | `5c1d65c775b0e95216e8e175` |
| Ambiguo | Preguntar al usuario | — |

**Reglas de prioridad:**
| Situación | Prioridad |
|-----------|-----------|
| Producción caída / bloqueante total | `Critical production site` |
| Bloquea el sprint actual | `Critical path development` |
| Afecta prod con workaround | `Normal production site` |
| Sin indicación especial | `Medium` |

### A2: Construir summary
Formato convencional del proyecto:
```
[COMPONENTE EN MAYUS] - [Descripción breve del problema]
```
Ejemplos reales:
- `CREACION NOTA IA - Genera una nota sobre la cumbre de la IA y no sobre el prompt inyectado`
- `ERROR parseando JSON de IA - Cuando recibo respuesta con Markdown`
- `Error al ENTRAR al admin - Server unavailable /admin`

### A3: Construir descripción (ADF)

La descripción sigue esta estructura lógica (el contenido se expresa como ADF JSON,
ver `references/adf-format-guide.md` para la referencia completa de nodos):

**Secciones de la descripción:**
1. **Resumen** (heading h3 + párrafo) — Una oración que describe el problema
2. **Contexto** (heading h3 + párrafo/lista) — Condiciones, ambiente, versión, URL
3. **Pasos para reproducir** (heading h3 + orderedList) — Pasos numerados
4. **Resultado actual** (heading h3 + párrafo) — Qué sucede
5. **Resultado esperado** (heading h3 + párrafo) — Qué debería suceder
6. **Criterios de aceptación** (heading h3 + bulletList) — Bullets con criterios
7. **Otra información** (heading h3 + párrafo/codeBlock) — Logs, referencias, opcional

> Si hay logs o stacktraces: incluirlos en nodo `codeBlock` dentro de "Otra información".
> Si se toma como base un ticket existente (MODO E): leerlo con jira-reader OP-1 primero.

### A4: Ejecutar createJiraIssue
```json
{
  "cloudId": "c303d73b-75df-492e-9e64-479b722035cf",
  "projectKey": "NAA",
  "issueTypeName": "QA Bug - Back | QA Bug - Front | ...",
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

> ⚠ `description` es un **objeto JSON ADF**, nunca un string.
> ⚠ `contentFormat` es siempre `"adf"`, nunca `"markdown"`.

### A5: Post-creación
1. Mostrar el key generado y URL: `https://bluestack-cms.atlassian.net/browse/NAA-XXXX`
2. Si el ticket viene de un error en Dev_SAAS → linkear al ticket original (ver MODO D)

---

## MODO B — Comentario de validación en Master

### Cuándo usar
El usuario dice algo como: "validé sobre master", "verifiqué en master", "los cambios se ven bien".

### B1: Clasificar resultado

**Todos los casos ✔:**
```markdown
Se valida sobre **Master** los cambios aplicados:

* [Descripción del caso de prueba] ✔
* [Descripción del caso de prueba] ✔

Se ve bien! Podemos pasar **a versionar** ! @[dev responsable]
```

**Al menos un caso ✘:**
```markdown
Se valida sobre **Master** los cambios aplicados:

* [Descripción del caso OK] ✔
* [Descripción del caso con error] ✘
  > [Descripción detallada del error. Nunca inline con el bullet. Puede incluir URL,
  > versión afectada, condiciones de reproducción.]

Quedan observaciones. @[dev responsable] por favor revisar los ítems marcados con ✘
```

**Reglas estrictas del formato:**
- ✔/✘ **siempre al final** del bullet, nunca al principio
- Si hay ✘: la descripción extendida del error va en **línea aparte indentada** con `>`
- `"Se ve bien!..."` **solo** cuando todos los casos son ✔ — si hay algún ✘, suprimir esta línea
- La mención `@nombre` va siempre al final del cierre
- Si hay logs: agregarlos en bloque de código después del `>`

### B2: Postear y transicionar
1. `addCommentToJiraIssue` con `contentFormat: "adf"` y body como objeto ADF JSON
2. **Si todos ✔** → `transitionJiraIssue` con `transition.id: "42"` (→ A Versionar)
3. **Si hay ✘** → `transitionJiraIssue` con `transition.id: "2"` (→ FEEDBACK)

> El comentario se construye como ADF: heading/párrafo para el header, bulletList para los
> casos de prueba, párrafo para el cierre. Ver `references/adf-format-guide.md` para nodos.

---

## MODO C — Comentario de validación en Dev_SAAS (pre-liberación)

### Cuándo usar
El usuario menciona: "valido en dev_saas", "pre-liberación", "ambiente pre-prod", o
se está gestionando la liberación de un ticket que ya estaba en "A Versionar".

### C1: Obtener casos de prueba del ticket
**Este paso es obligatorio antes de escribir el comentario.**

Invocar `jira-reader OP-3` sobre el ticket para extraer los bullets del comentario
de validación en Master previamente escrito por Juanto.

Si el ticket tiene múltiples comentarios de validación, tomar **el más reciente**.

### C2: Construir comentario (versión pre-productiva)
Formato exacto observado en el proyecto (extraído de NAA-3777):

```markdown
Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación [VERSION]:
Se tuvo en cuenta:

* [Caso de prueba exacto del comentario master] ✔
* [Caso de prueba exacto del comentario master] ✔
```

**Reglas específicas de Dev_SAAS:**
- El header es **"Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación [VERSION]:"**
- **VERSION** = versión del pre-productivo que se está probando (ej. `8.6.16.1.5`)
  → Si el usuario no la especifica, preguntar antes de proceder
- Los bullets vienen **directamente de los casos de prueba del comentario master**,
  no se inventan nuevos ni se agregan variaciones
- **No hay mensaje de "Se ve bien!" en el cierre de Dev_SAAS** — el comentario cierra
  con el último bullet
- Si **todos ✔**: postear el comentario y transicionar a **Done** (`transition.id: "31"`)
- Si hay **✘ en Dev_SAAS**: NO se corrige sobre el mismo ticket (ya está cerrado).
  → Ir a MODO D para cada bullet con error

### C3: Post-validación Dev_SAAS exitosa
1. `addCommentToJiraIssue` con `contentFormat: "adf"` y body como objeto ADF JSON
2. `transitionJiraIssue` con `transition.id: "31"` (→ Done)

---

## MODO D — Error encontrado en Dev_SAAS → Crear ticket nuevo

### Cuándo usar
Cuando en una validación Dev_SAAS (MODO C) uno o más bullets resultan ✘.

**Regla del proyecto:** Los errores en Dev_SAAS no se corrigen sobre el ticket original
(ya cerrado/versioning). Se abre un ticket nuevo por cada bullet con error.

### D1: Por cada bullet con ✘ crear un ticket nuevo

El nuevo ticket debe:
1. **Summary:** `[COMPONENTE] - [descripción del caso de prueba que falló] (detectado en Dev_SAAS pre-liberación [VERSION])`
2. **Descripción:** incluir
   - Referencia al ticket original: "Este ticket surge del error detectado durante la validación en Dev_SAAS del ticket [NAA-ORIGINAL]"
   - Caso de prueba exacto que falló
   - Descripción detallada del error
   - Pasos para reproducir en Dev_SAAS
3. **issueType:** mismo tipo que el ticket original (o QA Bug si aplica)
4. **Assignee:** mismo que el ticket original
5. **Épica:** misma que el ticket original
6. **Prioridad:** al menos `High` (es un error en pre-prod)

### D2: Linkear al ticket original
```
createIssueLink: type "Relates" 
  inwardIssue: NAA-NUEVO
  outwardIssue: NAA-ORIGINAL
```

### D3: En el ticket original
Agregar un comentario con `contentFormat: "adf"` (construido como ADF JSON):

**Estructura lógica del comentario:**
- Párrafo: "Se detectó un error durante la validación en **Dev_SAAS** para la preliberación [VERSION]."
- Párrafo: "Se creó el ticket [NAA-NUEVO] para su corrección."
- bulletList con el caso que falló (✘) y blockquote con detalle del error

No transicionar el ticket original (ya está en estado "A Versionar" o "Done").

---

## MODO E — Basar ticket en uno existente

Si el usuario menciona "basate en el NAA-XXXX" o "dividí el NAA-XXXX":

1. Invocar `jira-reader OP-1` para leer el ticket fuente
2. Heredar: épica padre, assignee, prioridad, componente (`customfield_10061`)
3. Adaptar summary y descripción al nuevo hallazgo/scope
4. Linkear con `Relates` al ticket fuente
5. Proceder como MODO A a partir del paso A4

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

## Output contract (para integración multi-agente)

Cuando `jira-writer` es invocado por otro agente (ej. un agente de automatización de pruebas
que envía resultados), el input esperado es:

```json
{
  "schema_version": "1.0",
  "source_agent": "test-automation | ci-pipeline | manual",
  "operation": "create_ticket | post_validation_comment | post_devsaas_comment | create_devsaas_error_ticket",
  "ticket_key": "NAA-XXXX",
  "environment": "master | dev_saas",
  "prerelease_version": "8.6.16.1.5",
  "test_results": [
    { "description": "Descripción del caso de prueba", "result": "✔ | ✘", "detail": "Detalle si ✘" }
  ],
  "assignee_hint": "backend | frontend | editor",
  "component": "AI | Editor | Planning | ...",
  "epic_key": "NAA-XXXX"
}
```

Este contrato permite que pipelines de CI/CD o agentes de automatización envíen
resultados estructurados para que `jira-writer` genere los artefactos Jira correspondientes
sin intervención manual.

---

## Exception handlers

| Caso | Acción |
|------|--------|
| Falta la versión para Dev_SAAS | Preguntar antes de continuar |
| Assignee ambiguo (Front y Back mezclados) | Preguntar explícitamente |
| No hay comentario de validación Master previo | Avisar y pedir los casos de prueba manualmente |
| Ticket base no encontrado | Informar y pedir el key correcto |
| Error al transicionar (estado no permite la transición) | Reportar el estado actual e intentar `getTransitionsForJiraIssue` para ver disponibles |
| Campo rich text es un string en vez de objeto ADF | **BLOQUEAR** — no enviar. Reconstruir como ADF JSON antes de continuar |
| `contentFormat` es `"markdown"` | **BLOQUEAR** — cambiar a `"adf"` y reconstruir el contenido como ADF |

---

## Referencias

- `references/adf-format-guide.md` → **[MANDATORIO]** Guía de construcción ADF para todos los campos rich text
- `references/field-map.md` → campos custom, prioridades, issue types, accountIds
- `references/comment-examples.md` → ejemplos reales de comentarios del proyecto
- `references/devsaas-flow.md` → flujo completo de validación Dev_SAAS con ejemplos
- **jira-reader** → skill de lectura del que depende este skill
