---
source: .claude/skills/skill-creator/references/bluestack-conventions.md
last-updated: 2026-04-14
---

# Convenciones BlueStack para Skills

## Tipos de skills

| Tipo | Ubicación | Consumidor | Frontmatter requerido |
|------|-----------|------------|----------------------|
| **Conversacional** | `.claude/skills/<nombre>/SKILL.md` | Humano via conversación o Claude por trigger automático | `name`, `description` (con trigger phrases en español) |
| **Pipeline** | `.claude/pipelines/<nombre>/PIPELINE.md` | Otro agente IA, un hook, o una skill (nunca directamente el humano) | `name`, `type: pipeline`, `invocation: explicit-only`, `called-by: [lista]`, `description` |

**Regla de ubicación:** si una skill solo se activa desde otras skills, hooks o pipelines — nunca por conversación directa — va a `.claude/pipelines/`, no a `.claude/skills/`.

## Idioma

Las instrucciones operativas de las skills están en español. El código (TypeScript) y los logs siguen el idioma del codebase.

## SSoT

Si la skill genera o edita archivos TypeScript, incluir explícitamente: _"El código es fuente de verdad. No embedar lógica funcional en `.md`."_

## Wiki-first protocol

El proyecto tiene una wiki compilada en `wiki/`. **Toda skill que necesite consultar información sobre el codebase debe seguir este orden:**

1. Leer `wiki/index.md` — entry point de toda la wiki.
2. Navegar a la página relevante si existe.
3. Solo abrir el `.ts` fuente si la wiki no cubre lo que se necesita — y en ese caso, registrar el gap en `wiki/log.md`.

**Al escribir una skill:** si el proceso de la skill incluye "leer archivos TypeScript para obtener firmas/tipos", agregar el paso wiki-first **antes** de ese paso. El modelo no debe saltear la wiki.

**Qué cubre la wiki:**
- `wiki/pages/<sección>.md` → firmas públicas de Maestros, constructores, métodos relevantes
- `wiki/patterns/factory-api.md` → API completa de factories de datos
- `wiki/interfaces/data-types.md` → todas las interfaces de datos
- `wiki/core/` → runSession, acciones, driver setup, errors, utils

## Archivos modulares

El SKILL.md debe ser un documento de flujo/procedimiento, no un monolito. Extraer a `references/`:
- Tablas de lookup (tipos, mapeos, traducciones) que vienen del código y pueden cambiar
- Catálogos de elementos del proyecto (POs disponibles, factories, paths de imports)
- Plantillas de output / templates de excepciones
- Documentación de integración con otras skills

**Regla de corte:** si el SKILL.md supera ~150 líneas, o si contiene tablas que duplican información del código (ej: lista de Maestros con paths), esas secciones deben vivir en `references/` con un puntero desde el SKILL.md.

**Patrón de puntero:**
```markdown
Si necesitás el catálogo de X → leer [`references/x.md`](references/x.md) (bundled con esta skill).
```

## Plantillas canónicas

**Skill conversacional:**
```yaml
---
name: nombre-skill
description: Descripción del propósito. Activar cuando el usuario diga: "frase 1", "frase 2", "frase 3".
---
```
- La `description` es el mecanismo primario de trigger. Incluir frases concretas en español que el usuario diría.
- Instrucciones operativas dentro del SKILL.md: en español, modo imperativo, rol definido al inicio.

**Pipeline / skill invocada solo por agentes:**
```yaml
---
name: nombre-pipeline
type: pipeline
invocation: explicit-only
called-by:
  - nombre-skill-invocadora (Paso N)
  - usuario directo vía instrucción explícita
description: Descripción del propósito en español.
---
```
- Ubicar en `.claude/pipelines/<nombre>/PIPELINE.md`
- Los pasos se numeran con encabezados `## Paso N — Nombre`
- Sin hedging ni explicaciones de jerga — el consumidor es un agente, no un humano

## Entorno WSL2

Este entorno corre en WSL2 sobre Windows — no hay display disponible.

Al generar el eval viewer desde skill-creator:
- Usar **siempre** `--static <output_path>` en lugar del servidor con `nohup`
- El archivo HTML generado puede abrirse desde Windows con `explorer.exe <output_path>`
