---
last-updated: 2026-04-17
---

# Jira Customfields — BlueStack NAA

> Tabla de referencia de todos los campos custom usados en el proyecto NAA. Los IDs exactos y mappings de instancia viven en `.claude/skills/jira-writer/references/field-map.md` y `.claude/pipelines/ticket-analyst/references/customfield-mapping.json`.

---

## Grupo A — Legacy (histórico)

Primer grupo de campos de deploy. Presentes en tickets anteriores a la migración NAA. **No usar en tickets nuevos.**

| customfield ID | Nombre semántico | Tipo | Notas |
|----------------|-----------------|------|-------|
| `customfield_10036` | Cambios SQL (legacy) | Texto | Mismo semántico que 10066. Inferencia: `criterion_scope: "backend_data"` |
| `customfield_10037` | Cambios Librerías (legacy) | Texto | — |
| `customfield_10038` | Cambios TLD (legacy) | Texto | — |
| `customfield_10039` | Cambios VFS (legacy) | Texto | Mismo semántico que 10069. Inferencia: `criterion_scope: "vfs"` |
| `customfield_10040` | Cambios Configuración (legacy) | Texto | Inferencia: `criterion_scope: "vfs"` si tiene valor |
| `customfield_10041` | Comentarios Deploy (legacy) | Texto | — |

---

## Grupo B — NAA (activo)

Grupo activo para el proyecto NAA. **Usar siempre estos en tickets nuevos.**

| customfield ID | Nombre semántico | Tipo | Notas |
|----------------|-----------------|------|-------|
| `customfield_10066` | Cambios SQL | Texto | Inferencia: `criterion_scope: "backend_data"` si tiene valor |
| `customfield_10067` | Cambios Librerías | Texto | — |
| `customfield_10068` | Cambios TLD | Texto | — |
| `customfield_10069` | Cambios VFS | Texto | Inferencia: `criterion_scope: "vfs"` si tiene valor |
| `customfield_10070` | Cambios Configuración | Texto | — |
| `customfield_10071` | Comentarios Deploy | Texto | — |

---

## Otros campos custom relevantes

| customfield ID | Nombre semántico | Grupo | Uso en pipeline |
|----------------|-----------------|-------|----------------|
| `customfield_10061` | Sprint (ID numérico) | — | Lectura en OP-1 de jira-reader; no escribir |
| `customfield_10062` | Story Points / Épica link | — | Lectura en OP-1 |
| `customfield_10021` | Épica vinculada | — | `parentKey` en `jira_metadata` |

---

## Regla de inferencia de `criterion_scope`

El ticket-analyst infiere automáticamente `criterion_scope` en TA-4.2 según estos campos:

| Condición | Inferencia |
|-----------|-----------|
| `customfield_10040` o `customfield_10069` con valor non-null | `criterion_scope: "vfs"` |
| `customfield_10036` o `customfield_10066` con valor non-null | `criterion_scope: "backend_data"` |
| Ambas presentes | `"vfs"` tiene precedencia |
| Criterio menciona keywords UI (pantalla, botón, modal...) | Mantener `"ui"` aunque el customfield esté populado |

---

## Referencias

- Mapeo completo con IDs de valores: `.claude/skills/jira-writer/references/field-map.md`
- Regla de inferencia completa: [wiki/qa/criterion-types-and-scopes.md](criterion-types-and-scopes.md) § Inferencia automática
- Lectura de campos en ticket-analyst: `.claude/agents/ticket-analyst.md` líneas 71-76, 280-283
