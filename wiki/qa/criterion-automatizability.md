---
last-updated: 2026-04-17
---

# Automatizabilidad de Criterios — `reason_if_not` y `manual_test_guide`

> Fuente canónica para evaluar si un criterio es automatizable y cómo documentarlo.

---

## Pregunta central (TA-4b)

> ¿Puedo escribir una assertion Selenium que falle si este criterio no se cumple y pase si sí se cumple?

- Si la assertion requiere percepción humana o entorno físico → `automatable: false`.
- Si el `criterion_scope` es `"vfs"`, `"backend_data"` o `"api"` → `automatable: false` forzado.

---

## Sub-casos de `reason_if_not`

### `"backend_data_validation"`

Aplica cuando `criterion_scope: "vfs"` o `"backend_data"`. El criterio no puede verificarse desde el navegador.

**`manual_test_guide` para VFS:**
```
Acceder al VFS de OpenCms (Menú → VFS) → navegar al nodo del recurso → verificar que la propiedad <nombre> tiene el valor <esperado>.
```

**`manual_test_guide` para backend_data:**
```
Verificar en DB/backend (o vía API de administración) que el registro fue persistido correctamente por el job — campo <campo> = <valor>.
```

---

### `"timezone_display_check"` (visual_check no automatizable)

Cuando el criterio requiere verificar que un timestamp mostrado en pantalla coincide con la timezone local del servidor (ej: "la hora al despublicar debe mostrar la hora de Argentina, no UTC").

**Configuración:**
- `automatable: false`
- `reason_if_not: "timezone_display_check"`

**Por qué no es automatizable:** Aunque Selenium puede leer el texto del timestamp, no puede garantizar que el valor esperado sea correcto sin controlar la timezone del servidor en el momento del test.

**`manual_test_guide`:**
```
Anotar hora local → ejecutar acción → comparar hora mostrada contra hora local anotada.
```

---

### `"pom_gap_clipboard"` (clipboard sin POM mapeado)

Cuando el criterio requiere verificar qué texto fue copiado al presionar un botón de copia en la UI.

**Lógica de evaluación:**
- Si el componente UI tiene POM con locators del campo origen **Y** del botón copiar → `automatable: true`. Estrategia: leer campo origen → click botón → `sendKeys(Ctrl+V)` en campo editable → leer y comparar.
- Si el componente UI **NO tiene POM mapeado** → `automatable: false`, `reason_if_not: "pom_gap_clipboard"`.

**⚠️ NUNCA usar `reason_if_not: "clipboard_access_restricted"`** — los browsers modernos en Docker Grid permiten `Ctrl+V` via `sendKeys` si el foco está en un campo editable. El bloqueo es siempre el POM, no el clipboard.

**`manual_test_guide`:**
```
Click Copiar → pegar en editor externo (ej. Notepad) → verificar texto pegado coincide con el esperado.
```

---

### `"ckeditor_plugin_interaction_not_supported"` (plugins CKEditor)

Cuando el criterio requiere insertar, cargar, verificar o interactuar con plugins de la toolbar CKEditor.

**Plugins que activan este sub-caso:** Instagram embed, Twitter embed, TikTok embed, Pinterest embed, Trivias, Audios, Encuestas, y cualquier plugin del enriquecedor de texto.

**Keywords que lo activan:** `"ckeditor plugin"`, `"plugin toolbar"`, `"instagram embed"`, `"twitter embed"`, `"tiktok embed"`, `"pinterest embed"`, `"trivias"`, `"encuesta ckeditor"`, `"audio ckeditor"`, `"enriquecedor de texto"`, `"carga async componentes ckeditor"`.

**Configuración:**
- `automatable: false`
- `reason_if_not: "ckeditor_plugin_interaction_not_supported"`

**Por qué no es automatizable:** El framework solo puede pegar/borrar texto en campos CKEditor. No puede acceder ni controlar la toolbar ni los plugins. Es una limitación estructural, no un POM gap.

**`manual_test_guide`:**
```
Abrir nota en edición → verificar en DevTools Network que no hay requests cancelados al cargar cada plugin → verificar que el bloque del plugin renderiza en el editor.
```

**Nota forward-looking:** Registrar en `escalation_report.next_step_to_unblock` que la integración CKEditor está planificada — cuando se implemente, este criterio se vuelve automatizable.

---

## `testability_summary` — cómo se calcula

```json
{
  "total_criteria": 3,
  "automatable_count": 2,
  "non_automatable_count": 1,
  "all_automatable": false,
  "partial_automatable": true,
  "human_escalation_needed": false,
  "escalation_reasons": ["timezone_display_check"],
  "action": "partial_run_and_escalate"
}
```

| Campo | Cálculo |
|-------|---------|
| `total_criteria` | `len(acceptance_criteria)` |
| `automatable_count` | `len([c for c in acceptance_criteria if c.automatable])` |
| `non_automatable_count` | `total_criteria - automatable_count` |
| `all_automatable` | `automatable_count == total_criteria` |
| `partial_automatable` | `0 < automatable_count < total_criteria` |
| `human_escalation_needed` | `non_automatable_count > 0` |

**Cuando `all_automatable: false` (ningún criterio ejecutable):**
Generar `escalation_report` OBLIGATORIO con:
- `criteria_attempted[]`: cada criterio con la razón exacta de por qué no es automatizable.
- `manual_test_guide[]`: guía completa de testing manual por cada criterio.

---

## Ver también

- [wiki/qa/criterion-types-and-scopes.md](criterion-types-and-scopes.md) — enum `criterion_type` y `criterion_scope`
- [wiki/qa/pipeline-routing.md](pipeline-routing.md) — routing por `testability_summary.action`
- [wiki/pages/ckeditor-limitations.md](../pages/ckeditor-limitations.md) — limitaciones detalladas de CKEditor
