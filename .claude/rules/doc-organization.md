# DOC-ORGANIZATION — Dónde vive cada tipo de documento

## Principio único

Un concepto técnico = un archivo canónico en wiki/. Todos los demás lo referencian.
Nunca duplicar. Si ya existe en wiki/, solo apuntar.

---

## Mapa de decisión

```
¿Es un comando de ejecución (npm, bash, curl)?
  → .claude/references/COMMANDS.md

¿Es una regla crítica de comportamiento del agente?
  → .claude/CLAUDE.md (línea o bullet breve) + referencia a wiki/ para detalle

¿Es una regla de enforcement del agente (SSoT, prioridad de lectura, organización)?
  → .claude/rules/ (archivo específico de la regla)

¿Es conocimiento compilado del proyecto (arquitectura, patrones, API, tipos, convenciones)?
  → wiki/ (entry point: wiki/index.md)
    - Motor y API de ejecución → wiki/core/
    - Patrones y convenciones → wiki/patterns/
    - Pages y contratos de UI → wiki/pages/
    - Interfaces de datos → wiki/interfaces/
    - Catálogo de tests → wiki/sessions/
    - Pipeline QA → wiki/pipelines/
    - Convenciones de desarrollo → wiki/development/
    - Integración con Jira/QA → wiki/qa/

¿Es la especificación técnica de un módulo específico (src/X)?
  → src/X/README.md (puede coexistir con wiki/ con enfoque técnico vs educativo)
  → Si hay overlap: src/X/README.md referencia a wiki/, no duplica

¿Es el contrato operativo específico de una skill (IDs de Jira, mapas de campos, templates)?
  → .claude/skills/<nombre>/references/
  → Si es "convención del proyecto" → ir a wiki/ primero
  → Si es "dato de instancia/configuración" (IDs, rutas exactas, etc.) → queda en references/

¿Es el contrato operativo específico de un pipeline?
  → .claude/pipelines/<nombre>/references/
```

---

## Regla going-forward

Antes de escribir documentación nueva:
1. Verificar en `wiki/index.md` si ya existe una página que cubra el concepto.
2. Si existe → referenciar desde el origen, no duplicar.
3. Si no existe → crear en `wiki/` siguiendo el mapa de decisión arriba.
4. Nunca crear convenciones del proyecto en `.claude/skills/*/references/` — solo datos operativos de instancia.

**Señal de que algo está mal:**
- El mismo término técnico definido en más de un `.md` → consolidar en wiki/
- Una tabla de comandos en más de un lugar → COMMANDS.md es la única fuente
- Un `references/` con más de ~80 líneas de convenciones → mover a wiki/

---

## Contenido que NO va en wiki/

| Contenido | Dónde va |
|---|---|
| Comandos de ejecución (npm, bash, curl) | `.claude/references/COMMANDS.md` |
| Reglas de comportamiento del agente | `.claude/CLAUDE.md` |
| IDs de campos custom Jira (customfield_*) | `.claude/skills/jira-*/references/` |
| Transiciones de Jira (IDs numéricos) | `.claude/skills/jira-reader/references/transitions.md` |
| Mapas de campos Jira con IDs | `.claude/skills/jira-writer/references/field-map.md` |
| Imports de maestros con rutas exactas | `.claude/skills/create-session/references/maestros.md` |
| Reglas de clasificación de tickets (contrato de pipeline) | `.claude/pipelines/ticket-analyst/references/` |
| Definiciones de tipos, interfaces, lógica funcional | Archivos `.ts` — nunca `.md` |

---

## Reporte de inconsistencias (no corregir — solo reportar)

Si durante una tarea detectás que un `.md` define comportamiento que debería estar en código,
o que un concepto técnico está documentado en dos lugares con contenido diferente:

Usar el formato de CLAUDE.md:
```
⚠️ INCONSISTENCIA DETECTADA
Código dice: [...]
.md dice:    [...]
Acción recomendada: [...]
```