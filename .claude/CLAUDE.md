# CLAUDE.md — BlueStack-Test-Automation-Framework

## Proyecto

Framework de automatización de pruebas UI end-to-end para el CMS interno de Bluestack.
Cubre flujos editoriales críticos: creación de contenido, gestión de video, generación de posts asistida por IA y publicación.

**Stack:** TypeScript · Selenium WebDriver · Jest · Allure · Docker Selenium Grid · faker-js
**Patrón:** Page Object Model (POM) con Facade Pattern
**Entorno:** WSL2 sobre Windows
**Autor Git:** `jtcaldera-bluestack` — `juanto1210oc@gmail.com`

---

## Comandos de Ejecución

Los tres modos de ejecución para tests individuales (`TestName` es el nombre del archivo sin extensión):

| Modo | Comando | Cuándo usar |
|---|---|---|
| **Dev** | `npm run test:dev -- TestName` | Desarrollo local, navegador visible |
| **Grid** | `npm run test:grid -- TestName` | Headless contra Docker Selenium Grid |
| **CI** | `npm run test:ci -- TestName` | Flujo completo (clean → infra:up → exec → infra:down) |

### Forma directa (sin npm scripts)

Cuando los scripts de npm no funcionan por el reenvío de args en WSL2, usar directamente:

```bash
# Dev (local, navegador visible)
cross-env NODE_OPTIONS='--experimental-vm-modules' USE_GRID=false IS_HEADLESS=false npx jest TestName

# Grid (headless, Docker)
cross-env NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true npx jest TestName
```

**Crítico:** `NODE_OPTIONS='--experimental-vm-modules'` es **siempre** obligatorio en este entorno (WSL2 + ESM). Los npm scripts ya lo incluyen vía `cross-env`. Nunca proponer `npx jest` desnudo.

---

## Reglas de Código

Aplican a toda interacción con el repositorio:

- Código explícito e intencional. Sin atajos inteligentes.
- Nunca silenciar errores: todo `catch` debe loguear y re-lanzar la excepción.
- Nunca usar `driver.sleep()` sin comentar por qué no funciona una espera explícita.
- Todos los imports internos TypeScript deben usar extensión `.js` (requisito ESM).
- Preferir edición puntual sobre reescritura total de archivos.
- No releer archivos ya leídos salvo que el archivo pueda haber cambiado.
- Sin aperturas aduladoras ni cierres de relleno.
- Las instrucciones del usuario siempre prevalecen sobre este archivo.

---

## Modelo SSoT

Reglas completas en `.claude/rules/ssot-enforcement.md` y `.claude/rules/skill-code-first.md`.

**Formato canónico de reporte de inconsistencia (obligatorio usar este bloque exacto):**
```
⚠️ INCONSISTENCIA DETECTADA
Código dice: [descripción de lo que dice el código]
.md dice:    [descripción de lo que dice el .md]
Acción recomendada: [tu recomendación]
¿Actualizo el .md para reflejar el código?
```

---

## Triggers de Comportamiento

- **Desarrollador modifica tipos TypeScript o firmas de funciones:** preguntar proactivamente *"¿Querés que actualice el JSDoc correspondiente y revise si hay `.md` relacionados que necesiten ajuste?"*
- **Nuevo test en `/sessions`:** activar skill `create-session`. El `.test.ts` generado es fuente de verdad del flujo cubierto; ningún `.md` puede contradecir lo que el test valida.

---