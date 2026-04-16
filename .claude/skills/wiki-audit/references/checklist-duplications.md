# Checklist: Duplicaciones references/ vs wiki/

## Qué buscar

Para cada skill en `.claude/skills/*/references/`, verificar si el contenido duplica
algo que debería vivir (o ya vive) en `wiki/`.

## Mapeo conocido (actualizado 2026-04-16)

| Archivo references/ | Contraparte en wiki/ | Estado |
|---------------------|----------------------|--------|
| jira-writer/references/adf-format-guide.md | wiki/qa/adf-format-guide.md | ✅ Stub — SKILL.md ya apunta a wiki/ |
| audit-logs/references/log-conventions.md | wiki/core/logging.md | ✅ Stub — SKILL.md ya apunta a wiki/ |
| skill-creator/references/bluestack-conventions.md | wiki/development/skill-conventions.md | ✅ Stub — SKILL.md ya apunta a wiki/ |
| jira-writer/references/devsaas-flow.md | wiki/qa/devsaas-flow.md | ✅ Verificar si es stub o tiene contenido propio |
| jira-writer/references/field-map.md | — | ✅ Dato de instancia legítimo (IDs de campos) — NO mover |
| jira-reader/references/transitions.md | — | ✅ Dato de instancia legítimo (IDs de transiciones) — NO mover |
| jira-reader/references/pipeline-schema.md | wiki/qa/pipeline-integration-schema.md | Verificar |
| jira-writer/references/pipeline-schema.md | wiki/qa/pipeline-integration-schema.md | Verificar |

## Cómo distinguir: ¿convención general o dato de instancia?

| Es convención general → wiki/ | Es dato de instancia → references/ |
|-------------------------------|-------------------------------------|
| Patrón de código (ej: cómo formatear ADF) | IDs numéricos (customfield_10066) |
| Regla de comportamiento (ej: retry boundary) | Tokens o credenciales |
| Arquitectura o flujo de trabajo | Rutas absolutas del proyecto |
| Definición de nivel de log | Mapeos de enum → ID Jira |

## Acciones por caso

**Si references/ duplica contenido de wiki/:**
1. Verificar que wiki/ tiene el contenido completo (si no, agregar lo que falta)
2. Convertir el references/ en un stub de una línea: `> Contenido movido a wiki/X. Leer desde ahí.`
3. Actualizar SKILL.md para reemplazar el path `references/X.md` por el path wiki/

**Si references/ tiene contenido adicional no cubierto por wiki/:**
1. Agregar ese contenido a la página wiki/ correspondiente
2. Luego aplicar el caso anterior

**Si no hay contraparte en wiki/ y el contenido es una convención general:**
1. Crear la página wiki/ correspondiente en el subdirectorio apropiado (ver `doc-organization.md`)
2. Luego convertir references/ en stub y actualizar SKILL.md

## Validación final
- Ningún SKILL.md debe apuntar a un references/ que duplique wiki/
- Cada stub debe tener un link exacto al archivo wiki/ correspondiente