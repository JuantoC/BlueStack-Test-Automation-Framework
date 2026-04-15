# Workspace Patterns — BlueStack QA Automation

> Landscape de skills y anti-patrones. Referencia para optimizar skills existentes.

> Arquitectura del framework, estructura de carpetas y stack: [wiki/overview.md](../../../../wiki/overview.md)

---

## Landscape de skills — qué hace cada una y qué NO hace

### pom-generator
- **Hace:** genera archivos `.ts` en `src/pages/` (Maestros y sub-componentes) desde descripción de UI
- **No hace:** genera tests, optimiza prompts, documenta JSDoc existente

### create-session
- **Hace:** genera archivos `.test.ts` en `sessions/` desde descripción de flujo
- **No hace:** genera POMs, optimiza skills, documenta código

### sanitize-docs
- **Hace:** agrega/actualiza JSDoc/TSDoc en archivos `.ts` existentes
- **No hace:** genera código nuevo, crea sessions

### audit-docs
- **Hace:** ejecuta `scripts/audit-docs.ts` y resume inconsistencias entre código y docs
- **No hace:** corrige inconsistencias, genera código

### audit-logs
- **Hace:** audita y corrige el uso de `logger.debug/info/warn/error` en archivos/carpetas `.ts` según convenciones Winston del proyecto
- **No hace:** modifica lógica funcional, agrega logs nuevos salvo en catch sin logger

### generate-readme
- **Hace:** genera o actualiza `README.md` para carpetas o módulos del proyecto
- **No hace:** modifica código TypeScript, genera POMs

### smart-commit
- **Hace:** analiza el working tree y ejecuta commits semánticos con contexto de negocio
- **No hace:** genera código, crea tests

### commit-report
- **Hace:** genera reporte de actividad QA desde git log
- **No hace:** genera código, ejecuta tests

### skill-creator
- **Hace:** crea skills nuevas, mejora skills existentes con ciclo eval/iterate, optimiza descripción de trigger
- **No hace:** genera POMs ni sessions, ejecuta tests de QA

### senior-prompt-engineer (esta skill)
- **Hace:** optimiza `SKILL.md` existentes, revisa frontmatter/triggers, diseña prompts para generación de código, revisa JSDoc
- **No hace:** crea skills nuevas (eso es `/skill-creator`), genera POMs ni sessions directamente

---

## Flujo típico de una tarea QA

```
1. Descripción funcional del flujo (ej: "el usuario sube una imagen y la publica")
       ↓
2. pom-generator → genera POMs necesarios en src/pages/
       ↓
3. create-session → genera .test.ts en sessions/
       ↓
4. Ejecución manual: npm run test:dev -- NombreTest
       ↓
5. Debug / ajuste de locators en POMs
       ↓
6. sanitize-docs → documenta JSDoc en archivos modificados
       ↓
7. smart-commit → commit con contexto de negocio
       ↓
8. (periódico) commit-report → reporte de avance QA
```

---

## Reglas del proyecto que impactan el diseño de skills

Ver `.claude/CLAUDE.md` para el texto completo. Puntos críticos:

1. **SSoT:** el código TypeScript es la fuente de verdad. Las skills leen código primero, `.md` después.
2. **No lógica en `.md`:** las skills no deben contener tipos, interfaces, ni contratos — van en código.
3. **`skill-code-first`:** el input primario de cualquier skill es siempre código TypeScript.
4. **`no-logic-in-md`:** los bloques de código en `.md` son solo ilustrativos, no normativos.
5. **Wiki-first:** antes de abrir un `.ts`, verificar si la wiki ya cubre ese conocimiento.

---

## Anti-patrones identificados en skills del proyecto

Cuando revisés una skill existente, buscá estos problemas:

| Anti-patrón | Cómo detectarlo | Cómo corregirlo |
|---|---|---|
| Frontmatter genérico | Se activa con cualquier pregunta sobre el tema | Reescribir con frases exactas de Juanto |
| Referencias a paths inexistentes | Leer los paths mencionados y verificar con Glob | Corregir paths o eliminar la referencia |
| Lógica de negocio en `.md` | Condicionales, tipos, enumeraciones de valores | Mover al código o eliminar |
| Skill que duplica otra | Mismo dominio, diferente nombre | Consolidar o distinguir scope claramente |
| Instrucciones que contradicen CLAUDE.md | Verificar contra `.claude/CLAUDE.md` | Eliminar la contradicción |
| SKILL.md monolítico | Más de 150 líneas, tablas con datos del código | Modularizar en `references/` |
| Wiki-first ausente | La skill abre `.ts` sin mencionar consultar la wiki | Agregar paso wiki-first antes de abrir fuentes |
| Skills muertos referenciados | Tabla de skills con entradas que no existen en `.claude/skills/` | Verificar con Glob y eliminar entradas muertas |

---

## Pipeline Prompt Budget — reglas para briefings de agentes de pipeline

Los pipelines corren sin intervención humana. El contexto es finito y no hay retry manual.

### Fuentes de consumo por tamaño (de mayor a menor)

| Fuente | Costo típico | Mitigación |
|---|---|---|
| Briefing inicial con schemas JSON inline | Alto | Referenciar path+sección, no reproducir contenido |
| `getJiraIssue` con `comment` | Alto | OP-1-LIGHT primero; `comment` solo si descripción vacía |
| Architecture doc leído completo | Alto | Grep línea de sección → Read con offset+limit preciso |
| JQL sin filtro de componente ni maxResults bajo | Medio-alto | `maxResults: 5` + `fields` mínimos; subagente para exploraciones |
| Múltiples PIPELINE.md leídos completos en paralelo | Medio | Leer solo la sección necesaria usando offset+limit |
| Respuesta overflow de Jira API | Bajo (el archivo se guarda en disco) | Subagente Explore para extraer solo lo necesario del archivo |

### Patrón: leer secciones de docs sin cargar el archivo entero

```
# En lugar de: Read(architecture.md) completo
# Hacer:
Read("docs/architecture/qa-pipeline/02-arquitectura-agentes.md")  # §3 completo, ~280 líneas
```

### Patrón: subagente para exploración JQL ancha

Cuando se necesita descubrir qué tickets existen en un componente, no cargar
los resultados completos en el contexto principal:

```
Agent({
  subagent_type: "Explore",
  prompt: "Busca en Jira (cloudId: c303d73b-...) tickets de componente Video
           con JQL: project=NAA AND issuetype in ('QA Bug - Front','QA Bug - Back')
           AND text ~ 'Video' ORDER BY updated DESC.
           Campos: summary, status, customfield_10061. maxResults: 10.
           Retorná solo: [{key, summary, status, component}]. Nada más."
})
```

El resultado limpio (array de objetos pequeños) entra al contexto principal.
El raw de Jira (con ADF, URLs, avatars, metadata) queda aislado en el subagente.

### Señales de que un briefing está inflado

- Tiene >200 líneas
- Repite schemas que ya están en PIPELINE.md o architecture doc
- Dice "leer el archivo X completo" sin especificar sección
- No menciona OP-1-LIGHT en tareas que involucran Jira
- Incluye "ESTADO DEL PIPELINE" con >15 checkboxes (moverlos a wiki)

---

## Estructura estándar de un SKILL.md en este proyecto

```
---
name: nombre-de-la-skill
description: >
  Descripción con frases trigger exactas. Mínimo 4-5 frases concretas
  que Juanto usaría. Terminar con el dominio de aplicación.
---

# Título — Contexto del workspace

## Rol (quién sos, qué conocés del proyecto)

## Wiki-first (si la skill consulta el codebase)

## Stack (si la skill genera código que debe compilar)

## Tareas soportadas
### 1. Nombre de la tarea
**Cuándo:** frase trigger exacta
**Protocolo:** pasos numerados
**Reglas:** restricciones específicas

## Restricciones (lo que la skill nunca hace)

## Referencias (tabla: archivo → cuándo leerlo)
```
