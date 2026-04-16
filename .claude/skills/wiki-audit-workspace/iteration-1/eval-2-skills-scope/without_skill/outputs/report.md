# Reporte: Duplicaciones Skills vs Wiki — Baseline (sin skill)

## Estado general: BUENO

No se encontraron duplicaciones activas con contenido real en ambos lados.

## Tabla de archivos references/

| Archivo | Estado |
|---------|--------|
| `jira-writer/references/adf-format-guide.md` | Stub — sin duplicación |
| `jira-writer/references/devsaas-flow.md` | Stub — sin duplicación |
| `jira-writer/references/pipeline-schema.md` | Stub — sin duplicación |
| `jira-reader/references/pipeline-schema.md` | Stub — sin duplicación |
| `audit-logs/references/log-conventions.md` | Stub — sin duplicación |
| `skill-creator/references/bluestack-conventions.md` | Stub — sin duplicación |
| `jira-writer/references/field-map.md` | Dato de instancia legítimo (IDs Jira) — no mover |
| `jira-reader/references/transitions.md` | Dato de instancia legítimo (IDs transiciones) — no mover |

## Hallazgos menores

### H1 — smart-commit/SKILL.md: formato de commit inline duplica wiki/development/commit-conventions.md (Baja)
Bajo riesgo — si formato cambia en wiki, inline puede quedar desactualizado.

### H2 — senior-prompt-engineer/references/workspace-patterns.md: landscape de skills sin contraparte en wiki (Gap)
Conocimiento project-wide que solo vive en un references/ específico. Descubribilidad limitada.

### H3 — update-testids/references/pom-component-map.md: solapamiento parcial con wiki/pages/
Propósito diferente (operacional vs API pública) — mantener como está.

## Conclusión
- 0 duplicaciones activas de contenido
- 3 hallazgos menores (1 baja, 1 gap, 1 sin acción)