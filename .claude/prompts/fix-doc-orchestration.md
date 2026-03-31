# Prompt para nueva sesión: Rediseño del sistema de orquestación documental

## Contexto del proyecto

Framework de automatización de pruebas UI (Selenium WebDriver + TypeScript + Jest).
Ruta del repositorio: `/home/jutoc/proyectos/BlueStack-Test-Automation-Framework`

Antes de ejecutar cualquier cosa, leer en su totalidad:
- `.claude/CLAUDE.md` — reglas generales y SSoT
- `.claude/rules/pages.md` y todos los archivos en `.claude/rules/`
- `src/pages/README.md` — especificación autoritativa de la capa Page Object
- `scripts/hooks/pre-commit` y `scripts/hooks/post-commit` — los hooks actuales
- `.claude/skills/smart-commit/SKILL.md`
- `.claude/skills/sync-docs/SKILL.md`
- `.claude/skills/validate-ssot/SKILL.md`

---

## Problema que resolvés en esta sesión

Existe un bug de diseño en el sistema de automatización documental. El hook `post-commit`
sobreescribe siempre el archivo `.claude/pending-doc-review-prompt.md` con el diff del
último commit, destruyendo el contexto de todos los commits anteriores de la sesión.

El resultado real es este: si el desarrollador hace 3 commits seguidos sin ejecutar la
revisión documental entre medio, solo el diff del 3er commit queda registrado. Los cambios
de contrato de los commits 1 y 2 se pierden y su documentación nunca se revisa ni actualiza.
Además, nada obliga al desarrollador a ejecutar la revisión antes del próximo ciclo de commits.

---

## Lo que tenés que diseñar e implementar

El objetivo es un flujo completamente orquestado que minimice la intervención humana:

```
smart-commit → (automático) sync-docs → (automático) doc-update-suggestions → recordatorio visible
```

Para eso, necesitás implementar cuatro cambios coordinados:

---

### Cambio 1 — Acumulación en lugar de sobreescritura (hooks de git)

**Problema actual:**
- `post-commit` hace `> "$PROMPT_PATH"` (overwrite total)
- `pending-doc-updates.json` se sobreescribe con solo los archivos del último commit
- No hay historial de qué commits están pendientes de revisión

**Lo que debés implementar en `scripts/hooks/post-commit`:**

En lugar de sobreescribir `pending-doc-review-prompt.md`, **agregá una sección nueva** al
final del archivo existente. Cada sección debe estar delimitada por un encabezado con el
hash del commit para que sea parseable. Ejemplo de estructura resultante:

```
# Revisión documental pendiente

<!-- COMMIT abc1234 — 2026-03-31T10:00:00Z — status: pending -->
## Commit abc1234 — feat(image-pages)
**Archivos:** src/pages/image_pages/MainImagePage.ts ...
**Diff:**
[diff aquí]
<!-- END abc1234 -->

<!-- COMMIT def5678 — 2026-03-31T11:00:00Z — status: pending -->
## Commit def5678 — docs(note-list)
**Archivos:** src/pages/post_page/.../BaseListicleSection.ts
**Diff:**
[diff aquí]
<!-- END def5678 -->
```

**Lo que debés implementar en `pending-doc-updates.json`:**

Cambiar la estructura de objeto plano a array acumulativo:

```json
{
  "pendingCommits": [
    {
      "hash": "abc1234",
      "timestamp": "2026-03-31T10:00:00Z",
      "changedFiles": ["src/pages/image_pages/MainImagePage.ts"],
      "status": "pending"
    }
  ]
}
```

El `pre-commit` debe leer el JSON existente y agregar las entradas nuevas al array.
El `post-commit` debe marcar cada entrada como `prompt-generated` (no borrar las anteriores).

El hook de `post-commit` debe marcar una sección como `reviewed` solo cuando se invoque
explícitamente la skill `sync-docs` y esta confirme que procesó ese commit.

---

### Cambio 2 — Guard de pre-commit: bloqueo suave por documentación acumulada

**Lo que debés agregar al `pre-commit` hook:**

Antes de permitir el commit, verificar si `pending-doc-updates.json` tiene entradas con
`status: "pending"` o `status: "prompt-generated"` cuyo timestamp tenga más de **4 horas**
de antigüedad.

Si las hay, mostrar un warning visible (no bloquear el commit, pero sí avisar claramente):

```
⚠️  DOC-DEBT: Tenés N commit(s) con revisión documental pendiente.
   Más antiguo: abc1234 (hace Xh Ym)
   Ejecutá "Leé .claude/pending-doc-review-prompt.md y ejecutá la tarea" antes de continuar acumulando más deuda.
   Podés continuar de todas formas. Este es un recordatorio, no un bloqueo.
```

---

### Cambio 3 — Integración de sync-docs en smart-commit

**Archivo a modificar:** `.claude/skills/smart-commit/SKILL.md`

Agregar un **Paso 10** al final del flujo de smart-commit, que se ejecuta siempre
(independientemente del parámetro `--push`):

```
### Paso 10 — Auditoría documental automática post-commit

Después de confirmar que todos los commits fueron exitosos (Paso 9), ejecutar automáticamente
la skill sync-docs sobre los commits recién generados.

1. Leer `.claude/pending-doc-review-prompt.md`
2. Identificar las secciones correspondientes a los commits que acabás de generar
   (reconocibles por su hash, que obtenés del output del Paso 7)
3. Ejecutar el análisis de sync-docs sobre esas secciones
4. Escribir las sugerencias en `.claude/doc-update-suggestions.md` (modo append, no overwrite)
5. Mostrar el resumen de sugerencias al desarrollador
6. Preguntar: "¿Aplicamos alguna de estas actualizaciones ahora?"

Si el desarrollador confirma cambios:
- Aplicarlos inmediatamente
- Generar un commit adicional de tipo `docs(...)` con esos cambios
- Marcar las entradas correspondientes como `reviewed` en `pending-doc-updates.json`

Si el desarrollador pospone:
- Mostrar recordatorio: "Tenés N secciones pendientes en .claude/pending-doc-review-prompt.md"
- No marcar como reviewed
```

---

### Cambio 4 — Mecanismo de marcado "reviewed" en sync-docs

**Archivo a modificar:** `.claude/skills/sync-docs/SKILL.md`

Agregar al final del Paso 6 (después de que el desarrollador confirma los cambios a aplicar):

```
### Paso 7 — Marcar commits como revisados

Una vez que el desarrollador confirme qué sugerencias aplicar (o explícitamente diga
"no hay cambios necesarios"), actualizar `pending-doc-updates.json`:

- Para cada entrada cuyo hash esté en las secciones que acabamos de revisar:
  - Cambiar `status` de `pending` o `prompt-generated` a `reviewed`

Actualizar también `pending-doc-review-prompt.md`:
- Cambiar el comentario de apertura de `<!-- COMMIT hash — status: pending -->`
  a `<!-- COMMIT hash — status: reviewed -->`

Esto permite que el pre-commit guard no vuelva a avisar sobre commits ya revisados.
```

---

## Restricciones de implementación

- **No modificar** ningún archivo `.ts` de `src/` — esta tarea es solo de infraestructura (hooks, skills, settings)
- **No romper** el comportamiento actual de los hooks para repositorios sin archivos relevantes
- **Los hooks son bash scripts** — mantener bash compatible con `#!/usr/bin/env bash`
- **Las skills son archivos `.md`** — seguir el modelo SSoT: lógica en código, instrucciones en .md
- Seguir el protocolo `⚠️ INCONSISTENCIA DETECTADA` si encontrás algo que contradiga el código existente
- No aplicar ningún cambio a `.ts` sin confirmación del desarrollador
- Todos los archivos nuevos que crees en `.claude/` deben ser agregados al `.gitignore` si son
  archivos de runtime (generados automáticamente). Los scripts en `scripts/hooks/` SÍ se commitean.

---

## Flujo de verificación al terminar

Antes de reportar que terminaste, verificar que:

1. `scripts/hooks/post-commit` no tiene ninguna línea con `> "$PROMPT_PATH"` (overwrite)
   — debe usar append o construcción por secciones
2. `pending-doc-updates.json` tiene estructura de array, no objeto plano
3. `scripts/hooks/pre-commit` incluye el guard de deuda documental
4. `.claude/skills/smart-commit/SKILL.md` tiene el Paso 10 de auditoría automática
5. `.claude/skills/sync-docs/SKILL.md` tiene el Paso 7 de marcado reviewed
6. El flujo completo es coherente: un commit genera una sección en el prompt,
   sync-docs procesa esa sección, y el resultado queda marcado como reviewed

---

## Entregables esperados

Al terminar, mostrar:

```
✅ Sistema de orquestación documental rediseñado.

Archivos modificados:
  scripts/hooks/pre-commit       — guard de deuda documental agregado
  scripts/hooks/post-commit      — modo append por secciones implementado
  .claude/skills/smart-commit/SKILL.md — Paso 10 de auditoría automática agregado
  .claude/skills/sync-docs/SKILL.md   — Paso 7 de marcado reviewed agregado

Flujo resultante:
  smart-commit → genera secciones en pending-doc-review-prompt.md
              → ejecuta sync-docs automáticamente (Paso 10)
              → aplica cambios o pospone con recordatorio visible
  sync-docs   → marca secciones como reviewed en pending-doc-updates.json
  pre-commit  → avisa si hay deuda > 4hs sin revisar

Próximos pasos recomendados:
  1. Hacer un commit de prueba para verificar el nuevo comportamiento del hook
  2. Confirmar que el prompt acumula en lugar de sobreescribir
```
