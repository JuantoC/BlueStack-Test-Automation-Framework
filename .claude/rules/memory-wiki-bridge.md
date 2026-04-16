# RULE: MEMORY-WIKI-BRIDGE

## Cuándo aplica

Al crear o actualizar cualquier archivo de memoria (`feedback_*`, `reference_*`, `project_*`).

---

## Decisión: ¿La memoria también va a wiki?

La memoria es el **snapshot inmediato** de lo aprendido. La wiki es la **fuente canónica project-wide**.
Si el aprendizaje aplica a todo el equipo y al código base, no alcanza con dejarlo en memoria.

| Tipo de memoria | Contenido | ¿Es project-wide? | Acción adicional |
|---|---|---|---|
| `feedback_*` | Convención de código, naming, estructura de archivos | **Sí** | → Proponer entrada en `wiki/patterns/conventions.md` (⚠️ NECESITA CONFIRMACIÓN) |
| `feedback_*` | Preferencia personal del usuario (workflow, estilo de respuesta) | **No** | → Solo memoria |
| `reference_*` | Comportamiento de un componente UI del CMS (locator, condición de visibilidad) | **Sí** | → Proponer actualización a `wiki/pages/<módulo>.md` (⚠️ NECESITA CONFIRMACIÓN) |
| `reference_*` | Dato de configuración de entorno/infra | **Sí** | → Proponer actualización a `wiki/core/` correspondiente (⚠️ NECESITA CONFIRMACIÓN) |
| `reference_*` | ID de campo Jira (`customfield_*`) o alias de transición | **Sí** | → Proponer entrada en `.claude/pipelines/*/references/` o `.claude/skills/jira-*/references/` (⚠️ NECESITA CONFIRMACIÓN) |
| `project_*` | Decisión arquitectural o de diseño del framework | **Sí** | → Proponer entrada en `wiki/index.md` o página correspondiente (⚠️ NECESITA CONFIRMACIÓN) |
| `project_*` | Estado temporal de un ticket o tarea en curso | **No** | → Solo memoria (se vuelve obsoleto pronto) |

---

## Regla de oro

> **Si es project-wide, la memoria es el snapshot; la wiki es la fuente canónica.**
> No es suficiente que esté en memoria. La memoria puede quedar obsoleta; la wiki se mantiene.

---

## Cómo aplicar

1. Al crear/actualizar una memoria, consultar la tabla de arriba.
2. Si corresponde wiki-update: agregar el ítem al bloque ⚠️ NECESITA CONFIRMACIÓN de la retrospectiva.
3. **No auto-aplicar** el wiki-update de este bridge (modificar una página wiki existente con contenido previo siempre requiere confirmación).
4. Excepción: si el wiki-update es **solo una nueva entrada en `wiki/log.md`** → auto-aplicar según la política de la retrospectiva.

---

## Ver también

- `.claude/skills/skill-retrospective/SKILL.md` — política completa de auto-apply
- `.claude/rules/doc-organization.md` — dónde vive cada tipo de documento