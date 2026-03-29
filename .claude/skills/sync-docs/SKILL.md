---
name: sync-docs
description: Sincroniza la documentación (JSDoc/TSDoc y `.md` contextuales) con el estado actual del código TypeScript tras uno o más commits. Genera sugerencias concretas de actualización sin aplicar ningún cambio automáticamente.
---

# Cuándo invocar
- Cuando el desarrollador diga "sincronizá la documentación", "revisá qué docs quedaron desactualizados"
- Cuando exista el archivo `.claude/pending-doc-review-prompt.md` generado por el post-commit hook
- Después de un refactor o cambio de firma en `src/pages/`, `src/core/` o `src/interfaces/`

---

# Instrucción de ejecución

## Paso 1 — Obtener el diff relevante
Si existe `.claude/pending-doc-review-prompt.md`, leerlo y usarlo como punto de partida.

Si no existe, obtener el diff del último commit:
```bash
git diff HEAD~1 HEAD -- '*.ts' '*.tsx'
```

## Paso 2 — Identificar cambios de contrato público
Del diff, identificar específicamente:
- Funciones o métodos con firma modificada en `src/pages/` o `src/core/`
- Interfaces o tipos modificados en `src/interfaces/`
- Exports nuevos o eliminados
- Cambios en constructores de Page Objects (especialmente la firma `driver, opts`)

## Paso 3 — Verificar JSDoc de los archivos afectados
Para cada cambio de contrato encontrado:
1. Leer el JSDoc actual del archivo `.ts` afectado
2. Verificar si el JSDoc refleja el estado nuevo de la firma
3. Verificar si los `@param`, `@returns` y `@throws` son consistentes con el código actual

## Paso 4 — Verificar `.md` relacionados
Revisar si alguno de estos archivos referencia el módulo modificado:
- `README.md` (sección "How to Write a New Test" o "Contributing & Guidelines")
- `.claude/CLAUDE.md`
- Cualquier archivo en `docs/` si existe

## Paso 5 — Escribir sugerencias
Crear o sobreescribir `.claude/doc-update-suggestions.md` con este formato:

**Encabezado:**
Fecha de generación, hash del commit analizado.

**Sección PRIORIDAD ALTA — JSDoc desactualizado:**
Por cada caso: archivo afectado, nombre de función/clase, descripción del problema, JSDoc propuesto.

**Sección PRIORIDAD MEDIA — .md con referencia desactualizada:**
Por cada caso: archivo afectado, sección, descripción del problema, cambio sugerido.

**Sección Sin cambios necesarios:**
Lista de archivos revisados que están OK.

## Paso 6 — Reportar y preguntar
Mostrar el resumen de sugerencias y preguntar: *"¿Aplicamos alguna de estas actualizaciones?"*

Aplicar **solo los cambios que el desarrollador confirme explícitamente**, uno por uno.

---

# Restricciones
- **Nunca aplicar cambios sin confirmación explícita**
- Si código y `.md` son inconsistentes, el código prevalece siempre
- No modificar archivos en `sessions/` — los tests son fuente de verdad de comportamiento
- No tocar `src/interfaces/data.ts` o `src/interfaces/auth.ts` sin que el desarrollador lo pida explícitamente

# Output esperado
- `.claude/doc-update-suggestions.md` — solo sugerencias, sin cambios aplicados