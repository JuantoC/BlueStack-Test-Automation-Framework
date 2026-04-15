---
source: .claude/skills/jira-writer/references/devsaas-flow.md
last-updated: 2026-04-14
---

# Flujo Dev_SAAS — Referencia completa

## Qué es Dev_SAAS

Dev_SAAS es el ambiente pre-productivo (réplica de producción) donde se validan los cambios
antes de la liberación a los clientes. Es la última barrera de calidad antes de que los
cambios lleguen a producción real.

**Regla fundamental del flujo Dev_SAAS:**
- Validación exitosa → cierra el ticket (Done)
- Error encontrado → NO se corrige sobre el ticket original (ya está en estado "A Versionar")
  → Se crea un ticket nuevo por cada bullet con ✘ y se linkea al original

---

## Ambientes en el proyecto

| Ambiente | Header del comentario | Cuándo |
|----------|-----------------------|--------|
| Master | `Se valida sobre **Master** los cambios aplicados:` | Validación QA inicial |
| Dev_SAAS | `Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación [VERSION]:` | Pre-liberación |
| Cliente específico | `Se valida sobre **[NOMBRE-CLIENTE]** los cambios aplicados:` | Soporte dedicado |

---

## Flujo completo Dev_SAAS

```
[Ticket en "A Versionar"]
         ↓
  OP-3 de jira-reader
  (extraer casos del comentario master)
         ↓
  Construir comentario Dev_SAAS
  con los mismos bullets
         ↓
  ¿Todos ✔?
  ┌──────────────────────┐
  │   SÍ          NO     │
  └──────────────────────┘
      ↓               ↓
  addComment      addComment
  transition 31   (sin transición)
  (Done)               ↓
                  Por cada ✘:
                  crear ticket nuevo
                  linkear "Relates"
                  comentar en original
```

---

## PASO C1: Obtener casos de prueba del comentario master

Invocar `jira-reader OP-3` sobre el ticket objetivo. Extrae los bullets del comentario
de validación en Master más reciente escrito por Juanto.

**Resultado esperado de OP-3:**
```json
{
  "ticket_key": "NAA-XXXX",
  "validated_env": "master",
  "test_cases": [
    { "description": "El enlace Editar Noticia funciona correctamente al copiar una noticia", "result": "✔" },
    { "description": "El enlace mantiene su funcionamiento al copiar a otra publicación", "result": "✔" }
  ]
}
```

> Si hay múltiples comentarios de validación master, usar el más reciente.
> Si no hay comentario master → no es posible proceder con Dev_SAAS. Avisar al usuario.

---

## PASO C2: Construir el comentario Dev_SAAS

**Formato exacto:**
```
Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación [VERSION]:
Se tuvo en cuenta:

* [caso exacto del comentario master] ✔
* [caso exacto del comentario master] ✔
```

**Reglas específicas:**
- **VERSION** es obligatoria (ej. `8.6.16.1.5`). Si el usuario no la provee, preguntar.
- Los bullets son **exactamente** los mismos que los del comentario master — no se inventan
  variaciones ni se adaptan.
- El comentario **no tiene cierre** — termina en el último bullet (sin "Se ve bien!").
- Para orquestador automatizado: el resultado de cada bullet puede diferir del master (algunos
  que pasaron en master pueden fallar en Dev_SAAS). Actualizar ✔/✘ según el resultado real.

---

## PASO C3: Post-comentario

```json
// Postear comentario
addCommentToJiraIssue:
  issueIdOrKey: "NAA-XXXX"
  comment: { ...ADF object... }
  contentFormat: "adf"

// Si todos ✔:
transitionJiraIssue:
  issueIdOrKey: "NAA-XXXX"
  transition: { "id": "31" }  // → Done

// Si hay ✘: NO transicionar → ir a PASO D1
```

---

## PASO D1: Crear ticket nuevo por cada ✘

**Summary:**
```
[COMPONENTE] - [descripción del caso que falló] (detectado en Dev_SAAS pre-liberación [VERSION])
```

**Descripción ADF — secciones:**
1. **Resumen:** "Este ticket surge del error detectado durante la validación en Dev_SAAS del ticket [NAA-ORIGINAL]"
2. **Contexto:** ambiente Dev_SAAS, versión, URL del ambiente si disponible
3. **Pasos para reproducir:** pasos específicos en el ambiente Dev_SAAS
4. **Resultado actual:** descripción del error + stacktrace si viene del orquestador
5. **Resultado esperado:** descripción del caso de prueba del ticket original
6. **Otra información:** referencia al ticket original, log_excerpt si disponible

**Campos heredados del ticket original (leer con jira-reader OP-1):**
- `issueType`: mismo que el original (o QA Bug si aplica)
- `assignee`: mismo que el original
- `parent` (épica): mismo que el original
- `customfield_10061`: mismo componente

**Prioridad:** al menos `High` — es un error en pre-producción.

---

## PASO D2: Linkear al ticket original

```json
createIssueLink:
  type: "Relates"
  inwardIssue: { "key": "NAA-NUEVO" }
  outwardIssue: { "key": "NAA-ORIGINAL" }
```

---

## PASO D3: Comentar en el ticket original

Agregar un comentario en el ticket original informando el error. El ticket original
**no se transiciona** (ya está en "A Versionar" o "Done").

**Contenido del comentario:**
```
Se detectó un error durante la validación en **Dev_SAAS** para la preliberación [VERSION].
Se creó el ticket [NAA-NUEVO] para su corrección.

* [caso que falló] ✘
  > [detalle del error]
```

---

## Ejemplos reales

### Dev_SAAS exitosa (NAA-3777)

```markdown
Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación 8.6.13 y 8.6.14.x:
Se tuvo en cuenta:

* El enlace "Editar Noticia" funciona correctamente al copiar o transcribir una noticia. ✔
* El enlace mantiene su funcionamiento también cuando la noticia se copia a una publicación diferente a la actual. ✔
```
→ Transición: `31` (Done)

---

### Dev_SAAS con error (NAA-3777 hipotético)

**Comentario en ticket original:**
```markdown
Se detectó un error durante la validación en **Dev_SAAS** para la preliberación 8.6.16.1.5.
Se creó el ticket NAA-4460 para su corrección.

* El enlace mantiene su funcionamiento al copiar a otra publicación ✘
  > En Dev_SAAS el enlace devuelve 404 cuando la noticia se copia a una publicación diferente.
  > Se reproduce en la preliberación 8.6.16.1.5 con cualquier noticia que se copie.
```
→ El ticket original **no se transiciona**. Se crea NAA-4460 y se linkea con "Relates".

---

## Uso desde el agente orquestador

Cuando el qa-orchestrator envía `operation: "validate_devsaas"`:

1. Invocar `jira-reader OP-3` sobre `ticket_key` para extraer los casos del comentario master
2. Cruzar esos casos con los `test_results` del payload del orquestador
3. Para cada test_result, determinar si el caso pasó ✔ o falló ✘
4. Construir el comentario Dev_SAAS con los resultados actualizados
5. Si todos ✔ → transicionar a Done
6. Si hay ✘ → crear nuevos tickets (PASO D1) con los datos técnicos del orquestador

El qa-orchestrator puede proveer en cada `test_result` datos adicionales (`error_message`, `stacktrace`,
`environment_url`) que enriquecen los tickets de error creados automáticamente.
