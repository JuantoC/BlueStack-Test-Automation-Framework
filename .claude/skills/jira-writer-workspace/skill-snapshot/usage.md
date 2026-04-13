# Ejemplos de uso — jira-writer

> **⚠ FORMATO:** Los contenidos de descripción y comentarios se muestran en markdown
> para legibilidad. Al ejecutar, SIEMPRE convertir a ADF JSON con `contentFormat: "adf"`.
> Ver `references/adf-format-guide.md`.

## Ejemplo 1: Crear QA Bug de back

**Input:**
> "Levantá un QA Bug de back en el componente AI. En dev_saas, el endpoint
> `/planning/activity/get` no devuelve los eventos manuales recién creados. Siempre reproducible.
> Prioridad crítica para el sprint."

**Flujo:**
- MODO A → issueType: `QA Bug - Back`, assignee: Verónica, priority: `Critical path development`
- summary: `PLANNING - Error al traer los eventos manuales después de su creación`
- Componente: `Planning`

---

## Ejemplo 2: Comentario de validación master exitosa

**Input:**
> "Comentá en NAA-4444 que validé sobre master. Los eventos manuales ya aparecen
> correctamente. El orden de los eventos también es el correcto."

**Output comentario:**
```markdown
Se valida sobre **Master** los cambios aplicados:

* Los eventos manuales aparecen correctamente luego de su creación ✔
* El orden de los eventos es el correcto ✔

Se ve bien! Podemos pasar **a versionar** ! @Verónica Tarletta
```
→ Post: transición `42` (A Versionar)

---

## Ejemplo 3: Comentario de validación en Dev_SAAS

**Input:**
> "Validé en dev_saas para la pre-liberación 8.6.16.1.5 el ticket NAA-3777.
> Ambos casos de prueba pasaron bien."

**Flujo:**
1. `jira-reader OP-3` sobre NAA-3777 → extrae casos de prueba del comentario master
2. MODO C → construir comentario con los bullets extraídos

**Output comentario:**
```markdown
Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación 8.6.16.1.5:
Se tuvo en cuenta:

* El enlace "Editar Noticia" funciona correctamente al copiar o transcribir una noticia. ✔
* El enlace mantiene su funcionamiento también cuando la noticia se copia a una publicación diferente a la actual. ✔
```
→ Post: transición `31` (Done)

---

## Ejemplo 4: Error en Dev_SAAS → Ticket nuevo

**Input:**
> "Estaba validando NAA-3777 en dev_saas para la pre-liberación 8.6.16.1.5. El primer caso
> pasa bien, pero el segundo falla: cuando la noticia se copia a otra publicación, el enlace
> de Editar Noticia devuelve 404."

**Flujo:**
1. MODO C — bullet 2 tiene ✘
2. MODO D — crear NAA-NUEVO con:
   - summary: `LINKS - El enlace Editar Noticia devuelve 404 al copiar a otra publicación (detectado en Dev_SAAS pre-liberación 8.6.16.1.5)`
   - descripción: origen en NAA-3777, detalle del error
   - link "Relates" → NAA-3777
3. Comentar en NAA-3777 el hallazgo

---

## Ejemplo 5: Agente externo enviando resultados (input estructurado)

Un agente de automatización puede enviar este JSON para que jira-writer actúe:

```json
{
  "schema_version": "1.0",
  "source_agent": "selenium-test-runner",
  "operation": "post_validation_comment",
  "ticket_key": "NAA-4444",
  "environment": "master",
  "test_results": [
    { "description": "Los eventos manuales aparecen correctamente", "result": "✔" },
    { "description": "El orden de los eventos es correcto", "result": "✔" }
  ],
  "assignee_hint": "backend"
}
```

`jira-writer` procesa el JSON, construye el comentario en formato Juanto, lo postea y
transiciona el ticket a "A Versionar".
