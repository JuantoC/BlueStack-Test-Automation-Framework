# Wiki Audit — TC2: Densidad y Bloqueos de Lookup

Ejecutado con: wiki-audit v2 (con R7 + B5/B6)

---

## Resumen ejecutivo

La wiki del proyecto tiene buena estructura general pero presenta **bloqueos de lookup en 5 conceptos críticos** del pipeline. Todas las páginas densas tienen resumen ejecutivo, pero faltan entry points en "Referencias rápidas" para conceptos de alta frecuencia de uso del agente QA.

---

## Páginas por densidad (líneas)

| Página | Líneas | Resumen ejecutivo (primeras 15L) | Tokens estimados | En "Referencias rápidas" |
|--------|--------|---|---|---|
| `wiki/patterns/conventions.md` | **404** | ✅ Sí (líneas 6-10: "Reglas de arquitectura...") | ~2,424 | ⚠️ Parcial — solo "Instanciar un PO" |
| `wiki/qa/adf-format-guide.md` | **326** | ✅ Sí (líneas 1-8: "Formato ADF...") | ~1,956 | ✅ Sí |
| `wiki/log.md` | ~474 | N/A — log operativo, excluido del check | — | N/A |
| `wiki/qa/pipeline-integration-schema.md` | **285** | ✅ Sí (líneas 1-16: "Contrato completo...") | ~1,710 | ❌ No |
| `wiki/qa/devsaas-flow.md` | **217** | ✅ Sí (líneas 1-19: "Flujo pre-productivo...") | ~1,302 | ❌ No |
| `wiki/pages/post-page.md` | **185** | ✅ Sí (líneas 1-11: "Gestión editorial...") | ~1,110 | ❌ No — no en referencias rápidas |
| `wiki/core/logging.md` | **175** | ✅ Sí (líneas 1-10: "Convenciones Winston...") | ~1,050 | ✅ Sí |
| `wiki/interfaces/data-types.md` | **210** | ✅ Sí (líneas 1-11: "Contratos de datos...") | ~1,260 | ✅ Sí |
| `wiki/patterns/factory-api.md` | **133** | ✅ Sí (líneas 1-10: "Factories que generan...") | ~798 | ✅ Sí |
| `wiki/core/run-session.md` | **124** | ✅ Sí (líneas 1-13: "runSession es punto de entrada...") | ~744 | ✅ Sí |

**Estimación de tokens:** líneas × 6 tokens promedio por línea

---

## Criterio B3 — Resumen ejecutivo (Parte A)

✅ **PASS:** Todas las páginas >100 líneas tienen resumen ejecutivo claramente identificable en las primeras 15 líneas.

Formato consistente detectado: frontmatter YAML (2-4 líneas) → título H1 → sección `## Propósito` con descripción concisa.

---

## Criterio B5 — Lookup path analysis (Parte B)

### LOOKUP AMBIGUO detectado:

```
[LOOKUP-AMBIGUO] retry boundary:
  - Páginas con detalle suficiente: 2 (logging.md + conventions.md)
  - Tabla "Referencias rápidas": sin entry point directo
  - Agente debe inferir que está bajo "nivel de log" → 2 navegaciones mentales
  - Costo estimado de lookup fallido: ~1,050 tokens (leer logging.md completa)
  - Costo con entry point directo: ~40 tokens (ir directo a la sección)

[LOOKUP-AMBIGUO] NoteType (valores válidos):
  - Páginas: interfaces/data-types.md (líneas 46-61) + patterns/conventions.md (líneas 114-128)
  - Ambos definen NoteType desde perspectiva diferente
  - Sin jerarquía explícita entre ellos
  - Tabla "Referencias rápidas": sin entry point específico

[LOOKUP-AMBIGUO] ambientes master vs dev_saas:
  - Páginas: qa/devsaas-flow.md + qa/environments.md
  - Dos archivos con ángulos distintos, sin jerarquía
  - Tabla "Referencias rápidas": sin entry point directo
```

### LOOKUP DIRECTO (OK):

```
[LOOKUP-DIRECTO] crear un test → wiki/core/run-session.md → OK
[LOOKUP-DIRECTO] generar datos de prueba → wiki/patterns/factory-api.md → OK
[LOOKUP-DIRECTO] cuándo usar cada nivel de log → wiki/core/logging.md → OK
[LOOKUP-DIRECTO] tipo de dato → wiki/interfaces/data-types.md → OK
[LOOKUP-DIRECTO] hacer click/escribir → wiki/core/actions.md → OK
```

---

## Páginas bloqueadoras por densidad sin cobertura de "Referencias rápidas"

| Página | Líneas | Tokens | Bloqueo |
|--------|--------|--------|---------|
| `wiki/qa/pipeline-integration-schema.md` | 285 | ~1,710 | 🔴 ALTO — contrato crítico sin entry point |
| `wiki/qa/devsaas-flow.md` | 217 | ~1,302 | 🟠 ALTO — flujo pre-productivo sin entry point |
| `wiki/patterns/conventions.md` | 404 | ~2,424 | 🔴 MUY ALTO — 404 líneas para encontrar conceptos puntuales |

**Caso más grave:** `conventions.md` mezcla conceptos de frecuencia muy diferente en 404 líneas:
- Altamente frecuente: arquitectura 2 capas, constructores, retry boundary, error handling
- Baja frecuencia: Angular Material patterns (A-D), sleep, Gap Analysis, output formats

Impacto: buscar "retry boundary" → agente lee 404 líneas (~2,424 tokens) para encontrar 10 líneas clave (~60 tokens). Factor de ineficiencia: **40x**.

---

## Métricas finales

| Métrica | Valor |
|---------|-------|
| Páginas >100 líneas | 8 |
| Páginas con resumen ejecutivo en primeras 15L | 8/8 ✅ |
| Páginas >300 líneas | 2 (conventions.md 404L, adf-guide 326L) |
| Conceptos B5 con LOOKUP-DIRECTO | 5/9 |
| Conceptos B5 con LOOKUP-AMBIGUO | 4/9 |
| Páginas densas sin entrada en "Referencias rápidas" | 3 |
| Tokens potencialmente desperdiciados por lookup ineficiente | ~5,400 (pipeline-schema + devsaas + conventions) |

---

## Acciones recomendadas

1. **[REFS-RAPIDAS-GAP]** Agregar a `wiki/index.md` tabla de referencias rápidas:
   - `pipeline-integration-schema.md` — contrato test-reporter ↔ jira-writer
   - `qa/devsaas-flow.md` — flujo validación Dev_SAAS
   - `core/logging.md § Retry Boundary` — entry point directo para retry boundary

2. **[PAGINA-DENSA]** `wiki/patterns/conventions.md` (404 líneas):
   - Extraer "Patrones de interacción — componentes Angular Material" (líneas 198-268) a `wiki/pages/angular-material-patterns.md`
   - Reducir a ~300 líneas con conceptos de alta frecuencia

3. **[FLUJO-SIN-COBERTURA]** Crear `wiki/qa/ticket-analyst-scope.md`:
   - Documentar `testability_summary.action` enum y tabla de routing
   - Documentar `criterion_scope` (ui, vfs, backend_data, api)