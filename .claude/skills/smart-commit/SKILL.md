---
name: smart-commit
description: Analizar los cambios del working tree, agruparlos semánticamente, y ejecutar commits ricos en contexto orientados a negocio que sirvan como fuente de verdad para la generación de reportes semanales. **Agente destino:** Claude Code (Pro empresarial, integrado en VS Code) **Parámetro opcional:** `--push` para ejecutar git push al finalizar. **Output:** commits ejecutados en el repositorio local (y push opcional).

---

# ROL DEL AGENTE AL EJECUTAR ESTA SKILL

Actuás como un **Arquitecto de Control de Versiones Senior**. Tu trabajo es analizar los cambios del working tree, comprender qué problema resuelve cada conjunto de modificaciones, y expresarlo en commits atómicos, semánticos y ricos en contexto. Cada commit que generás debe poder ser consumido directamente por la Skill `week-report` sin necesidad de inferencias ni marcas `[REVISAR]`.

---

# RESTRICCIONES EXPLÍCITAS (LO QUE NO DEBES HACER)

- **NO generar** un único commit masivo si hay múltiples módulos o temas involucrados.
- **NO usar** títulos vagos: "update files", "fix stuff", "changes", "WIP".
- **NO omitir** el cuerpo del commit — el cuerpo es obligatorio siempre.
- **NO inventar** funcionalidad no presente en los diffs.
- **NO hacer** staging de archivos generados automáticamente que no aporten valor semántico: `*.log`, `node_modules/`, `dist/`, `.DS_Store`, archivos de lock sin cambios funcionales.
- **NO ejecutar** push si el parámetro `--push` no fue proporcionado explícitamente.

---

# PARÁMETROS DE INVOCACIÓN

| Parámetro | Tipo | Descripción |
|---|---|---|
| `--push` | flag opcional | Si está presente, ejecuta `git push` al finalizar todos los commits |
| `--branch <nombre>` | opcional | Rama destino del push. Si se omite, usa la rama actual |

Ejemplos de invocación:
- `"generar commits"` → solo commits, sin push
- `"generar commits con push"` → commits + push a la rama actual
- `"generar commits con push a develop"` → commits + push a `develop`

---

# PASOS DE EJECUCIÓN

### Paso 1 — Detectar parámetros

Verificar si el usuario incluyó `--push` o equivalente semántico ("con push", "y hacer push", "push incluido").
- Si sí: registrar `PUSH=true` y capturar la rama destino si fue especificada.
- Si no: registrar `PUSH=false`.

Informar al usuario:
```
🔍 Analizando cambios del repositorio...
Push al finalizar: [Sí → rama X / No]
```

---

### Paso 2 — Capturar el estado completo del repositorio

Ejecutar en secuencia:

```bash
# Estado general
git status --short

# Diff de archivos ya en staging
git diff --cached --stat
git diff --cached

# Diff de archivos modificados no staged
git diff --stat
git diff

# Archivos nuevos sin trackear
git ls-files --others --exclude-standard
```

Capturar todo el output como contexto de análisis.

> **Si el repositorio no tiene cambios en absoluto:** mostrar mensaje y detener.
> ```
> ✅ No hay cambios pendientes en el repositorio. Working tree limpio.
> ```

> **Si falla algún comando Git:** ver sección MANEJO DE EXCEPCIONES → *Error Git*.

---

### Paso 3 — Leer contexto del proyecto

Leer los siguientes archivos si existen en la raíz del repositorio:
- `README.md` — propósito del proyecto, módulos, flujos críticos
- `CLAUDE.md` — convenciones del proyecto, naming, arquitectura
- `package.json` o equivalente — nombre del proyecto, scripts

Usar este contexto para enriquecer los cuerpos de commit con vocabulario específico del proyecto y referencias a módulos reales.

---

### Paso 4 — Analizar y agrupar los cambios

Analizar el output completo del Paso 2. Para cada archivo modificado, determinar:
- **Módulo o área funcional** al que pertenece (inferir de la ruta del archivo y el contexto del proyecto)
- **Tipo de cambio**: nuevo feature, fix, refactor, docs, config, test, infraestructura
- **Impacto funcional**: qué capacidad agrega, corrige o mejora en el sistema

Agrupar los archivos en **conjuntos temáticamente cohesivos**. Criterios de agrupación:
- Archivos del mismo módulo o feature → mismo commit
- Archivos de infraestructura o config → commit separado
- Archivos de documentación o skills → commit separado
- Archivos de tests → pueden ir con el feature que testean, o separados si son múltiples suites

**Regla de atomicidad:** cada commit debe poder revertirse sin romper otro commit del mismo batch. Si dos grupos de cambios son interdependientes, van en el mismo commit.

Determinar el orden lógico de los commits (dependencias primero).

---

### Paso 5 — Redactar los mensajes de commit

Para cada grupo, redactar un mensaje con la siguiente estructura:

```
<tipo>(<módulo>): <título imperativo en español, máx 72 chars>

Módulo: <nombre del módulo o área funcional>
Impacto: <descripción de una línea del impacto en el sistema o cobertura>
Escenarios: <flujos o casos cubiertos, separados por coma>
Archivos clave: <lista de los archivos más relevantes del grupo>
```

#### TABLA DE TIPOS

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad, nuevo Page Object, nuevo handler, nueva clase funcional |
| `fix` | Corrección de bug, estabilización de flujo existente |
| `refactor` | Reestructuración sin cambio de comportamiento, reducción de deuda técnica |
| `test` | Nuevos tests, nuevas suites, extensión de cobertura |
| `docs` | README, JSDoc, comentarios, skills, CLAUDE.md |
| `config` | Docker, CI/CD, grids, pipelines, dependencias |
| `chore` | Archivos de configuración menores, limpieza, renombrados sin impacto funcional |

#### TABLA DE TRADUCCIÓN MÓDULO → IMPACTO (alineada con week-report)

| Patrón en archivos/diff | Impacto a expresar en el commit |
|---|---|
| Handler / class nueva | Implementación de capacidad funcional en [módulo] que habilita [flujo] |
| Refactor / restructure | Reducción de deuda técnica, mejora de mantenibilidad y escalabilidad |
| Page Object / session | Ampliación de cobertura automatizada hacia [sección del CMS] |
| Factory / faker / dynamic data | Generación de datos dinámicos, eliminando dependencias estáticas |
| JSDoc / comments / docs | Extensión de documentación interna para facilitar mantenimiento |
| Skill / CLAUDE.md / agent config | Configuración del agente IA, avance en automatización del ciclo QA |
| Docker / grid / CI / pipeline | Mejora de infraestructura de ejecución paralela e integración continua |
| Test / spec / suite | Extensión de cobertura hacia [flujo o módulo específico] |
| Toast / banner / modal | Implementación de validación de resultados de operación |
| Bulk / mass / publish | Cobertura de flujos de publicación masiva, reducción de riesgo de regresión |

**Regla de ambigüedad:** Si un grupo de archivos no encaja en ningún patrón y el diff no aporta contexto suficiente, describir el impacto técnico concreto que sí se puede inferir, sin inventar impacto de negocio.

---

### Paso 6 — Mostrar el plan completo

Antes de ejecutar, mostrar al usuario el plan completo:

```
📋 Plan de commits ({N} commits identificados):

COMMIT 1/{N}
Tipo: feat(posts)
Título: implementar handler de publicación masiva
Módulo: Posts / Bulk Operations
Impacto: Cobertura de flujos de publicación masiva desde tabla principal
Archivos a stagear: src/pages/MainPostPage.ts, src/handlers/BulkPublishHandler.ts

COMMIT 2/{N}
Tipo: docs(skills)
Título: agregar skill smart-commit para estandarización de commits
...

Ejecutando en 3 segundos... (Ctrl+C para cancelar)
```

Esperar 3 segundos o hasta que el usuario cancele. Si cancela, detener sin ejecutar nada.

---

### Paso 7 — Ejecutar el staging y los commits

Para cada commit en el orden determinado en el Paso 4:

```bash
# 1. Stagear solo los archivos de este grupo
git add <archivo1> <archivo2> ...

# 2. Verificar que el staging es correcto
git diff --cached --stat

# 3. Ejecutar el commit con el mensaje completo
git commit -m "<tipo>(<módulo>): <título>" -m "Módulo: <...>
Impacto: <...>
Escenarios: <...>
Archivos clave: <...>"
```

Capturar el output de cada `git commit` para verificar que se ejecutó correctamente.

> **Si un commit falla:** ver sección MANEJO DE EXCEPCIONES → *Error en commit*.

---

### Paso 8 — Push opcional

**Solo si `PUSH=true`:**

```bash
# Determinar rama actual si no se especificó
git branch --show-current

# Ejecutar push
git push origin <rama>
```

Capturar el output completo.

> **Si el push falla:** ver sección MANEJO DE EXCEPCIONES → *Error en push*.

---

### Paso 9 — Confirmar al usuario

Mostrar resumen final:

```
✅ Commits ejecutados exitosamente.

Commits generados: {N}
Archivos commiteados: {total de archivos}
Push ejecutado: [Sí → origin/<rama> / No]

--- RESUMEN DE COMMITS ---
{hash corto} feat(posts): implementar handler de publicación masiva
{hash corto} docs(skills): agregar skill smart-commit para estandarización de commits
...

💡 Tip: Estos commits están listos para ser procesados por la Skill week-report.
    Ejecutá "generar reporte semanal" cuando quieras el correo de avance.
```

---

## MANEJO DE EXCEPCIONES

### Sin cambios en el repositorio
```
✅ No hay cambios pendientes. Working tree limpio.
No se genera ningún commit.
```

### Error Git (no es repo, permisos, comando no encontrado)
```
❌ Error al ejecutar comando Git.
Detalle: {stderr capturado}
Verificar:
  - Que el directorio actual es la raíz del repositorio (debe existir .git/)
  - Que Git está instalado y accesible
  - Que hay permisos de lectura/escritura sobre el repositorio
```

### Error en commit individual
```
⚠️  Falló el commit {N}: {stderr}
Los commits anteriores ya fueron ejecutados.
Commits exitosos: {lista de hashes}
Acción requerida: revisar el error y reinvocar la skill para el grupo restante.
```

### Error en push
```
⚠️  Los commits se ejecutaron correctamente pero el push falló.
Detalle: {stderr}
Verificar:
  - Que existe conexión con el remoto
  - Que tenés permisos de escritura en origin/<rama>
  - Que la rama remota existe: git push --set-upstream origin <rama>
Los commits locales están intactos. Podés hacer push manualmente.
```

### Archivos en conflicto o merge en curso
```
❌ El repositorio tiene un merge o rebase en curso.
No se puede generar commits en este estado.
Resolvé el conflicto primero:
  - git merge --abort  (para cancelar el merge)
  - git rebase --abort (para cancelar el rebase)
  - O resolvé los conflictos y completá la operación
```

---

# INTEGRACIÓN CON SKILL WEEK-REPORT

Esta skill está diseñada para que su output sea consumido directamente por `week-report`. Para garantizar la compatibilidad:

- Los **tipos de commit** (`feat`, `fix`, `refactor`, etc.) mapean directamente a la tabla de traducción de `week-report`.
- El campo **Módulo** en el cuerpo del commit permite a `week-report` inferir la sección del CMS afectada sin ambigüedad.
- El campo **Escenarios** provee el contexto que `week-report` necesita para construir la descripción de impacto sin marcar `[REVISAR]`.
- El campo **Impacto** puede ser tomado casi literalmente por `week-report` como base del logro de la semana.

**Ciclo completo recomendado:**
1. Al terminar el trabajo del día: `"generar commits"` (sin push, para revisar)
2. Al confirmar: `"generar commits con push"` (o push manual)
3. Al final de la semana: `"generar reporte semanal"` → consume los commits de los últimos 7 días

---

# NOTAS DE MANTENIMIENTO

- Para agregar nuevos patrones de módulo, editar la **TABLA DE TRADUCCIÓN** del Paso 5.
- Para cambiar el comportamiento por defecto del push, modificar el valor de `PUSH` en el Paso 1.
- Versionar este archivo en el repositorio junto con `week-report.md`. Ambas skills son parte del mismo tooling.