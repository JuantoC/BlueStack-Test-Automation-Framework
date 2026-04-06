---
name: sync-docs
description: Sincroniza la documentación (JSDoc/TSDoc y `.md` contextuales) con el estado actual del código TypeScript tras uno o más commits. Genera sugerencias concretas de actualización sin aplicar ningún cambio automáticamente.
---

# CUANDO INVOCAR
- Cuando el desarrollador diga "sincronizá la documentación", "revisá qué docs quedaron desactualizados"
- Después de un refactor o cambio de firma en `src/pages/`, `src/core/` o `src/interfaces/`
- Automáticamente desde el Paso 10 de la skill `smart-commit`

---

# PASOS DE EJECUCIÓN

## Paso 1 — Obtener commits pendientes de revisión

Leer `.claude/pending-doc-updates.json` y filtrar entradas con `status` en `["pending", "prompt-generated"]`:

```bash
python3 -c "
import json
with open('.claude/pending-doc-updates.json') as f:
    data = json.load(f)
pending = [c for c in data['pendingCommits'] if c['status'] in ('pending', 'prompt-generated')]
for c in pending:
    print(c['hash'], '|', ' '.join(c['changedFiles']))
"
```

Para cada commit pendiente, obtener su diff sobre los archivos afectados:
```bash
git show <hash> -- <archivo1> <archivo2> ...
```

**Si no hay entradas pendientes:** informar y detener.
```
✅ No hay commits pendientes de revisión documental.
```

**Si `pending-doc-updates.json` no existe:** obtener el diff del último commit como fallback:
```bash
git diff HEAD~1 HEAD -- '*.ts' '*.tsx'
```

## Paso 2 — Identificar cambios de contrato público
Del diff de cada commit, identificar específicamente:
- Funciones o métodos con firma modificada en `src/pages/` o `src/core/`
- Interfaces o tipos modificados en `src/interfaces/`
- Exports nuevos o eliminados
- Cambios en constructores de Page Objects (especialmente la firma `driver, opts`)

Clasificar cada cambio antes de leer archivos:
- **Cambio de visibilidad únicamente** (`private` → `public` o viceversa): el diff es suficiente, no leer el `.ts`
- **Cambio estructural** (nueva firma, rename, nuevo método, tipo modificado): leer el `.ts`

## Paso 3 — Verificar JSDoc de los archivos afectados
Para cada archivo con cambio estructural:
1. Leer el JSDoc actual del archivo `.ts` afectado
2. Verificar si el JSDoc refleja el estado nuevo de la firma
3. Verificar si los `@param`, `@returns` y `@throws` son consistentes con el código actual

> **Optimización:** lanzar todas las lecturas de archivos `.ts` independientes entre sí en paralelo
> (múltiples `Read` en un solo mensaje). No esperar el resultado de uno para leer el siguiente.

## Paso 4 — Verificar `.md` relacionados
Revisar si alguno de estos archivos referencia el módulo modificado:
- `@README.md` (sección "How to Write a New Test" o "Contributing & Guidelines")
- `@.claude/CLAUDE.md`
- `@src/pages/README.md`

## Paso 5 — Escribir sugerencias
Tal como se indica en el Paso 9 de **smart-commit**, agregar las sugerencias al final de `@docs/doc-update-suggestions.md` (modo **append**, no sobreescribir —
pueden existir sugerencias de commits anteriores aún no revisados). Si el archivo no existe,
crearlo. Usar este formato:

**Encabezado:**
Fecha de generación, hash del commit analizado.

**Sección PRIORIDAD ALTA — JSDoc desactualizado:**
Por cada caso: archivo afectado, nombre de función/clase, descripción del problema, JSDoc propuesto.

**Sección PRIORIDAD MEDIA — .md con referencia desactualizada:**
Por cada caso: archivo afectado, sección, descripción del problema, cambio sugerido.

**Sección Sin cambios necesarios:**
Lista de archivos revisados que están OK.

## Paso 6 — Reportar y ejecutar
Mostrar el resumen de sugerencias y proceder con la ejecución de los cambios sugeridos.

> **Optimización:** Si hay múltiples ediciones JSDoc en el mismo archivo, agruparlas en una
> sola operación `Edit` en lugar de múltiples llamadas separadas.

## Paso 7 — Marcar commits como revisados

Una vez que el desarrollador confirme qué sugerencias aplicar **o** diga explícitamente
"no hay cambios necesarios", actualizar el estado en `pending-doc-updates.json`:

```bash
python3 -c "
import json
with open('.claude/pending-doc-updates.json') as f:
    data = json.load(f)
reviewed_hashes = {<lista de hashes procesados>}
for c in data['pendingCommits']:
    if c['hash'] in reviewed_hashes:
        c['status'] = 'reviewed'
with open('.claude/pending-doc-updates.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
"
```

## Verificación final con validate-ssot

Después de marcar los commits como reviewed, preguntar al desarrollador:
*"¿Querés ejecutar validate-ssot para verificar que el modelo SSoT está íntegro?"*

Si confirma:
- Ejecutar la skill `validate-ssot` (Pasos 1 a 5 de esa skill)
- Si no hay violaciones: reportar `✅ Modelo SSoT íntegro. No se detectaron violaciones.`
- Si hay violaciones: presentarlas con el formato `[TIPO] archivo → Problema → Acción recomendada`
  y preguntar cuáles corregir

Si omite: continuar sin ejecutar validate-ssot (no es un paso bloqueante).

---

# Restricciones
- Si código y `.md` son inconsistentes, el código prevalece siempre
- No modificar archivos en `@sessions/` — los tests son fuente de verdad de comportamiento
- No tocar `@src/interfaces/data.ts` o `src/interfaces/auth.ts` sin que el desarrollador lo pida explícitamente

# Output esperado
- `@docs/doc-update-suggestions.md` — solo sugerencias, sin cambios aplicados
