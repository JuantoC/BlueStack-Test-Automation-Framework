# Wiki Log

Registro de ingest, gaps detectados y cambios a la wiki.

---

## Formato de entrada

```
[YYYY-MM-DD] <tipo> | <descripción>
<detalle opcional>
```

Tipos: `ingest` | `gap` | `update` | `fix`

---

## Entradas

[2026-04-13] ingest | Bootstrap inicial
Páginas creadas: 16.
Gaps detectados: ninguno en el ingest inicial.
Directorios vacíos registrados:
- comment_page/ — 0 archivos .ts. No crear página wiki hasta que haya contenido.
- user_profile_page/ — 0 archivos .ts. No crear página wiki hasta que haya contenido.
Sub-componentes del video_editor_page con contenido vacío (1 línea):
- EditorInfoSection.ts
- EditorCategorySection.ts
- EditorImageSection.ts
- EditorRelatesSection.ts

---

## Regla de mantenimiento

Cuando modifiques cualquier archivo en `src/` o `sessions/`, actualizar la página wiki correspondiente en el mismo commit.
Si no sabés qué página corresponde, buscar en `wiki/index.md` por nombre de archivo o módulo.
Si no existe una página adecuada, crear una y agregar entrada `[gap]` aquí hasta completarla.
