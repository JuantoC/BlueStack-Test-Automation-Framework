# Workspace Patterns — BlueStack QA Automation

> Patrones arquitecturales y landscape de skills. Referencia para evaluar si una skill nueva es necesaria o ya está cubierta.

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
├── .claude/
│   ├── CLAUDE.md          ← Reglas globales del agente
│   ├── rules/             ← Reglas contextuales (pages, ssot, doc-change, etc.)
│   └── skills/            ← Skills invocables (ver tabla abajo)
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

### sync-docs
- **Hace:** lee commits pendientes y sugiere actualizaciones de documentación
- **No hace:** aplica cambios automáticamente, genera código

### audit-docs
- **Hace:** ejecuta `scripts/audit-docs.ts` y resume inconsistencias
- **No hace:** corrige inconsistencias, genera código

### validate-ssot
- **Hace:** detecta lógica en `.md`, JSDoc desincronizado, skills con dependencia inversa
- **No hace:** corrige violaciones, genera código

### smart-commit
- **Hace:** analiza el working tree y ejecuta commits semánticos con contexto de negocio
- **No hace:** genera código, crea tests

### commit-report
- **Hace:** genera email/markdown de reporte QA desde git log
- **No hace:** genera código, ejecuta tests

### clean-code
- **Hace:** revisa código cambiado por calidad y lo refactoriza
- **No hace:** genera POMs desde cero, crea sessions

### audit-logs
- **Hace:** audita y corrige el uso de `logger.debug/info/warn/error` en archivos/carpetas `.ts` según convenciones Winston del proyecto
- **No hace:** modifica lógica funcional, agrega logs nuevos salvo en catch sin logger

### senior-prompt-engineer (esta skill)
- **Hace:** diseña/optimiza `SKILL.md`, prompts del sistema, frontmatter de skills
- **No hace:** genera POMs ni sessions directamente (los delega a pom-generator/create-session)

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

---

## Anti-patrones identificados en skills del proyecto

Cuando revisés una skill existente, buscá estos problemas:

| Anti-patrón | Cómo detectarlo | Cómo corregirlo |
|---|---|---|
| Frontmatter genérico | Se activa con cualquier pregunta sobre el tema | Reescribir con frases exactas de Juanto |
| Referencias a paths inexistentes | Leer los paths mencionados y verificar con Glob | Corregir paths o eliminar la referencia |
| Lógica de negocio en `.md` | Condicionales, tipos, enumeraciones de valores | Mover al código o eliminar |
| Scripts Python que no corren | Importan deps externas, rutas hardcodeadas incorrectas | Eliminar o reescribir con stdlib |
| Skill que duplica otra | Mismo dominio, diferente nombre | Consolidar o distinguir scope claramente |
| Instrucciones que contradicen CLAUDE.md | Verificar contra `.claude/CLAUDE.md` | Eliminar la contradicción |

---

## Estructura estándar de un SKILL.md en este proyecto

```
---
name: nombre-de-la-skill
description: >
  Descripción con frases trigger exactas. Mínimo 5 frases concretas
  que Juanto usaría. Terminar con frases alternativas.
---

# Título — Contexto del workspace

## Rol (quién sos, qué conocés del proyecto)

## Stack (si la skill genera código que debe compilar)

## Convenciones críticas (las que el output debe respetar)

## Tareas soportadas
### 1. Nombre de la tarea
**Cuándo:** frase trigger exacta
**Protocolo:** pasos numerados
**Reglas:** restricciones específicas

## Restricciones (lo que la skill nunca hace)

## Referencias (tabla: archivo → cuándo leerlo)
```
