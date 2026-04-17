# Checklist: Dispersión de convenciones

## Principio

Las convenciones de proyecto que aplican a todo el codebase deben vivir en `wiki/`.
`CLAUDE.md` puede tener una línea + link. Los SKILL.md no deben definir convenciones generales.

## Fuentes canónicas de convenciones (2026-04-16)

| Tipo de convención | Fuente canónica |
|--------------------|-----------------|
| Arquitectura POM, naming, locators, constructores | wiki/patterns/conventions.md |
| Logging levels (debug/info/warn/error) | wiki/core/logging.md |
| Retry boundary (tiers de catch) | wiki/patterns/conventions.md § Retry Boundary |
| driver.sleep() prohibición | wiki/patterns/conventions.md § Anti-patrones |
| ESM imports con .js | wiki/patterns/conventions.md § Import obligatorio |
| Formato ADF para Jira rich text | wiki/qa/adf-format-guide.md |
| Comandos de ejecución (NODE_OPTIONS, no npx) | .claude/references/COMMANDS.md |
| Convenciones de skill (tipos, plantillas, idioma) | wiki/development/skill-conventions.md |
| Formato de commits | wiki/development/commit-conventions.md |

## Qué buscar en CLAUDE.md y SKILL.md

Señales de que una convención está mal ubicada:
- CLAUDE.md tiene una sección detallada (>3 líneas) sobre algo que ya está en wiki/
- Un SKILL.md define una regla de código dentro de su flujo (ej: "los locators siempre son private static readonly")
- La misma regla aparece enunciada en 2 o más archivos con redacción diferente

## Acciones por caso

**Convención en CLAUDE.md con detalle excesivo:**
1. Verificar que wiki/ tenga la versión completa y correcta
2. Si wiki/ la cubre: comprimir CLAUDE.md a `[Regla breve] → Ver [wiki/patterns/conventions.md § Sección](...)` 
3. Si wiki/ NO la cubre: agregar la sección a wiki/ primero, luego comprimir

**Convención en SKILL.md:**
1. Mover a wiki/patterns/conventions.md o wiki/development/skill-conventions.md
2. Reemplazar en SKILL.md con un puntero: "Seguir convención X de wiki/patterns/conventions.md"

**Convención duplicada con redacción diferente:**
1. Elegir la versión más completa y precisa
2. Consolidar en wiki/
3. Eliminar o comprimir todas las copias a una línea + link

## Convenciones que NO van en wiki/

- IDs de Jira (customfield_*) → .claude/skills/jira-*/references/
- Transiciones Jira (IDs numéricos) → .claude/skills/jira-reader/references/transitions.md
- Imports con rutas exactas de maestros → .claude/skills/create-session/references/maestros.md
- Reglas de comportamiento del agente (no del código) → .claude/CLAUDE.md (línea breve)

## Validación final
- wiki/patterns/conventions.md debe ser la única fuente completa de convenciones de código TypeScript
- CLAUDE.md sección "Reglas de Código" no debe superar ~8 bullets con links a wiki/