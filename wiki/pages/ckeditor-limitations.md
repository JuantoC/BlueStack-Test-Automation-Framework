---
source: Limitación estructural del framework — sin source .ts asociado
last-updated: 2026-04-17
---

# CKEditor — Limitaciones del Framework

## Resumen

El framework BlueStack QA **no puede interactuar con la toolbar de CKEditor ni con sus plugins**.
Esta es una limitación estructural del driver Selenium en entornos con iframes CKEditor + widgets JavaScript complejos.

---

## Qué SÍ puede hacer el framework

| Operación | Método disponible |
|-----------|-------------------|
| Pegar texto en el área principal del editor | `sendKeys()` sobre el área content-editable |
| Borrar texto del área principal | `sendKeys(Key.CONTROL, 'a')` + `sendKeys(Key.DELETE)` |
| Leer el texto del área principal | `getText()` sobre el área content-editable |

---

## Qué NO puede hacer el framework

- Hacer click en botones de la toolbar de CKEditor (negrita, itálica, insertar link, etc.)
- Abrir el menú de inserción de plugins
- Insertar embeds via toolbar: Instagram, Twitter/X, TikTok, Pinterest
- Insertar componentes interactivos: Trivias, Encuestas, Audios
- Verificar que un plugin cargó correctamente (render del embed)
- Interactuar con widgets CKEditor post-inserción
- Verificar carga asincrónica de componentes que dependen del plugin

---

## Clasificación de tickets

Cualquier criterio de aceptación que requiera **interacción con la toolbar o plugins de CKEditor** se clasifica como:

```json
{
  "automatable": false,
  "reason_if_not": "ckeditor_plugin_interaction_not_supported"
}
```

### Keywords que identifican estos tickets

Los siguientes términos en título, descripción o criterios de aceptación de un ticket activan esta clasificación. **Esta lista es la misma que `post.not_automatable_components.keywords[]` en `test-map.json` — mantener sincronizadas.**

- `ckeditor plugin`
- `plugin toolbar`
- `instagram embed`
- `twitter embed`
- `tiktok embed`
- `pinterest embed`
- `trivias ckeditor`
- `encuesta ckeditor`
- `audio ckeditor`
- `pedidos cancelados ckeditor`
- `carga async componentes ckeditor`
- `enriquecedor texto`
- `plugins ckeditor`
- `async carga plugin`

> El pipeline ticket-analyst debe aplicar esta clasificación **antes** de intentar mapear el criterio a una session existente o generar un test nuevo.

---

## Referencia en test-map.json

Los componentes no automatizables por esta razón se registran en `not_automatable_components` del test-map:

Ver `.claude/pipelines/test-engine/references/test-map.json` → módulo `post` → campo `not_automatable_components[]`, entry con `"reason": "ckeditor_plugin_interaction_not_supported"`.

---

## Estado futuro

Se planea una integración directa con la API de CKEditor (JavaScript bridge via `JavascriptExecutor`).
Cuando esta integración esté implementada, los criterios actualmente clasificados como `non_automatable` por esta razón serán automatizables. El campo `reason_if_not` permitirá identificarlos fácilmente para re-clasificación.

---

## Ver también

- [pages/post-page.md](post-page.md) — API del editor de notas (lo que sí está implementado)
- [pages/modals.md](modals.md) — `CKEditorImageModal` (modal de imagen, sí automatizable)
- [qa/visual-validation.md](../qa/visual-validation.md) — Para criterios visual_check en el editor
