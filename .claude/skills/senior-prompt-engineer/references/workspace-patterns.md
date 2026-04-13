# Workspace Patterns — BlueStack QA Automation

> Patrones arquitecturales y landscape de skills. Referencia para optimizar skills existentes y detectar anti-patrones.

---

## Arquitectura del framework

```
BlueStack-Test-Automation-Framework/
├── sessions/              ← Tests E2E ejecutables (*.test.ts) — fuente de verdad del comportamiento
├── src/
│   ├── pages/             ← Capa POM: Maestros + sub-componentes por dominio
│   │   ├── login_page/
│   │   ├── post_page/
│   │   │   ├── AIPost/
│   │   │   └── note_editor_page/
│   │   │       └── note_list/
│   │   ├── videos_page/
│   │   │   └── video_editor_page/
│   │   ├── images_pages/
│   │   │   └── images_editor_page/
│   │   └── modals/        ← Modales compartidos
│   ├── core/
│   │   ├── actions/       ← clickSafe, waitFind, waitForVisible (primitivas de interacción)
│   │   ├── config/        ← defaultConfig (RetryOptions, resolveRetryConfig), envConfig
│   │   ├── utils/         ← logger, stackLabel, getAuthURL, errorUtils
│   │   └── wrappers/      ← testWrapper (runSession), retry
│   ├── interfaces/        ← data.ts (NoteData, VideoData, AINoteData, ImageData...)
│   └── data_test/
│       └── factories/     ← faker-js factories: index.js exporta todas
├── scripts/               ← audit-docs.ts, validate-ssot.ts (tsx)
├── wiki/                  ← Knowledge base compilada del framework (entry point: wiki/index.md)
├── .claude/
│   ├── CLAUDE.md          ← Reglas globales del agente
│   ├── rules/             ← Reglas contextuales (pages, ssot, doc-change, etc.)
│   ├── skills/            ← Skills invocables por conversación
│   └── pipelines/         ← Skills invocadas solo por agentes/hooks
└── docs/audit/            ← Output de scripts de auditoría
```

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
