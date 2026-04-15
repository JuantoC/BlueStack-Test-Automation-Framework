# Sesión de validación QA — 2026-04-15

Registro de hallazgos y decisiones tomadas durante la sesión de validación real del pipeline
`qa-orchestrator` en ambiente `master`. Sirve como referencia histórica y como input para
futuras revisiones del algoritmo de clasificación.

---

## Tickets procesados y outcomes

| Ticket | Componente Jira | Módulo clasificado | confidence | sessions_found | Outcome |
|--------|----------------|--------------------|------------|----------------|---------|
| NAA-4207 | (fuzzy) | post | low | true | posted con ⚠️ warning; sin transición de estado |
| NAA-4429 | AI | ai-post | high | true | comentario + transición FEEDBACK |
| NAA-4458 | (a clasificar) | — | — | — | procesado en sesión |

---

## Aliases de componentes descubiertos en producción

Valores reales encontrados en `customfield_10061` de tickets NAA que no estaban en el mapa:

| Valor en Jira | Módulo asignado | Justificación |
|---------------|----------------|---------------|
| `Liveblog` | `post` | Liveblog es un tipo de nota del CMS; `NewLiveBlog.test.ts` vive en `sessions/post/` |
| `liveblog` | `post` | Variante lowercase |
| `NotaLista` | `post` | Listicle variant encontrado en producción; `NewListicle.test.ts` está en `sessions/post/` |
| `notalista` | `post` | Variante lowercase |
| `Acciones` | `null` | Componente genérico sin módulo de test — no testeable automáticamente |
| `acciones` | `null` | Variante lowercase |
| `estilo` | `null` | Componente de estilos sin cobertura de sesiones |

Todos agregados a `.claude/pipelines/ticket-analyst/references/component-to-module.json`.

---

## Comportamiento del fuzzy matching observado

Durante la sesión se observaron dos patrones claros:

| Caso | Resultado | Motivo |
|------|-----------|--------|
| 1 keyword del summary matchea `keywords[]` en test-map.json | `confidence: "low"` | Insuficiente señal para clasificación segura |
| Path exacto del módulo encontrado en summary o descripción | `confidence: "high"` o `"medium"` | Señal unívoca — match en múltiples keywords o por nombre exacto |

**Implicación práctica:** tickets con summaries muy genéricos (ej. "Fix en Acciones de post")
tienden a caer en `low` incluso si el módulo es correcto. El nuevo comportamiento de ORC-2
permite avanzar con warning en lugar de bloquear el pipeline completo.

---

## Desvíos encontrados y fix aplicado

### Desvío 1 — `component_jira` como array no manejado en TA-6 Paso 1

**Observado:** Tickets con múltiples componentes Jira (array) causaban que Paso 1 fallara
en el exact-match porque buscaba el array completo como clave en lugar de iterar.

**Fix:** TA-6 Paso 1 reescrito para iterar todos los valores si `component_jira` es array,
colectar módulos non-null y aplicar regla de desempate por especificidad
(`ai-post` > `post` > `video` > `images` > `auth`).

**Archivo:** `.claude/agents/ticket-analyst.md` — §TA-6 Paso 1.

---

### Desvío 2 — `null` en component-to-module.json contaba como "no match"

**Observado:** Si un componente mapeaba a `null` (ej. `Acciones`), el algoritmo lo
trataba como "no encontrado" e iba al Paso 2 (fuzzy), potencialmente clasificando en un
módulo incorrecto.

**Fix:** La regla ahora dice explícitamente: `null` en el mapa = ignorar para el match.
Si todos los valores son `null` → sin match, ir a Paso 2.

---

### Desvío 3 — `confidence:low` escalaba el pipeline completo innecesariamente

**Observado:** NAA-4207 tenía `sessions_found: true` y `confidence: "low"` (1 keyword match).
El comportamiento anterior escalaba sin ejecutar ningún test, perdiendo la oportunidad de
validar el ticket con las sesiones encontradas.

**Decisión tomada:** Separar `confidence:low` en dos sub-casos según `sessions_found`:
- `sessions_found: true` → continuar el pipeline; postear con ⚠️ warning; **sin transición**.
- `sessions_found: false` → escalar. `outcome: "low_confidence"`.

**Archivo:** `.claude/agents/qa-orchestrator.md` — §ORC-2.

---

### Desvío 4 — Formato `customfield_10061` rechazado en MODO A

**Observado:** En la skill `jira-writer` MODO A (creación de ticket), el campo `Componente`
se enviaba como `[{ "value": "AI" }]` (formato objeto). La API de Jira NAA lo rechazó con:
`"Specify an string at index 0 for Componente"`.

**Fix:** El formato correcto es `["AI"]` (array de strings planos). Nota agregada en
`field-map.md` sección "Componentes conocidos".

**Archivo:** `.claude/skills/jira-writer/references/field-map.md`.

---

## Decisión: nuevo comportamiento para `confidence:low`

El comportamiento anterior (escalar todo con `confidence:low`) era demasiado conservador.
La nueva política acordada:

1. Si hay sesiones encontradas → el pipeline avanza, aporta valor, pero deja la decisión
   de transición al humano (no cambia estado en Jira).
2. El comentario Jira incluye un bloque ⚠️ explícito para que el revisor pueda validar
   que las sesiones ejecutadas corresponden al ticket.
3. Solo si no hay sesiones (`sessions_found: false`) el pipeline escala.

Esta decisión equilibra automatización vs. confianza: no bloquear por incertidumbre
clasificatoria cuando hay evidencia de test disponible.

---

## Gaps detectados durante la sesión

- Archivos binarios adjuntos (`.webm`, `.mp4`) en comentarios de dev no son procesados
  por el pipeline. Evaluar si debería sugerir revisión manual antes de escalar
  `criteria_source:none`. Ver `wiki/log.md`.
