# Visual Validation — Doctrina de screenshots en el pipeline QA

## Regla central

Un criterio `criterion_type: "visual_check"` **no puede reportarse como validado** sin evidencia visual capturada durante el test.

El pipeline tiene dos opciones:
1. **Capturar screenshot** durante la ejecución del test y registrarla en el Execution Context
2. **Escalar a humano** — el test-reporter postea un comentario de escalación en Jira con guía de validación manual

**Un test que completa sin error pero sin screenshot no valida un visual_check.** Reportarlo como "pasado" es un falso positivo.

---

## Cómo tomar screenshots en Selenium WebDriver

El framework usa Selenium WebDriver + Jest + Allure. Se puede capturar una screenshot en cualquier punto del test:

```typescript
// Screenshot manual en cualquier punto del test
const screenshot = await driver.takeScreenshot();
// Allure la registra automáticamente si está configurado en jest.config
```

Allure captura screenshots automáticamente en fallos, pero para `visual_check` se necesita una screenshot explícita **aunque el test pase**, para evidenciar el estado visual validado.

Los archivos se guardan en `allure-results/attachments/` como `*.png`.

---

## Datos de prueba: usar prompts del ticket, no factory random

Cuando el ticket tiene una sección "Prompts de ejemplo", "Datos de prueba" o bloques de código con inputs concretos:

- El ticket-analyst los extrae como `test_data_hints[]` en el Execution Context
- El test-engine (o el test generado por test-generator) **debe usar esos datos** en lugar de datos random del factory
- Razón: el dev diseñó el ticket pensando en ese input específico. El factory random puede no triggear el comportamiento reportado

Ejemplo: si el ticket reporta "el preview no renderiza Markdown correctamente" y adjunta un prompt que genera bullets, negritas y tablas → el test debe usar **ese prompt exacto** para poder capturar el estado visual relevante.

---

## Flujo del pipeline para visual_check

```
ticket-analyst detecta visual_check
  → requires_screenshot: true en test_hint
  → extrae test_data_hints[] de la descripción

test-engine (TE-6.1)
  → verifica si la session existente puede capturar screenshot
  → si SÍ: ejecuta con test_data_hints, captura screenshot post-acción visual
  → si NO: sessions_found: false → ORC-4.1 (test-generator genera test con screenshot)

test-reporter
  → incluye screenshot en el comentario Jira si está disponible
  → si no hay screenshot y era visual_check → reportar escalación, no "pasado"
```

---

## Sub-caso: visual_check de timezone (non-automatable)

Un tipo específico de `visual_check` donde la no-automatizabilidad no es por "percepción humana" sino por **assertion no determinista por dependencia del clock del servidor**.

**Cuándo aplica:** el criterio requiere verificar que un timestamp mostrado en pantalla coincide con la timezone del servidor (ej. "la hora al despublicar debe mostrar hora local Argentina, no UTC").

**Por qué no es automatizable:** Selenium puede leer el texto del timestamp, pero no puede garantizar cuál es el valor esperado sin conocer la timezone configurada en el servidor en el momento exacto del test. La assertion sería del tipo `horaLeída == horaActualLocal()`, no determinista en CI.

**`reason_if_not` correcto:** `"timezone_display_check"` (no `"visual_check"` genérico).

**Guía manual estándar para este sub-caso:**
1. Anotar la hora local del sistema antes de la acción
2. Ejecutar la acción que genera el timestamp
3. Leer la hora que muestra el CMS
4. Verificar que coincide con la hora local (no con UTC)

**Ejemplo real:** NAA-1939 — bug donde despublicar mostraba UTC (GMT+0) en lugar de Argentina (UTC-3).

---

## Ver también

- `.claude/agents/ticket-analyst.md` — TA-4b: regla para visual_check
- `.claude/agents/test-engine.md` — TE-6.1: screenshots obligatorios
- `wiki/qa/pipeline-integration-schema.md` — campo `screenshots[]` en test_engine_output
