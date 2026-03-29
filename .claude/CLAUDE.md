# CLAUDE.md — BlueStack-Test-Automation-Framework

## Proyecto
Framework de automatización de pruebas UI end-to-end para el CMS interno de Bluestack.
Cubre flujos editoriales críticos: creación de contenido, gestión de video, generación de posts asistida por IA y publicación.

**Stack:** TypeScript · Selenium WebDriver · Jest · Allure · Docker Selenium Grid · faker-js  
**Patrón:** Page Object Model (POM) con Facade Pattern  
**Entorno:** WSL2 sobre Windows  
**Autor Git:** `jtcaldera-bluestack` — `juanto1210oc@gmail.com`

---

## Reglas Generales de Comportamiento

Estas reglas aplican a **toda interacción** con el repositorio, sin excepción.

- Preferir siempre código explícito e intencional por sobre atajos inteligentes.
- Nunca silenciar errores. Todo bloque `catch` debe loguear y re-lanzar la excepción.
- Nunca usar `driver.sleep()` sin un comentario que explique por qué no funciona una espera explícita.
- Todos los imports internos de TypeScript deben usar la extensión `.js` (requisito de ESM).

---

## Reglas Contextuales Activas

Las siguientes reglas aplican según el contexto de la tarea. El agente debe cargarlas cuando corresponda:

| Contexto | Archivo de referencia |
|---|---|
| Crear o modificar cualquier archivo en `src/pages/` | `.claude/rules/pages.md` |

---

## Skills Disponibles

Capacidades automatizadas invocables por el agente:

| Skill | Descripción |
|---|---|
| `.claude/skills/reporte-semanal.md` | Genera el correo semanal de reporte de avance QA para el PM |