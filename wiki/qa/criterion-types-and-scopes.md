---
last-updated: 2026-04-17
---

# criterion_type y criterion_scope — Enums de referencia

> Fuente canónica para clasificar criterios de aceptación en ticket-analyst.

---

## criterion_type

Define el tipo de verificación que el criterio requiere. Determina si necesita screenshot y qué tipo de assertion es posible.

| Valor | Cuándo aplica | Implica screenshot |
|-------|--------------|-------------------|
| `"field_validation"` | El criterio verifica que un campo acepta/rechaza valores correctamente (formato, longitud, regex, estado requerido/opcional) | No |
| `"functional_flow"` | El criterio verifica que un flujo completo (crear, editar, publicar, eliminar) se ejecuta correctamente | No |
| `"state_transition"` | El criterio verifica que el estado de un recurso cambia correctamente (ej: borrador → publicado, activo → archivado) | No |
| `"error_handling"` | El criterio verifica que el sistema muestra mensajes de error apropiados o reacciona ante entradas inválidas | No |
| `"visual_check"` | El criterio requiere verificar que algo "se ve bien" o tiene un estado visual específico — solo verificable con screenshot | **Sí** |
| `"responsive"` | El criterio verifica comportamiento en distintas resoluciones o dispositivos | No (actualmente no automatizable) |
| `"performance"` | El criterio verifica tiempos de respuesta, velocidad de carga, o comportamiento bajo carga | No (actualmente no automatizable) |

### Regla especial para `visual_check`

Un `visual_check` es `automatable: true` **únicamente si** el test puede capturar una screenshot como evidencia del estado visual.

- Setear `requires_screenshot: true` en el hint correspondiente.
- Si el framework no puede asistir la afirmación visual → `automatable: false`.
- Un test que ejecuta el flujo sin screenshot **no valida** un `visual_check`.

---

## criterion_scope

Define en qué capa del sistema se verifica el criterio. Afecta directamente si el criterio es automatizable.

| Valor | Qué verifica | Implicación |
|-------|-------------|-------------|
| `"ui"` (default) | Comportamiento visible en el navegador, verificable con Selenium | Automatizable si hay POM |
| `"vfs"` | Propiedad persistida en el VFS de OpenCms — requiere acceso al servidor | Fuerza `automatable: false` |
| `"backend_data"` | Dato persistido en DB/backend por un job — sin acceso desde el navegador | Fuerza `automatable: false` |
| `"api"` | Respuesta de API directa, sin navegar por el CMS | Fuerza `automatable: false` |

### Inferencia automática desde customfields (TA-4.2)

| Customfield | Nombre | Inferencia |
|-------------|--------|-----------|
| `customfield_10040` o `customfield_10069` | Cambios VFS | → `criterion_scope: "vfs"` |
| `customfield_10036` o `customfield_10066` | Cambios SQL | → `criterion_scope: "backend_data"` |

**Precedencia:** si ambas señales están presentes → `"vfs"` tiene precedencia.

**Condición de guarda — UI keywords prevalecen:** Si el criterio menciona cualquiera de: `pantalla`, `visible`, `DOM`, `navegador`, `elemento`, `botón`, `click`, `modal`, `formulario` → mantener `"ui"` aunque el customfield esté populado.

### Para `criterion_scope: "vfs"` o `"backend_data"`

- Forzar `automatable: false` independientemente de cualquier otra evaluación.
- `reason_if_not: "backend_data_validation"` (no usar `"server_access"`).
- `manual_test_guide` para `vfs`: "Acceder al VFS de OpenCms (Menú → VFS), navegar al nodo del recurso, verificar que la propiedad `<nombre>` tiene el valor `<esperado>`."
- `manual_test_guide` para `backend_data`: "Verificar en DB/backend (o vía API de administración) que el registro fue persistido correctamente — campo `<campo>` = `<valor>`."

---

## Ver también

- `.claude/agents/ticket-analyst.md` — TA-4.2, TA-4b: clasificación por scope y automatizabilidad
- [wiki/qa/criterion-automatizability.md](criterion-automatizability.md) — `reason_if_not` sub-casos y lógica de `manual_test_guide`
- [wiki/qa/pipeline-routing.md](pipeline-routing.md) — routing por `criterion_scope` y `testability_summary.action`
- [wiki/qa/jira-customfields.md](jira-customfields.md) — IDs de customfields y su semántica
