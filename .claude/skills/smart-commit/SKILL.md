---
name: smart-commit
model: sonnet
effort: medium
description: Analizar los cambios del working tree, agruparlos semánticamente y ejecutar commits atómicos ricos en contexto orientados a negocio, listos para ser consumidos por `commit-report`. Parámetro opcional `--push` para hacer push al finalizar. Activar cuando el usuario diga: "generar commits", "hacer commits", "commitear los cambios", "generar commits con push", "commitear y pushear", "hacer un commit de los cambios pendientes", "crear commits semánticos".
---

# ROL

Actuás como un **Arquitecto de Control de Versiones Senior**. Analizás los cambios del working tree, comprendés qué problema resuelve cada conjunto de modificaciones, y lo expresás en commits atómicos, semánticos y ricos en contexto. Cada commit que generás puede ser consumido directamente por `commit-report` sin necesidad de inferencias ni marcas `[REVISAR]`.

---

# RESTRICCIONES

- **NO generar** un único commit masivo si hay múltiples módulos o temas involucrados.
- **NO usar** títulos vagos: "update files", "fix stuff", "changes", "WIP".
- **NO omitir** el cuerpo del commit — el cuerpo es obligatorio siempre.
- **NO inventar** funcionalidad no presente en los diffs.
- **NO stagear** archivos generados automáticamente sin valor semántico: `*.log`, `node_modules/`, `dist/`, `.DS_Store`, lock files sin cambios funcionales, `.env`, `.claude/projects/` (memoria del agente).
- **NO ejecutar** push si `--push` no fue proporcionado explícitamente.

---

# PARÁMETROS

| Parámetro | Tipo | Descripción |
|---|---|---|
| `--push` | flag opcional | Ejecuta `git push` al finalizar todos los commits |
| `--branch <nombre>` | opcional | Rama destino del push. Si se omite, usa la rama actual |

Ejemplos:
- `"generar commits"` → solo commits, sin push
- `"generar commits con push"` → commits + push a la rama actual
- `"generar commits con push a develop"` → commits + push a `develop`

---

# PASOS

### Paso 1 — Detectar parámetros

Verificar si el usuario incluyó `--push` o equivalente semántico ("con push", "y hacer push", "push incluido").
- Si sí: registrar `PUSH=true` y capturar la rama destino si fue especificada.
- Si no: registrar `PUSH=false`.

Informar:
```
🔍 Analizando cambios del repositorio...
Push al finalizar: [Sí → rama X / No]
```

---

### Paso 2 — Capturar el estado del repositorio

```bash
git status --short
git diff --cached --stat && git diff --cached
git diff --stat && git diff
git ls-files --others --exclude-standard
```

Capturar todo el output como contexto de análisis.

> **Si no hay cambios:** mostrar `✅ No hay cambios pendientes. Working tree limpio.` y detener.
> **Si falla algún comando Git:** ver `references/exceptions.md` → _Error Git_.

---

### Paso 3 — Leer contexto del proyecto

Leer con la herramienta Read:
- `README.md` — propósito del proyecto, módulos, flujos críticos
- `.claude/CLAUDE.md` — convenciones del proyecto, nomenclatura, arquitectura
- `package.json` — nombre del proyecto, scripts relevantes
- `wiki/index.md` — si existe, knowledge compilado sobre el sistema

Usar este contexto para enriquecer los cuerpos del commit con vocabulario específico del proyecto y referencias a módulos reales.

---

### Paso 4 — Analizar y agrupar los cambios

Analizar el output del Paso 2. Para cada archivo modificado, determinar:
- **Módulo o área funcional** (inferir de la ruta del archivo y el contexto del proyecto)
- **Tipo de cambio**: nuevo feature, fix, refactor, docs, config, test, infraestructura
- **Impacto funcional**: qué capacidad agrega, corrige o mejora

Agrupar archivos en **conjuntos temáticamente cohesivos**:
- Archivos del mismo módulo o feature → mismo commit
- Infraestructura o config → commit separado
- Documentación o skills → commit separado
- Tests → con el feature que testean, o separados si son múltiples suites

**Regla de atomicidad:** cada commit debe poder revertirse sin romper otro del mismo batch. Si dos grupos son interdependientes, van en el mismo commit. Si los cambios pueden organizarse en uno solo, hacerlo — no generar commits innecesarios.

**Filtro whitespace-only — obligatorio antes de agrupar:**
Verificar si el diff de algún archivo contiene únicamente cambios de whitespace (líneas vacías, espacios/tabs sin cambio de contenido).
- Si el diff es exclusivamente whitespace: excluir ese archivo de todos los grupos.
- Si mezcla whitespace con cambios reales: incluirlo normalmente.
- Informar al usuario si algún archivo fue excluido.

Determinar el orden lógico de los commits (dependencias primero).

---

### Paso 5 — Redactar mensajes de commit

Para cada grupo, redactar usando la estructura definida en `wiki/development/commit-conventions.md`.

Formato:
```
<tipo>(<módulo>): <título imperativo en español, máx 72 chars>

Módulo: <nombre del módulo o área funcional>
Impacto: <descripción de una línea del impacto en el sistema>
Escenarios: <flujos o casos cubiertos, separados por coma>
Archivos clave: <lista de los archivos más relevantes>
```

> Consultar `wiki/development/commit-conventions.md` para la tabla de tipos y la tabla módulo → impacto.

---

### Paso 6 — Ejecutar staging y commits

**Antes de cada `git add`:** verificar que cada archivo del grupo exista en disco con `git status --short`. Si un archivo aparece en el plan pero no en `git status --short`, excluirlo del staging silenciosamente y registrarlo como "no encontrado — excluido".

> Razón: `git add` sobre un path inexistente retorna exit code 128 (`fatal: pathspec ... did not match any files`), lo cual aborta el batch. Verificar existencia evita el error.

Para cada commit en el orden del Paso 4:

```bash
git add <archivo1> <archivo2> ...
git commit -m "<tipo>(<módulo>): <título>" -m "Módulo: <...>
Impacto: <...>
Escenarios: <...>
Archivos clave: <...>"
```

Capturar el output de cada `git commit` para verificar ejecución correcta.

> **Si un commit falla:** ver `references/exceptions.md` → _Error en commit individual_.

---

### Paso 7 — Push opcional

**Solo si `PUSH=true`:**

```bash
git branch --show-current
git push work main && git push personal main
```

> La convención del proyecto es pushear siempre a ambos remotes (`work` y `personal`). Si se especificó `--branch <nombre>`, reemplazar `main` por ese nombre.
> **Si el push falla:** ver `references/exceptions.md` → _Error en push_.

---

### Paso 8 — Progreso intermedio (NO es el cierre)

Mostrar el resumen de commits ejecutados **sin el banner de cierre** — el flujo continúa obligatoriamente hacia los Pasos 9 y 10:

```
📦 Commits ejecutados — continuando con sync-docs y validate-ssot...

Commits generados: {N}
Archivos commiteados: {total}
Push ejecutado: [Sí → origin/<rama> / No]

{hash corto} feat(posts): implementar handler de publicación masiva
{hash corto} docs(skills): agregar skill smart-commit
...
```

⚠️ **El flujo NO termina aquí.** Los Pasos 9 y 10 son obligatorios e inmediatos. No esperar input del usuario.

---

### Paso 9 — Sync Docs

Leer `.claude/pipelines/sync-docs/PIPELINE.md` y ejecutar todos sus pasos en esta misma sesión.

No pedir confirmación. Aplicar cambios JSDoc/`.md` automáticamente. Si hay cambios que aplicar, hacer el commit `docs(...)` con `--no-verify` tal como indica el Paso 6 de esa pipeline.

---

### Paso 10 — Validate SSoT

Leer `.claude/pipelines/validate-ssot/PIPELINE.md` y ejecutar sus Pasos 1 a 5 en esta misma sesión.

No pedir confirmación. Aplicar correcciones automáticas (JSDoc/`.md`). Pausar solo si una corrección requiere modificar lógica funcional en un `.ts`.

---

### Paso 11 — Cierre definitivo

Solo después de completar los Pasos 9 y 10, mostrar el banner de cierre real:

```
✅ smart-commit completado.

Commits: {N} | Push: [Sí/No] | Sync Docs: [OK / {N} cambios aplicados] | SSoT: [✅ íntegro / ⚠️ {N} violaciones]

Estos commits están listos para ser procesados por `commit-report`.
Ejecutá "generá el reporte de avance" cuando quieras el correo de avance.
```

---

> Para manejo detallado de errores: ver `references/exceptions.md`.
> Para integración con `commit-report`: ver `references/integration.md`.