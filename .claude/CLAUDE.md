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

## Modelo SSoT — Instrucción Permanente

### Principio fundamental

El código TypeScript es la única fuente de verdad de este proyecto.
Los archivos `.md` son documentación contextual subordinada al código.
Cuando código y `.md` sean inconsistentes, **el código siempre prevalece**.

### Jerarquía de autoridad documental

1. Tipos TypeScript + interfaces → autoridad máxima
2. JSDoc/TSDoc inline → autoridad alta
3. Tests (archivos `.test.ts` en `/sessions`) → comportamiento observable, autoridad alta
4. `README.md` / `docs/*.md` → contexto, autoridad baja
5. `.claude/*.md` → instrucciones al agente, no describen el sistema

### Reglas que nunca debes violar

1. **Al generar o modificar código:** los contratos van en `.ts`, no en `.md`. Si necesitás documentar un contrato, usá JSDoc/TSDoc inline o un `type`/`interface` TypeScript.

2. **Al leer skills:** el input primario es **siempre** código TypeScript. Los `.md` describen cómo invocar la skill, no qué lógica ejecutar.

3. **Al detectar inconsistencia entre código y `.md`:** reportar con este formato exacto antes de hacer cualquier cambio:
   ```
   ⚠️ INCONSISTENCIA DETECTADA
   Código dice: [descripción de lo que dice el código]
   .md dice:    [descripción de lo que dice el .md]
   Acción recomendada: [tu recomendación]
   ¿Actualizo el .md para reflejar el código?
   ```

4. **Al crear archivos `.md`:** solo contenido contextual/descriptivo. Si te encontrás escribiendo condicionales, definiciones de tipos, enumeraciones de valores o contratos de funciones en un `.md`, detente y preguntá si ese contenido debe ir al código.

5. **Al invocar skills:** pasá siempre tipos TypeScript relevantes como input primario. El `.md` de la skill describe cómo usarla, no qué procesar.

---

## Automatización Documental — Git Hooks

### Cuándo ejecutar

Cuando el desarrollador diga "revisá la documentación pendiente" o pida leer `.claude/pending-doc-review-prompt.md`.

### Procedimiento

1. Leer `.claude/pending-doc-review-prompt.md`
2. Ejecutar los pasos indicados en ese archivo
3. Escribir resultados en `.claude/doc-update-suggestions.md`
4. Reportar el resumen y preguntar qué actualizar
5. **Solo aplicar cambios explícitamente confirmados por el desarrollador**

### Nunca hacer esto automáticamente

- Modificar archivos `.ts` o `.md` sin confirmación
- Marcar pendientes como "resolved" sin aprobación explícita
- Asumir que actualizar el `.md` es suficiente sin verificar el código primero

---

## Comandos de Auditoría y Validación

```bash
# Auditoría completa del estado documental
npx ts-node scripts/audit-docs.ts
# Output → docs/audit/doc-audit.json + docs/audit/AUDIT-SUMMARY.md

# Validar consistencia código ↔ documentación
npx ts-node scripts/validate-ssot.ts
# Output → docs/audit/ssot-violations.json
```

---

## Comportamiento en Situaciones Específicas

### Si el desarrollador pide "arreglá la documentación" o "sanitizá X"

1. Activar la skill `sanitize-docs`
2. Leer primero los tipos TypeScript y firmas del módulo indicado (input primario)
3. Proponer los cambios de JSDoc/TSDoc antes de aplicarlos
4. Esperar confirmación antes de modificar archivos

### Si el desarrollador modifica tipos TypeScript o firmas de funciones

Preguntar proactivamente: *"¿Querés que actualice el JSDoc correspondiente y revise si hay `.md` relacionados que necesiten ajuste?"*

### Si una skill falla o produce resultados inesperados

Verificar primero si el `.md` de la skill refleja el código actual. Si hay inconsistencia, reportar con el formato `⚠️ INCONSISTENCIA DETECTADA` antes de intentar corregir la skill.

### Si se crea un nuevo test en `/sessions`

Activar la skill `create-session`. El archivo `.test.ts` generado es fuente de verdad del comportamiento esperado del flujo cubierto. Ningún `.md` puede contradecir lo que el test valida.

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
| `.claude/skills/week-report/SKILL.md` | Genera el correo semanal de reporte de avance QA para el PM |
| `.claude/skills/create-session/SKILL.md` | Genera archivos `.test.ts` para nuevos casos de prueba en `/sessions` |
| `.claude/skills/sanitize-docs/SKILL.md` | Revisa y documenta funciones/clases públicas con JSDoc completo e inline comments |
| `.claude/skills/audit-docs/SKILL.md` | Audita todas las fuentes de verdad del repositorio y detecta inconsistencias código/documentación |
| `.claude/skills/sync-docs/SKILL.md` | Sincroniza documentación con el código tras un commit; genera sugerencias de actualización sin aplicarlas automáticamente |
| `.claude/skills/validate-ssot/SKILL.md` | Valida que el modelo SSoT se respete: detecta lógica en `.md`, JSDoc desincronizado y skills con dependencia inversa |