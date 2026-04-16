## Resultado auditoría — Scope: skills | Mode: fix

### Issues encontrados: 4

| # | Severidad | Issue | Archivos |
|---|-----------|-------|---------|
| 1 | ALTA | `audit-logs/SKILL.md` línea 26 apunta a `references/log-conventions.md` en lugar de a `wiki/core/logging.md` | audit-logs/SKILL.md:26 |
| 2 | ALTA | `jira-writer/SKILL.md` sección Referencias apunta a `references/devsaas-flow.md` y `references/pipeline-schema.md` (stubs) en lugar de wiki/ | jira-writer/SKILL.md:381-382 |
| 3 | ALTA | `jira-writer/SKILL.md` cuerpo: 4 menciones inline a stubs en lugar de wiki/ | jira-writer/SKILL.md:185,205,228,324 |
| 4 | ALTA | `jira-reader/SKILL.md` apunta a `references/pipeline-schema.md` (stub) en lugar de wiki/ | jira-reader/SKILL.md:421,446 |

### Hallazgos correctos (datos de instancia — no mover)

| Archivo | Estado |
|---------|--------|
| `jira-writer/references/field-map.md` | ✅ Dato de instancia legítimo (IDs customfield) — no mover |
| `jira-reader/references/transitions.md` | ✅ Dato de instancia legítimo (IDs transiciones) — no mover |
| `jira-writer/references/comment-examples.md` | ✅ Datos operativos del proyecto NAA — no mover |

### Fixes que se aplicarían

1. `audit-logs/SKILL.md` línea 26: reemplazar `references/log-conventions.md` por `wiki/core/logging.md`
2. `jira-writer/SKILL.md`: 6 ocurrencias de stubs → paths directos a wiki/
3. `jira-reader/SKILL.md`: 2 ocurrencias de `references/pipeline-schema.md` → `wiki/qa/pipeline-integration-schema.md`