---
name: update-testids
description: >
  Lee un ticket de Jira con screenshots de DevTools, extrae los data-testid implementados
  por el front, actualiza los locators en los POMs del framework, valida en un flujo grid real
  y actualiza su propio conocimiento base. Activar cuando el usuario diga: "actualizar los
  testids del ticket X", "levantar los data-testid de NAA-XXXX", "actualizar los POMs con los
  testids nuevos", "sincronizar los locators con el front", "el front implementó data-testid en X",
  "hay testids nuevos en el ticket", "levantá los locators del ticket".
---

# update-testids — BlueStack QA Automation

Skill de actualización de locators POM a partir de tickets de Jira con screenshots de DevTools.
Orquesta sub-agentes paralelos para minimizar tiempo de ejecución y presupuesto de contexto.

**Flujo canónico de 5 pasos:**
```
1. encontrar campos   → Agentes A/B/C extraen data-testid desde Jira (imágenes o HTML)
2. ajustar POMs       → Agente D aplica ediciones puntuales de locators
3. ⏸ campos manuales → pausa: el usuario puede agregar campos inspeccionados con F12
4. generar tests      → Agente E invoca `create-session` (modo debug) para cada área modificada
5. validar en grid    → tests con interacciones reales (click/write) en Docker Grid (master)
```

---

## Rol

Sos el agente orquestador de la skill `update-testids`. Tu trabajo es coordinar la extracción de
`data-testid` desde Jira, la actualización de POMs, la validación en navegador real, y el registro
del conocimiento adquirido en los references de esta misma skill.

Conocés el framework de automatización BlueStack: TypeScript + Selenium WebDriver + Jest, patrón
POM con Facade, entorno WSL2. Los locators viven como `private static readonly` en sub-componentes.

---

## Sub-agentes — por qué son OBLIGATORIOS

Esta skill **no se ejecuta en el contexto del orquestador**. Cada fase debe lanzarse
con el tool `Agent` para aislar el contexto. Esto no es opcional ni una optimización:

**Motivo:**
- Una ejecución completa (leer Jira + descargar imágenes + leer POMs + aplicar ediciones +
  ejecutar tests + actualizar references) consume fácilmente 80k-120k tokens de contexto.
- Si todo corre en el mismo hilo, el orquestador se queda sin ventana antes de llegar a FASE 3.
- Los errores por contexto agotado son silenciosos: el agente empieza a alucinar paths,
  ignorar restricciones y perder coherencia sin avisar.

**Cómo invocar cada agente:**

```
Agent({
  subagent_type: "Explore",          // para lectura/exploración — Agentes A y B
  subagent_type: "general-purpose",  // para escritura/ejecución — Agentes C, D, E, F
  description: "Nombre corto del agente",
  prompt: `<brief completo copiado de la sección correspondiente>`
})
```

**Reglas de lanzamiento:**
- Agentes A y B → lanzar en **el mismo mensaje** (tool calls paralelas en un solo response)
- Agente C → lanzar solo después de que A y B terminen (depende de sus outputs)
- Agentes D, E, F → secuenciales, cada uno depende del anterior
- **Nunca ejecutar lógica de Fase N en el contexto del orquestador** — el orquestador
  solo sintetiza resultados y lanza el siguiente agente

---

## Wiki-first

Antes de abrir cualquier `.ts`, leer `wiki/index.md`. Si la wiki cubre lo que necesitás, usarla.
Si no, abrir el source y registrar el gap en `wiki/log.md`.

Páginas wiki relevantes a esta skill:
- `wiki/pages/post-page.md` — estructura de MainPostPage y sus sub-componentes
- `wiki/patterns/conventions.md` — arquitectura de locators, naming, anti-patrones

---

## Credenciales y endpoints

Las credenciales están en `.mcp.json`. Nunca hardcodearlas en código generado.

```bash
# Leer credenciales
JIRA_USER=$(cat .mcp.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['mcpServers']['jira']['env']['JIRA_USERNAME'])")
JIRA_TOKEN=$(cat .mcp.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['mcpServers']['jira']['env']['JIRA_API_TOKEN'])")

# Listar attachments de un issue
curl -s -u "$JIRA_USER:$JIRA_TOKEN" \
  "https://bluestack-cms.atlassian.net/rest/api/3/issue/{KEY}?fields=attachment" \
  | python3 -m json.tool | grep -E '"filename"|"content"|"id"'

# Descargar imagen (siempre con -L para seguir redirects)
curl -s -L -u "$JIRA_USER:$JIRA_TOKEN" \
  "https://bluestack-cms.atlassian.net/rest/api/3/attachment/content/{ID}" \
  -o /tmp/testid-images/{nombre}.png -w "%{http_code}\n"
```

CloudId Atlassian: `c303d73b-75df-492e-9e64-479b722035cf`

---

## Arquitectura de sub-agentes

```
Input: Jira ticket key (ej: NAA-4324) — OPCIONAL si el usuario pegó HTML directamente
        │
        ├─ ¿El usuario pegó HTML del DOM? ──────────────────────────────────────────┐
        │   SÍ → PATH-B (ver FASE 0.5)                                              │
        │   NO → PATH-A (flujo estándar)                                            │
        │                                                                            │
        │  PATH-A ──────────────────────────────────────────────────────────────────┤
        ├─── [PARALELO] Agente A (Explore) ─────────────────────────────────────────┤
        │    Lee ticket + comentarios via MCP. Obtiene lista de attachments         │
        │    con nombres, IDs y URLs. Filtra solo imágenes PNG.                     │
        │    Retorna: [{filename, attachmentId, commentContext}]                     │
        │                                                                            │
        ├─── [PARALELO] Agente B (Explore) ─────────────────────────────────────────┤
        │    Lee los POMs afectados listados en references/pom-component-map.md.    │
        │    Para cada POM: extrae los locators actuales (estáticos + tipo By).     │
        │    Retorna: {archivo: {locatorName: locatorValue}}                         │
        │                                                                            │
        └──── [TRAS A+B] Agente C (general-purpose) ────────────────────────────────┤
             Descarga imágenes via curl. Usa Read (visión) por imagen para          │
             extraer data-testid del HTML del DevTools. Cruza con el mapa           │
             de componentes. Retorna tabla: {testid, elemento, pomArchivo,          │
             locatorActual, locatorNuevo}                                            │
                      │                                                              │
        │  PATH-B ────────────────────────────────────────────────────────────────┘ │
        │   Orquestador extrae testids del HTML pegado (texto plano, sin agente).   │
        │   Lanzar solo Agente B. Ir directo a FASE 2.5.                            │
        │                                                                            │
                      ▼
             PAUSA — preguntar campos no resueltos (ver §Campos no resueltos)
             Tip al usuario: podés pegar HTML adicional de campos sin resolver
             en lugar de responder campo por campo.
                      │
                      ▼
        [SECUENCIAL] Agente D (general-purpose)
             Aplica los cambios a los POMs usando Edit puntual.
             Solo modifica la línea del locator, sin reescribir el archivo.
             Prioriza los locators ROTOS primero (ver §Prioridad de cambios).
                      │
                      ▼
        [SECUENCIAL] Agente E (general-purpose)
             Ejecuta test de validación grid real. Interactúa con cada
             campo modificado. Verifica ausencia de NoSuchElementException.
             Si un locator falla: reporta → orquestador registra en §Fallbacks.
                      │
                      ▼
        [SECUENCIAL] Agente F (general-purpose)
             Actualiza references/known-testids.md con los datos del ticket.
             Actualiza references/pom-component-map.md si hay POMs nuevos.
             Registra resultado en wiki/log.md si hubo gaps.
```

---

## FASE 0 — Validación de input

Antes de lanzar los agentes, verificar:
1. El ticket key tiene formato `NAA-XXXX`
2. El ticket existe y tiene status `Done` o `In Review` (cambios ya aplicados al front)
3. Existe al menos un attachment PNG en el issue **O** el usuario pegó HTML del DOM en el chat

Si el ticket está en `In Progress`: advertir que los testids pueden no estar en el DOM aún.

**Si no hay PNG ni HTML disponibles → bloquear y pedir input:**
Si el issue no tiene attachments PNG Y el usuario no pegó HTML en el chat:
- No lanzar ningún agente.
- Responder con este mensaje exacto:
  ```
  ⛔ Sin input visual no puedo extraer data-testid.
  Necesito al menos una de estas opciones:
  1. Un screenshot de DevTools (PNG adjunto al ticket Jira)
  2. El HTML del DOM pegado en el chat (F12 → inspeccionar → copiar outerHTML)
  ¿Podés agregar alguno de los dos?
  ```
- Esperar respuesta del usuario antes de continuar.

**Detección de input alternativo → ir a FASE 0.5:**
- El mensaje contiene bloques HTML con atributos `data-testid`
- El usuario usó frases como "acá está el HTML", "te pego el DOM", "inspeccioné con F12"
- No hay attachments PNG en el issue Jira

---

## FASE 0.5 — Input alternativo: HTML manual

Aplica cuando el usuario proporciona HTML del DOM directamente en el chat
en lugar de (o además de) screenshots PNG en Jira.

**PATH-A (default):** input = Jira key + screenshots PNG → continuar a FASE 1 normalmente.

**PATH-B (HTML manual):** input incluye HTML pegado en el chat → seguir esta sección.

### PATH-B — Protocolo

1. **Saltar Agente A y Agente C** — no hay imágenes que descargar ni visión que aplicar.

2. El orquestador extrae los `data-testid` directamente del HTML pegado.
   Es procesamiento de texto plano — no requiere sub-agente. Construir tabla:

   | data-testid extraído | elemento HTML | contexto (label/sección visible) |
   |---|---|---|
   | input-title | textarea | campo Título del panel Info |
   | check-autoplay | mat-slide-toggle | toggle Autoplay |
   | ... | ... | ... |

   Regla: ser literal con los valores — no inferir ni completar nombres truncados.
   Si un testid está cortado, marcarlo como TRUNCADO.

3. Lanzar solo **Agente B** para leer los POMs afectados (igual que en PATH-A).

4. Ir directamente a **FASE 2.5** con la tabla ya construida (saltar FASE 1 y FASE 2).

### Caso especial: testids de contenedores compartidos

Algunos elementos del DOM tienen `data-testid` pero son contenedores genéricos compartidos
entre múltiples acciones (ej: `dropdown-menu`, `option-create`). Estos aparecen tanto en el
dropdown de Save como en el de Publish con el mismo testid.

Regla: documentarlos en la tabla de extracción, pero **no crear locators para ellos** en los POMs.
Razón: un selector `[data-testid="dropdown-menu"]` encontraría ambos dropdowns y sería ambiguo.
Si se necesita referenciar el contenedor, hacerlo mediante el locator del toggle que lo precede.

### Caso mixto: HTML manual + Jira key con attachments

- Usar el HTML manual como fuente primaria de testids (más confiable — sin truncado ni artefactos de captura).
- Lanzar Agente A solo para obtener contexto del ticket (descripción, comentarios), no para descargar imágenes.
- Saltar Agente C igualmente.

### Caso PATH-B sin ningún ticket key

Cuando el usuario pega HTML directamente pero NO proporciona ningún key de Jira:

- Ejecutar el flujo PATH-B normalmente (Agente B + tabla de cambios + FASE 2.5 en adelante).
- **FASE 4 (validación en grid):** es aceptable omitirla si el usuario no tiene un entorno de
  referencia disponible. Notificarlo explícitamente al final del output:
  ```
  ⚠️ FASE 4 omitida — no hay ticket de referencia ni sesión de validación disponible.
  Los cambios están aplicados pero no se ejecutaron tests de interacción real en grid.
  Para validar, ejecutar manualmente: NODE_OPTIONS='--experimental-vm-modules' node node_modules/.bin/jest DebugTestids
  ```
- **FASE 5 (Agente F / known-testids):** registrar la entrada sin key usando la fecha como identificador:
  ```
  ## Sin ticket — inspección manual {YYYY-MM-DD}
  **Fuente:** HTML pegado directamente en el chat
  **Área:** {área inferida del HTML o indicada por el usuario}
  ```
  El template de esta entrada sigue el mismo formato de tabla que las entradas con key.

---

## FASE 1 — Extracción paralela

Lanzar Agente A y Agente B en el **mismo mensaje** (tool calls paralelas) usando el tool `Agent`.
Ambos son `subagent_type: "Explore"` — solo leen, no escriben:

**Agente A — brief:**
```
Leé el ticket Jira {KEY} usando MCP Atlassian (cloudId: c303d73b-75df-492e-9e64-479b722035cf).
Necesito:
1. Título y descripción del ticket (resumen de qué se implementó)
2. Lista de TODOS los comentarios con su autor y fecha
3. Lista de attachments del issue: filename, id, content URL
   Usar: curl -u "$JIRA_USER:$JIRA_TOKEN" "https://bluestack-cms.atlassian.net/rest/api/3/issue/{KEY}?fields=attachment"
Filtrar: solo archivos .png (excluir .mp4, .webm, .md).
Para cada PNG, indicar en qué comentario aparece (contexto: qué punto del ticket documenta).
Retornar JSON limpio: [{filename, attachmentId, commentDate, commentAuthor, pointContext}]
Nada más — sin metadata de Jira, sin URLs de avatares.
```

**Agente B — brief:**
```
Leé los POMs del framework BlueStack que pueden tener locators afectados.

Paso 1 — determinar el scope dinámicamente:
1. Leer references/pom-component-map.md para obtener la lista base de POMs mapeados.
2. Adicionalmente, buscar con Grep cualquier .ts en src/pages/ que contenga selectores
   genéricos sin testid específico, por ejemplo:
   - By.css('[data-testid="dropdown-item"]')   (exacto, sin ^= ni valor único)
   - By.xpath que use texto visible (normalize-space, contains(text()))
   - By.id() con IDs compartidos como "option-dropdown-0"
   Incluir esos archivos aunque no estén en pom-component-map.md.

Paso 2 — para cada archivo del scope resultante:
   Extraé SOLO el bloque de locators estáticos (líneas con `private static readonly` y `By.`).
   Retorná: {archivo: [{nombre, selector}]}
   Nada más — sin métodos, sin JSDoc, sin imports.
```

---

## FASE 2 — Descarga y visión (Agente C)

Con los resultados de A (lista de PNGs + IDs), lanzar Agente C via `Agent tool`
(`subagent_type: "general-purpose"`). Las imágenes y la visión consumen mucho contexto —
aislarlas en un subagente evita contaminar el hilo del orquestador.

**Brief de Agente C:**
```
Tarea: descargar imágenes de Jira y extraer data-testid con visión.

Credenciales: leer de .mcp.json (JIRA_USERNAME + JIRA_API_TOKEN).
Directorio destino: /tmp/testid-images/ (crearlo si no existe).

Para cada imagen de la lista {lista_de_A}:
1. Descargar con curl -s -L -u "$USER:$TOKEN" "{content_url}" -o /tmp/testid-images/{filename} -w "%{http_code}"
2. Si HTTP != 200: registrar como FAILED y continuar.
3. Leer con Read tool (visión). Buscar en el HTML del DevTools: atributos data-testid="..."
4. Extraer TODOS los data-testid visibles en la imagen.
5. Anotar el elemento HTML (button, div, input, mat-checkbox) y su contexto visual.

Retornar tabla:
| filename | data-testid extraídos | elemento | contexto |
Sé literal con los valores — no inferir ni completar nombres truncados.
Si un testid está cortado en la imagen, marcarlo como TRUNCADO.
```

---

## FASE 2.5 — Síntesis y preguntas al usuario

Con los resultados de B (locators actuales) y C (testids extraídos):

1. **Detectar componentes sin POM existente:**

   Para cada `data-testid` extraído por Agente C, verificar en `references/pom-component-map.md`
   si tiene un POM mapeado. Si no lo tiene:
   - Marcarlo como **GAP — SIN POM**
   - Antes de continuar con Agente D, proponer al usuario:
     ```
     ⚠️ GAP DETECTADO — COMPONENTE SIN POM
     Los siguientes testids no tienen un POM existente en el framework:
     - {testid} → componente: {nombre inferido} → archivo sugerido: src/pages/{ruta}

     Para cubrirlos necesito crear el POM primero. ¿Invoco la skill `pom-generator`
     ahora, o los dejamos como pendientes para otro ticket?
     ```
   - Esperar respuesta del usuario antes de lanzar Agente D.
   - Si el usuario confirma: invocar `pom-generator` antes de Agente D.
   - Si el usuario descarta: registrar los testids como pendientes en `references/known-testids.md` §Pendientes.

2. Construir tabla de cambios propuestos:

| POM | Locator | Actual | Nuevo | Fuente |
|-----|---------|--------|-------|--------|
| {Archivo.ts} | {NOMBRE_LOCATOR} | `{selector_actual}` | `[data-testid="{nuevo_testid}"]` | {captura/comentario} |
| ... | ... | ... | ... | ... |

3. Identificar campos no resueltos (ver `references/known-testids.md` §Pendientes).

4. **Pausar y preguntar al usuario** por los campos no resueltos antes de continuar.
   Usar este formato exacto:

```
⏸ CAMPOS QUE NECESITO CONFIRMAR

Los siguientes locators no pudieron resolverse desde las imágenes del ticket.
Necesito que inspecciones el DOM en el navegador (F12) mientras el elemento está visible:

1. **{NOMBRE_LOCATOR}** ({Archivo}.ts)
   {Descripción de dónde encontrar el elemento en la UI}
   ¿Qué data-testid tiene? (actualmente usa {selector_actual} — {razón por la que es frágil})

2. **{NOMBRE_LOCATOR}** ({Archivo}.ts)
   {Descripción de dónde encontrar el elemento}
   ¿Qué data-testid tiene? (actualmente {selector_actual})

Responder con los valores o escribir "SKIP" para omitir ese campo.

**Alternativa más rápida:** si tenés el elemento visible en DevTools, podés pegar el
HTML directamente en el chat — extraigo los testids sin necesidad de responder campo por campo.
```

4. Con las respuestas del usuario → completar la tabla de cambios.

5. **Checkpoint de campos manuales — OBLIGATORIO antes de continuar a FASE 3.**

   Después de recibir las respuestas a los campos no resueltos (o si no había ninguno),
   preguntar explícitamente al usuario:

   ```
   ⏸ CHECKPOINT — CAMPOS INSPECCIONADOS MANUALMENTE

   ¿Inspeccionaste con F12 algún campo que no aparecía en las capturas del ticket?
   Si es así, pegá el HTML del elemento (outerHTML) o el data-testid directamente acá
   antes de que lance el Agente D.

   Respondé "no" para continuar sin agregar campos adicionales.
   ```

   - Si el usuario pega HTML → extraer los testids y agregarlos a la tabla de cambios.
   - Si el usuario responde "no" o "continuar" → proceder a FASE 3 sin esperar más.
   - No lanzar Agente D hasta recibir respuesta a este checkpoint.

---

## FASE 3 — Aplicación de cambios (Agente D)

Lanzar Agente D via `Agent tool` (`subagent_type: "general-purpose"`).
El agente recibe solo la tabla de cambios — no necesita el contexto de Jira ni las imágenes.

**Orden de prioridad — aplicar primero los ROTOS:**

Antes de aplicar la tabla de cambios, consultar `references/known-testids.md` §Rotos.
Los locators listados ahí están activos en tests pero retornan 0 elementos con el DOM actual
y deben recibir prioridad máxima aunque no aparezcan en el ticket actual.

Si la tabla de cambios incluye alguno de esos locators rotos → aplicarlo primero.
Si no los incluye → igualmente listarlos al usuario como pendientes al reportar el resultado.

**Reglas de edición:**
- Usar Edit puntual — nunca reescribir el archivo completo
- Solo modificar la línea del `By.` — no tocar JSDoc, métodos, ni lógica
- Mantener el nombre del locator en SCREAMING_SNAKE_CASE
- Si el testid nuevo usa `^=` (starts-with), verificar que no sea demasiado permisivo
- Después de cada edición: verificar que el archivo compile con `tsc --noEmit` si hay dudas de sintaxis

**Brief de Agente D:**
```
Aplicar los siguientes cambios de locators en los POMs del framework BlueStack.
Usar Edit puntual (old_string → new_string) por cada locator. No reescribir archivos completos.

Cambios a aplicar: {tabla_de_cambios_completa}

Reglas:
- Solo modificar la línea exacta del By. — no tocar nada más
- Verificar que el string viejo es único en el archivo antes de editar
- Si old_string no es único: usar más contexto (línea anterior + línea del locator)
- Al finalizar: listar qué cambios se aplicaron y cuáles se saltaron con razón

Regla adicional para locators NUEVOS (no actualizaciones de locators existentes):
- Si la tabla incluye un locator nuevo (no existe en el archivo), y el POM usa un switch/map
  de acciones (ej: switch(action) o ACTIONS map), agregar también el case/entry correspondiente
  al locator nuevo en ese switch/map. Ambas inserciones van en el mismo agente — no son dos pasos.
- Si el comportamiento post-click del nuevo locator es desconocido (no fue especificado por el
  usuario ni se puede inferir del HTML), agregar el case con solo el click inicial y un comentario
  `// TODO: definir comportamiento post-click` para que quede visible en el diff.
```

---

## FASE 4 — Validación real en grid (Agente E)

Lanzar Agente E via `Agent tool` (`subagent_type: "general-purpose"`).
Recibe solo la lista de locators modificados — no necesita el historial de Jira ni las imágenes.

La validación NO es opcional. Un locator que compila pero no encuentra el elemento en el DOM
es un bug silencioso peor que uno que lanza error.

**Prerequisito:** Docker Grid debe estar corriendo.
```bash
docker compose up -d --wait
```

**Metodología: invocar `create-session` en modo debug**

No usar `--testNamePattern` para buscar tests existentes. Ese enfoque es frágil: puede no
encontrar nada, o encontrar un test que no ejercite el locator específico.

En cambio, Agente E debe:
1. Leer los POMs modificados para entender qué métodos públicos exponen los locators cambiados.
2. Agrupar los locators por "ruta de navegación" (ej: editor de notas, editor de videos, grid de posts).
3. Por cada grupo, **invocar la skill `create-session` en modo debug** — no escribir el archivo manualmente.
   - Destino: `sessions/debug/DebugTestids_{KEY}_{area}.test.ts`
   - La skill create-session genera el archivo siguiendo las 9 reglas del proyecto (imports al final, ESM, etc.)
4. Ejecutar cada session generada.
5. Eliminar los archivos generados al finalizar (sean PASS o FAIL).

**CRÍTICO — interacciones reales obligatorias:**

Los tests de validación DEBEN usar interacciones reales. El objetivo es confirmar que el
elemento existe Y es interactuable, no solo que el selector lo encuentra en el DOM.

```
✅ CORRECTO — interacciones que validan un locator:
   await editorHeader.clickExitAction('SAVE_ONLY')      // clickSafe interno
   await infoSection.fillTitle('Texto de prueba')        // writeSafe interno
   await postTable.clickRowAction(container, 'EDIT')     // clickSafe en menú

❌ PROHIBIDO — no valida interactuabilidad:
   await driver.findElement(By.css('[data-testid="..."]'))
   const elements = await driver.findElements(...); elements.length > 0
   await waitFind(driver, locator, opts)   // como único paso de "validación"
```

El criterio de validez de un locator es que el método del POM pueda ejecutar su
acción sin lanzar NoSuchElementException ni TimeoutError — no que el elemento aparezca
en el DOM.

**Reglas para generar las sessions de debug:**

- Seguir exactamente el patrón de `sessions/debug/DebugVideoEditorHeader.test.ts`:
  - `runSession(...)` primero, imports al final del archivo
  - Usar `step(...)` para cada acción individual sobre el locator
  - Usar `description(...)` al inicio con objetivo y flujo
  - Credenciales siempre via `ENV_CONFIG.getCredentials('editor')`
  - Imports internos con extensión `.js`
- El flujo de cada session debe ser el mínimo necesario para llegar al elemento:
  - Login → navegación → acción que expone el elemento → interacción con el método del POM
  - No replicar flujos completos — solo el trazo hasta el campo modificado
- Invocar los métodos reales del POM (no hacer `driver.findElement` directo).
  - Si el locator vive en un sub-componente, instanciar ese sub-componente y llamar su método.
  - Ejemplo: si el locator es `EditorHeaderActions.SAVE_BTN`, llamar `editorHeader.clickSave()`.
- Nombrar el test con el patrón: `"Debug Testids {KEY} — {área}"` (ej: `"Debug Testids NAA-4324 — Post Editor Header"`)
- Allure metadata: `epic: "Debug"`, `feature: "Testid Validation"`, `story: "{KEY}"`

**Ejemplo de estructura para un locator en EditorHeaderActions (post):**
```typescript
runSession("Debug Testids NAA-XXXX — Post Editor Header", async ({ driver, opts, log }) => {

  description(`
### Validación de testids — NAA-XXXX
Locators a validar: SAVE_BTN, PUBLISH_BTN (EditorHeaderActions.ts)
Flujo: Login → Posts → entrar al editor → ejecutar acción de header
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
  await driver.get(authUrl);

  const login = new MainLoginPage(driver, opts);
  const postPage = new MainPostPage(driver, 'POST', opts);
  const postEditor = new MainEditorPage(driver, opts);

  await login.passLoginAndTwoFA({ username: user, password: pass });

  await step('Navegar a Posts y entrar al editor', async () => {
    // ... navegación mínima hasta el editor
  });

  await step('Validar: SAVE_BTN — guardar sin salir', async () => {
    await postEditor.closeNoteEditor('SAVE_ONLY');
  });

  log.info("✅ Locators validados correctamente.");
},
  { epic: "Debug", feature: "Testid Validation", story: "NAA-XXXX", severity: "normal" });

import { runSession } from "../../src/core/wrappers/testWrapper.js";
// ... resto de imports
```

**Criterio de éxito:** cero `NoSuchElementException` ni `TimeoutError` para los locators modificados.

**Si un locator falla:**
1. Descargar nuevamente la imagen correspondiente y releer con visión
2. Si el testid en la imagen era TRUNCADO: pedir al usuario que inspeccione el DOM
3. Registrar el fallback en `references/known-testids.md` §Fallbacks

**Brief de Agente E:**
```
Validar locators modificados en el framework BlueStack generando sessions de debug ad-hoc.
Docker Grid disponible en localhost. Entorno WSL2 — usar node directo, no npm/npx.

Locators modificados: {lista_de_locators_modificados_con_archivo_y_método}
Ticket procesado: {KEY}

Pasos:
1. Para cada POM modificado, leer el archivo para entender qué métodos públicos
   exponen los locators cambiados. No inferir — leer el código.
2. Agrupar los locators por ruta de navegación (post editor / video editor / image editor / post grid / etc.).
3. Por cada grupo, **invocar la skill `create-session` en modo debug** para generar
   sessions/debug/DebugTestids_{KEY}_{area}.test.ts — NO escribir el archivo manualmente.
   Briefing mínimo para create-session:
   ```
   Modo debug. Ticket: {KEY}. Área: {área}.
   Locators a validar: {lista de métodos del POM que ejercitan los locators cambiados}.
   Destino: sessions/debug/DebugTestids_{KEY}_{area}.test.ts
   Los tests deben usar los métodos reales del POM — nunca driver.findElement directo.
   ```
   La skill create-session aplica las 9 reglas del proyecto (imports al final, ESM, etc.)
   sin necesidad de especificarlas en el brief.

   CRÍTICO — interacciones reales en cada step:
   - Botones → el método del POM que llama clickSafe (ej: clickExitAction, clickRowAction)
   - Inputs → el método del POM que llama writeSafe (ej: fillTitle, fillDescription)
   - Dropdowns → el método que abre + el que selecciona (dos steps separados)
   - PROHIBIDO: driver.findElement() como único paso de un step
   - PROHIBIDO: driver.findElements().length > 0 como assertion
4. Ejecutar cada session generada:
   NODE_OPTIONS='--experimental-vm-modules' node node_modules/.bin/jest DebugTestids_{KEY} --no-coverage
5. Eliminar los archivos generados al finalizar (PASS o FAIL).

Retornar: [{locator, archivo, status: VALIDADO|FALLIDO, errorMsg?}]
Si un locator falla: incluir el stack trace exacto del NoSuchElementException o TimeoutError.
```

---

## FASE 4.5 — Decisión de rollback post-validación

Antes de lanzar Agente F, evaluar el resultado de Agente E:

**Si TODOS los locators validaron correctamente (0 fallos):**
- Continuar normalmente a FASE 5.

**Si HAY locators fallidos:**
- Calcular el porcentaje de fallos sobre el total de locators modificados.
- Si los fallos son **parciales (< 100%)**:
  - Por cada locator fallido: revertir el cambio de ese locator específico en el POM
    (Edit puntual — restaurar el selector anterior).
  - Registrar el locator revertido en `references/known-testids.md §Rotos` con:
    - El testid que falló, el selector anterior restaurado, el error exacto (NoSuchElementException / TimeoutError)
  - Notificar al usuario: "Locator {NOMBRE} en {Archivo}.ts fue revertido — selector anterior restaurado. Detalle: {error}"
  - Los cambios que sí validaron se mantienen. Continuar a FASE 5.
- Si los fallos son **totales (100%)**: antes de lanzar Agente F, notificar al usuario:

```
⚠️ VALIDACIÓN FALLIDA — TODOS LOS LOCATORS FALLAN

Agente E no pudo confirmar ningún locator. Esto sugiere un problema de entorno
(Grid caído, credenciales inválidas) más que locators incorrectos.

Los cambios aplicados por Agente D siguen en los archivos.
Opciones:
A) Revertir los cambios (git checkout -- src/pages/) y reintentar con el entorno corregido
B) Mantener los cambios y marcarlos como PENDIENTE-VALIDACIÓN en references/known-testids.md
C) Revisar el entorno y relanzar solo FASE 4

¿Qué querés hacer?
```
- Esperar respuesta del usuario. No lanzar Agente F hasta tener confirmación.

---

## FASE 5 — Actualización del conocimiento base (Agente F)

Lanzar Agente F via `Agent tool` (`subagent_type: "general-purpose"`).
Recibe solo la tabla de resultados de E — contexto mínimo para la tarea de escritura.

Luego de la validación, actualizar los archivos de references de esta skill con lo aprendido.

**Qué actualizar:**

1. `references/known-testids.md` — agregar los testids del ticket procesado:
   - Fecha, ticket key, área de UI
   - Tabla: {testid, POM, locator aplicado, status validación}
   - Mover campos validados a §Confirmados
   - Mover campos fallidos a §Fallbacks con nota de por qué

2. `references/pom-component-map.md` — si se encontraron elementos en POMs no mapeados:
   - Agregar la nueva entrada al mapa

3. `wiki/log.md` — si durante la ejecución se detectó un gap de wiki:
   - Agregar `[gap] <tema>` con fecha

**Brief de Agente F:**
```
Actualizar los archivos de conocimiento base de la skill update-testids.

Resultados de la sesión:
- Ticket procesado: {KEY}
- Cambios aplicados: {lista}
- Validaciones: {tabla_de_resultados_agente_E}
- Campos no resueltos: {lista}

Archivos a actualizar:
- .claude/skills/update-testids/references/known-testids.md
- .claude/skills/update-testids/references/pom-component-map.md
- wiki/log.md (solo si hay gaps)

Usar Edit puntual. No reescribir los archivos desde cero.
```

---

## Output final al usuario

Después de que Agente F termine, el orquestador reporta al usuario usando esta estructura:

```
✅ update-testids completado — {KEY}

**Locators actualizados:** {N} cambios aplicados en {M} archivos
| POM | Locator | Selector anterior | Selector nuevo | Validación |
|-----|---------|-------------------|----------------|------------|
| {archivo} | {NOMBRE} | `{anterior}` | `[data-testid="{nuevo}"]` | ✅ VALIDADO |
| {archivo} | {NOMBRE} | `{anterior}` | `[data-testid="{nuevo}"]` | ❌ FALLIDO |

**Pendientes (sin resolver):** {lista o "ninguno"}
- {NOMBRE_LOCATOR} ({Archivo}.ts) — razón: {truncado en imagen / no encontrado en DOM}

**Locators rotos previos cubiertos:** {lista o "ninguno"}

**Conocimiento base actualizado:**
- references/known-testids.md → {N} entradas nuevas
- references/pom-component-map.md → {actualizado / sin cambios}
```

Si hubo campos que el usuario respondió manualmente con valores, confirmarlos al final:
```
Los siguientes testids fueron confirmados por inspección manual y aplicados:
- {NOMBRE_LOCATOR}: data-testid="{valor_confirmado}"
```

---

## Restricciones

- **Nunca ejecutar lógica de ninguna FASE directamente en el contexto del orquestador** —
  toda acción que no sea sintetizar resultados o lanzar el siguiente `Agent` es un error
- **Nunca lanzar más de dos agentes en paralelo** (A+B son el único caso paralelo válido)
- Nunca usar `npm run` ni `npx jest` — solo `node node_modules/.bin/jest`
- Nunca hardcodear credenciales — siempre leer de `.mcp.json`
- Nunca modificar métodos ni JSDoc cuando solo se pide cambiar un locator
- Nunca asumir que un testid truncado es correcto — marcarlo como TRUNCADO y preguntar
- Nunca omitir la FASE 4 de validación real — compilar sin errores no es suficiente.
  Excepción: PATH-B sin key ni entorno disponible (ver §"Caso PATH-B sin ningún ticket key")
- Si el ticket está en `In Progress`: advertir antes de continuar, no bloquear

---

## Referencias

| Archivo | Cuándo leerlo |
|---|---|
| `references/pom-component-map.md` | Para mapear data-testid → POM correcto |
| `references/known-testids.md` | Para evitar rehacer trabajo y ver el histórico |
| `wiki/pages/post-page.md` | Para entender la estructura de MainPostPage y sub-componentes |
| `wiki/patterns/conventions.md` | Para verificar que el locator nuevo sigue la convención |
| `wiki/sessions/catalog.md` | Para encontrar qué test ejercita cada locator |
| `wiki/core/docker-grid.md` | Para setup de grid si no está corriendo |
| `.claude/references/COMMANDS.md` | Para comandos de ejecución exactos |
