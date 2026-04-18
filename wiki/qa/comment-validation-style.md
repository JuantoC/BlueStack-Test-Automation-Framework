# Comment Validation Style — Jira QA

> Fuente canónica de las reglas tipográficas y de estructura para comentarios de validación en Jira. Referenciada por `jira-writer` SKILL.md y `test-reporter.md`.

## Reglas tipográficas (estilo Juanto)

| Regla | Correcto | Incorrecto |
|-------|----------|------------|
| Ambiente en negrita | `**Master**` / `**Dev_SAAS**` | `Master` / `dev_saas` |
| ✔/✘ al final del bullet | `descripción ✔` | `✔ descripción` |
| Detalle de error en línea aparte | `> detalle del error` bajo el bullet | inline en el mismo bullet |
| Cierre master OK | `Se ve bien! Podemos pasar **a versionar** !` | cualquier variante |
| Cierre master con error | `Quedan observaciones. @dev revisar...` | `Se ve bien!` con errores presentes |
| Cierre Dev_SAAS | sin cierre — termina en el último bullet | agregar "Se ve bien!" |
| Versión del app | incluir cuando sea relevante: `Versión: 8.7.1` | omitir si es conocida |
| Trazabilidad automation | incluir suite y archivo en pie del comentario | omitir si viene de pipeline |

## Estructura de comentario de validación en Master

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

**Para resultados de pipeline:** agregar al pie `_Suite: [test_suite] — Archivo: [test_file]_`

## Estructura de comentario de validación en Dev_SAAS

```
Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación [versión]:
Se tuvo en cuenta:
* [caso] ✔
* [caso con error] ✘
  > [Detalle]
```

Sin párrafo de cierre. Si hay ✘: se crea un ticket nuevo (MODO D) y se linkea con "Relates" al original. No se agrega "Se ve bien!".

## Estructura de escalación (criterios no automatizables)

Header fijo: `⚠️ Validación automática no disponible`

```
⚠️ Validación automática no disponible

Los criterios de este ticket son de tipo `visual_check` (...). Ninguno es automatizable
con Selenium. Se requiere validación manual.

### Criterios intentados
* **[Criterio]** — [razón concreta por la que no es automatizable con Selenium]
* ...

### Guía de testing manual

#### 1. [Nombre del criterio]
**Precondición:** [estado inicial necesario]
1. [Paso 1]
2. [Paso 2]
**✔ Resultado esperado:** [qué observar para dar por válido]

_⚠️ El ticket permanece en **Revisión** — validación manual requerida antes de transicionar._
```

**Reglas específicas de escalación:**
- `bulletList` en "Criterios intentados" con la razón por la que no es automatizable
- `heading level 4` por criterio en guía de testing + `orderedList` de pasos + párrafo de resultado esperado
- Cierre siempre en cursiva con `_⚠️ El ticket permanece en Revisión..._`
- No se transiciona el estado — `transition_applied: null`
- No se usa `blockquote` (no hay errores de tests)

## Mención al dev asignado

- **Obligatoria** en comentarios de cierre (`validate_master` y `validate_devsaas`)
- **No incluir** en comentarios de escalación (non_automatable, wrong_status, etc.)
- Formato: `@[nombre del asignado]`

## Acciones post-comentario por tipo

| Tipo | Transición | ID |
|------|-----------|-----|
| Master todos ✔ | A Versionar | `42` |
| Master algún ✘ | FEEDBACK | `2` |
| Dev_SAAS todos ✔ | Done | `31` |
| Dev_SAAS algún ✘ | Sin transición | — |
| Escalación / no automatizable | Sin transición | — |

## Ver también

- `.claude/skills/jira-writer/references/comment-examples.md` — ejemplos ADF reales validados en producción
- `.claude/skills/jira-writer/references/adf-format-guide.md` — guía de conversión a ADF JSON
- `wiki/qa/pipeline-routing.md` — lógica de routing que determina qué tipo de comentario se genera
