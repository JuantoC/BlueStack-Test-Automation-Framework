# Checklist: Artefactos históricos y gaps pendientes

## 1. Pipelines históricos vs Custom Agents

El proyecto migró de pipelines-as-prompts (v3.0) a custom agents. Los agents vigentes están
en `.claude/agents/`. Los pipelines correspondientes en `.claude/pipelines/` son referencia
histórica.

### Pipelines migrados a agents (DEPRECATED)
| Pipeline | Agent vigente |
|----------|---------------|
| .claude/pipelines/qa-orchestrator/ | .claude/agents/qa-orchestrator.md |
| .claude/pipelines/test-engine/ | .claude/agents/test-engine.md |
| .claude/pipelines/test-reporter/ | .claude/agents/test-reporter.md |
| .claude/pipelines/ticket-analyst/ | .claude/agents/ticket-analyst.md |

### Pipelines aún activos (NO deprecated)
| Pipeline | Quién lo invoca |
|----------|-----------------|
| .claude/pipelines/sync-docs/ | smart-commit (Paso 9) |
| .claude/pipelines/validate-ssot/ | smart-commit (Paso 10) |

### Verificación
Para los 4 pipelines migrados: verificar que el PIPELINE.md tenga al inicio:
```markdown
> **REFERENCIA HISTÓRICA — v3.0 (pipelines-as-prompts)**
> Este archivo es referencia histórica. El agente vigente está en `.claude/agents/<nombre>.md`.
> No usar como instrucción activa.
```

Si falta → agregar al inicio del archivo. No modificar el contenido del resto.

---

## 2. Gaps pendientes en wiki/log.md

Verificar que wiki/log.md tenga entradas `[gap]` para los siguientes gaps conocidos:

| Gap | Estado esperado en log.md |
|-----|---------------------------|
| test-generator (Fase 5 qa-orchestrator) | [gap] pipeline: test-generator pendiente |
| comment_page/ sin implementar | [gap] src/pages/comment_page/ vacío |
| user_profile_page/ sin implementar | [gap] src/pages/user_profile_page/ vacío |
| deploy/SQL/VFS customfields discovery | Puede estar como nota en field-map.md (OK) |

Si algún gap no tiene entrada → agregar en la sección de Entradas con formato:
```
[YYYY-MM-DD] [gap] <descripción concisa del gap y contexto>
```

---

## 3. field-map.md — completitud

Verificar que `.claude/skills/jira-writer/references/field-map.md` tenga documentados los
campos de deploy en ambos grupos:

**Grupo A (legacy, pre-NAA):** customfield_10036 a 10041
**Grupo B (NAA activo):** customfield_10066 a 10071

Los campos que deben estar en cada grupo:
- Cambios SQL
- Cambios Librerías
- Cambios TLD
- Cambios VFS
- Cambios Configuración
- Comentarios Deploy

Si falta alguno → agregar con el ID y descripción correctos.

---

## 4. Workspace de skills — limpieza

Verificar si hay directorios de workspace desactualizados que ya no corresponden a iteraciones
activas de mejora de skills:
- `jira-reader-workspace/` — ¿tiene iteraciones en progreso o es histórico?
- `jira-writer-workspace/` — ídem

Si son históricos y no hay trabajo activo: dejar como está (son referencia de evals pasadas).
No eliminar sin confirmación del usuario.

## Validación final
- Los 4 PIPELINE.md deprecados tienen nota DEPRECATED al inicio
- wiki/log.md tiene [gap] para cada trabajo pendiente conocido
- field-map.md tiene los 6 campos de deploy en ambos grupos