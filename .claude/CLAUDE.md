# CLAUDE.md — BlueStack-Test-Automation-Framework

## Proyecto

Framework QA end-to-end para el CMS interno de Bluestack.
**Stack:** TypeScript · Selenium WebDriver · Jest · Allure · Docker Selenium Grid · faker-js  
**Patrón:** POM con Facade Pattern · **Entorno:** WSL2 · **Autor Git:** `jtcaldera-bluestack` — `juanto1210oc@gmail.com`

---

## Comandos de Ejecución

`NODE_OPTIONS='--experimental-vm-modules'` es **siempre obligatorio** en este entorno (WSL2 + ESM).

**NUNCA usar `npx jest` ni `npm run` para ejecutar tests directamente.** `npm` y `npx` resuelven al binario de Windows en WSL2 y fallan. Forma correcta siempre:
```
node node_modules/.bin/jest TestName
```

**Docker Grid:** Usar `docker compose up -d --wait` (NO `npm run infra:up` — mismo problema Windows).

Comandos completos, forma directa y curl de Jira: `.claude/references/COMMANDS.md`
Setup de infra y diagnóstico WSL2: `wiki/core/docker-grid.md`

> **Convención:** cuando generes o uses un comando nuevo relevante para el proyecto, agregalo a `.claude/references/COMMANDS.md`.

---

## Reglas de Código

Aplican a toda interacción con el repositorio:

- Código explícito e intencional. Sin atajos inteligentes.
- Nunca silenciar errores: todo `catch` debe re-lanzar la excepción. Detalle de tiers (dentro de retry vs. boundary externo): `wiki/patterns/conventions.md` § Retry Boundary · `wiki/core/logging.md` § Retry Boundary.
- Nunca usar `driver.sleep()` sin comentar por qué no funciona una espera explícita.
- Imports internos TypeScript: siempre extensión `.js` (requisito ESM).
- Preferir edición puntual sobre reescritura total de archivos.
- No releer archivos ya leídos salvo que el archivo pueda haber cambiado.
- Los `.md` son contexto/guía; nunca definiciones de tipos, interfaces ni lógica de comportamiento.
- Las instrucciones del usuario siempre prevalecen sobre este archivo.

---

## Reportar Inconsistencias Código/Docs

```
⚠️ INCONSISTENCIA DETECTADA
Código dice: [descripción de lo que dice el código]
.md dice:    [descripción de lo que dice el .md]
Acción recomendada: [tu recomendación]
¿Actualizo el .md para reflejar el código?
```

---

## Triggers de Comportamiento

- **Firmas TypeScript o tipos modificados** → preguntar: *"¿Querés que actualice el JSDoc correspondiente y revise si hay `.md` relacionados que necesiten ajuste?"*
- **Nuevo test en `/sessions`** → activar skill `create-session`. El `.test.ts` generado es fuente de verdad del flujo.
- **El usuario declara una convención explícita** (frases: "de ahora en más", "de ahora en adelante", "siempre que", "la convención es", "nunca más", "acordamos que", "usá siempre X", "a partir de ahora") → capturar **inmediatamente** en memoria SIN esperar al cierre de ninguna skill. Luego evaluar si es project-wide y proponer actualización a `wiki/patterns/conventions.md` según la regla en `.claude/rules/memory-wiki-bridge.md`.
- **Al finalizar cualquier skill activa** → aplicar internamente el proceso `skill-retrospective` antes de cerrar la respuesta. Excepciones: `skill-retrospective`, `skill-creator`, `senior-prompt-engineer`.
- **Al finalizar cualquier turno donde se editaron archivos `.ts`/`.md`** → aplicar internamente el proceso `skill-retrospective` para Lente 3 y Lente 4 aunque no haya corrido ninguna skill.

---

## Pipelines On-Demand

Las pipelines no se cargan automáticamente. Ver `.claude/pipelines/` para invocación y triggers.  
Regla: si una skill solo se activa desde otras skills o pipelines (nunca por conversación directa), va en `.claude/pipelines/`, no en `.claude/skills/`.

**Agentes personalizados:** Los pipelines principales fueron migrados a custom agents en `.claude/agents/` (`ticket-analyst`, `test-engine`, `test-reporter`, `qa-orchestrator`). El `qa-orchestrator` los invoca via el tool `Agent` con `subagent_type`, reemplazando el modelo anterior de pipelines-as-prompts. Los archivos en `.claude/pipelines/` se mantienen como referencia histórica.

---

## Acceso a Jira

MCP configurado via `.mcp.json` (`@sooperset/mcp-atlassian`). Proyecto: NAA. Claude puede leer tickets directamente.  
Curl manual: `.claude/references/COMMANDS.md`

---

## Wiki-first protocol

Antes de abrir cualquier `.ts`, leer `wiki/index.md`.
Si una página wiki cubre lo que necesitás, usarla — no abrir el source.
Si la wiki no cubre lo que necesitás, abrir el source y actualizar o crear
la página wiki correspondiente antes de terminar el task.
Si algo falta a mitad de un task, agregar `[gap] <tema>` a `wiki/log.md`.

## Wiki location

Todo el conocimiento compilado vive en `wiki/`. Entry point: `wiki/index.md`.
Organización y decision-tree para documentación: `.claude/rules/doc-organization.md`.