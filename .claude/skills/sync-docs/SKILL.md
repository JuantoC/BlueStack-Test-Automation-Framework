---
name: sync-docs
description: Sincroniza la documentación (JSDoc/TSDoc y `.md` contextuales) con el estado actual del código TypeScript tras uno o más commits. Aplica los cambios automáticamente sin pedir confirmación.
---

# CUANDO INVOCAR
- Cuando el desarrollador diga "sincronizá la documentación", "revisá qué docs quedaron desactualizados"
- Después de un refactor o cambio de firma en `src/pages/`, `src/core/` o `src/interfaces/`
- Automáticamente desde el Paso 9 de la skill `smart-commit`

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

## Paso 2 — Clasificar el tipo de commit antes de leer cualquier archivo

Antes de leer archivos, determinar el modo de procesamiento del commit usando el título:

**MODO FAST-TRACK** — activar cuando el título empiece con `feat(` o `fix(` **y** el diff muestre exclusivamente archivos nuevos (solo líneas `+`, sin `@@` de modificación en archivos existentes):
- **No leer** los archivos `.ts` nuevos para verificar JSDoc (fue escrito al momento de crear el código)
- **Sí verificar** únicamente: `src/pages/README.md` (árbol de directorios y tabla de tipos) y `README.md` raíz si el módulo es nuevo
- Registrar todos los archivos nuevos como "creado con JSDoc, sin verificación profunda requerida"

**MODO COMPLETO** — activar para todo lo demás (modificaciones, refactors, renames):
- Continuar con los pasos 2b y 3 normalmente

**Clasificaciones siempre aplicables (independiente del modo):**
- **Archivo en `.claude/skills/`**: clasificar como **visibility-only**. Sin lectura de `.ts` ni revisión profunda. Registrar como "skill-doc revisado, sin acción requerida."
- **Cambio de visibilidad únicamente** (`private` → `public`): el diff es suficiente, no leer el `.ts`

## Paso 2b — Identificar cambios de contrato público (solo MODO COMPLETO)
Del diff de cada commit, identificar específicamente:
- Funciones o métodos con firma modificada en `src/pages/` o `src/core/`
- Interfaces o tipos modificados en `src/interfaces/`
- Exports nuevos o eliminados
- Cambios en constructores de Page Objects (especialmente la firma `driver, opts`)

Clasificar cada cambio:
- **Cambio estructural** (nueva firma, rename, nuevo método, tipo modificado): leer el `.ts`

## Paso 3 — Verificar JSDoc de los archivos afectados (solo MODO COMPLETO)
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

## Paso 6 — Aplicar cambios automáticamente

Aplicar todas las sugerencias identificadas sin pedir confirmación:
- Editar JSDoc/TSDoc en los archivos `.ts` correspondientes
- Editar referencias desactualizadas en los `.md` contextuales

> **Optimización:** Si hay múltiples ediciones JSDoc en el mismo archivo, agruparlas en una
> sola operación `Edit` en lugar de múltiples llamadas separadas.

Si la skill fue invocada desde smart-commit (Paso 9): generar un commit `docs(...)` con los cambios,
usando el mismo formato de mensaje del Paso 5 de smart-commit.

Si no hay cambios que aplicar: informar brevemente y continuar al Paso 7.

## Paso 7 — Marcar commits como revisados

Actualizar el estado en `pending-doc-updates.json` inmediatamente, sin esperar confirmación:

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

## Paso 8 — Validación SSoT automática

Después de marcar los commits como reviewed, ejecutar **automáticamente** la skill `validate-ssot`
(Pasos 1 a 5 de esa skill). No pedir confirmación.

- Si no hay violaciones: reportar `✅ Modelo SSoT íntegro. No se detectaron violaciones.`
- Si hay violaciones: reportar cada una con el formato `[TIPO] archivo → Problema → Acción recomendada`
  y aplicar las correcciones que no impliquen cambios en lógica funcional de `.ts`
- Si alguna violación requiere cambio en código TypeScript funcional: reportarla y preguntar

---

# Restricciones
- Si código y `.md` son inconsistentes, el código prevalece siempre
- No modificar archivos en `@sessions/` — los tests son fuente de verdad de comportamiento
- No tocar `@src/interfaces/data.ts` o `src/interfaces/auth.ts` sin que el desarrollador lo pida explícitamente
- Los cambios automáticos están limitados a JSDoc/TSDoc y `.md` contextuales; nunca lógica funcional

# Output esperado
- `@docs/doc-update-suggestions.md` — registro de sugerencias generadas y aplicadas
- Cambios JSDoc/`.md` ya aplicados en el repositorio
- Commit `docs(...)` si fue invocada desde smart-commit
