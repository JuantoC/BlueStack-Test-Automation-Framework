# Guía de formato ADF — Referencia obligatoria

> **REGLA:** Todo contenido rich text enviado a Jira DEBE ser un objeto ADF JSON.
> NUNCA usar `contentFormat: "markdown"`. SIEMPRE `contentFormat: "adf"`.

## Estructura base

Todo documento ADF empieza con:
```json
{
  "type": "doc",
  "version": 1,
  "content": [ ...nodos... ]
}
```

## Nodos disponibles

### Heading (encabezado)
```json
{ "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Título" }] }
```
Niveles: 1-6. En el proyecto se usa `level: 3` para secciones.

### Paragraph (párrafo)
```json
{ "type": "paragraph", "content": [{ "type": "text", "text": "Texto del párrafo." }] }
```

Párrafo con **negrita** y *cursiva*:
```json
{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Se valida sobre " },
    { "type": "text", "text": "Master", "marks": [{ "type": "strong" }] },
    { "type": "text", "text": " los cambios aplicados:" }
  ]
}
```

### bulletList (lista no ordenada)
```json
{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [
        { "type": "paragraph", "content": [{ "type": "text", "text": "Elemento 1 ✔" }] }
      ]
    },
    {
      "type": "listItem",
      "content": [
        { "type": "paragraph", "content": [{ "type": "text", "text": "Elemento 2 ✘" }] }
      ]
    }
  ]
}
```

### orderedList (lista numerada)
```json
{
  "type": "orderedList",
  "attrs": { "order": 1 },
  "content": [
    {
      "type": "listItem",
      "content": [
        { "type": "paragraph", "content": [{ "type": "text", "text": "Paso 1" }] }
      ]
    }
  ]
}
```

### Table (tabla)
```json
{
  "type": "table",
  "attrs": { "isNumberColumnEnabled": false, "layout": "default" },
  "content": [
    {
      "type": "tableRow",
      "content": [
        { "type": "tableHeader", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Col 1" }] }] },
        { "type": "tableHeader", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Col 2" }] }] }
      ]
    },
    {
      "type": "tableRow",
      "content": [
        { "type": "tableCell", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Valor 1" }] }] },
        { "type": "tableCell", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Valor 2" }] }] }
      ]
    }
  ]
}
```

### Blockquote (cita)
```json
{
  "type": "blockquote",
  "content": [
    { "type": "paragraph", "content": [{ "type": "text", "text": "Detalle del error..." }] }
  ]
}
```

### codeBlock (bloque de código)
```json
{
  "type": "codeBlock",
  "attrs": { "language": "json" },
  "content": [{ "type": "text", "text": "{ \"key\": \"value\" }" }]
}
```

### Mention (mención a usuario — genera notificación)
```json
{
  "type": "mention",
  "attrs": {
    "id": "ACCOUNT_ID",
    "text": "@Nombre",
    "accessLevel": ""
  }
}
```
> Las menciones van DENTRO de un nodo `paragraph`, como un nodo más del array `content`.

### Inline code (código en línea)
```json
{ "type": "text", "text": "variable", "marks": [{ "type": "code" }] }
```

## Text marks (modificadores de texto)

| Mark | JSON |
|------|------|
| Negrita | `"marks": [{ "type": "strong" }]` |
| Cursiva | `"marks": [{ "type": "em" }]` |
| Código inline | `"marks": [{ "type": "code" }]` |
| Link | `"marks": [{ "type": "link", "attrs": { "href": "URL" } }]` |
| Tachado | `"marks": [{ "type": "strike" }]` |

Se pueden combinar: `"marks": [{ "type": "strong" }, { "type": "em" }]`

## Ejemplo completo: Comentario de validación Master (todos ✔)

```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Se valida sobre " },
        { "type": "text", "text": "Master", "marks": [{ "type": "strong" }] },
        { "type": "text", "text": " los cambios aplicados:" }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            { "type": "paragraph", "content": [{ "type": "text", "text": "El error de parseo JSON no se presenta ✔" }] }
          ]
        },
        {
          "type": "listItem",
          "content": [
            { "type": "paragraph", "content": [{ "type": "text", "text": "La nota se genera con el prompt correcto ✔" }] }
          ]
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Se ve bien! Podemos pasar " },
        { "type": "text", "text": "a versionar", "marks": [{ "type": "strong" }] },
        { "type": "text", "text": " ! " },
        { "type": "mention", "attrs": { "id": "5c51d02898c1ac41b4329be3", "text": "@Verónica Tarletta", "accessLevel": "" } }
      ]
    }
  ]
}
```

## Ejemplo completo: Descripción de ticket (estructura QA Bug)

```json
{
  "type": "doc",
  "version": 1,
  "content": [
    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Resumen" }] },
    { "type": "paragraph", "content": [{ "type": "text", "text": "Descripción breve del problema." }] },
    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Contexto" }] },
    { "type": "paragraph", "content": [{ "type": "text", "text": "Ambiente, versión, condiciones." }] },
    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Pasos para reproducir" }] },
    {
      "type": "orderedList", "attrs": { "order": 1 },
      "content": [
        { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Paso 1" }] }] },
        { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Paso 2" }] }] }
      ]
    },
    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Resultado actual" }] },
    { "type": "paragraph", "content": [{ "type": "text", "text": "Qué sucede." }] },
    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Resultado esperado" }] },
    { "type": "paragraph", "content": [{ "type": "text", "text": "Qué debería suceder." }] },
    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Criterios de aceptación" }] },
    {
      "type": "bulletList",
      "content": [
        { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Criterio 1" }] }] },
        { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Criterio 2" }] }] }
      ]
    }
  ]
}
```

## Checklist pre-envío (OBLIGATORIO)

Antes de invocar `createJiraIssue`, `editJiraIssue` o `addCommentToJiraIssue`:

- [ ] `contentFormat` == `"adf"` (NUNCA `"markdown"`)
- [ ] Campo rich text es un **objeto JSON** con `"type": "doc"` (NUNCA un string)
- [ ] No hay `\n` literales dentro de strings de texto — los saltos son nodos ADF separados
- [ ] Las menciones usan nodo `mention` con `accountId` (no texto `@nombre`)
- [ ] Las negritas usan mark `strong` (no `**texto**` literal)
