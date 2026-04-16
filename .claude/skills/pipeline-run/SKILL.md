---
name: pipeline-run
description: "Ejecuta el pipeline QA completo para un ticket Jira y captura aprendizajes post-ejecución. Activar cuando el usuario diga: \"correr el pipeline para NAA-XXXX\", \"probar el ticket NAA-XXXX\", \"ejecutar pipeline NAA-XXXX\", \"validar ticket NAA-XXXX\", \"simular el flujo para NAA-XXXX\", \"quiero probar este ticket\", o cuando pegue un ticket key directamente (ej. \"NAA-4188\", \"NAA-4467\"). Esta skill es la puerta de entrada principal al ciclo de entrenamiento iterativo del pipeline QA — usarla siempre que el usuario mencione un ticket de Jira en contexto de validación o testing."
---

# Skill — Pipeline Run (Training Mode)

Sos el punto de entrada del pipeline QA. Tu rol es: recibir el ticket, disparar el orquestador, observar el resultado y ejecutar el ciclo de aprendizaje post-ejecución.

**No ejecutás tests. No escribís en Jira directamente. Coordinás y aprendés.**

---

## PR-1: Parsear el input del usuario

Extraer del mensaje:

| Campo | Fuente | Default |
|---|---|---|
| `ticket_key` | Patrón `NAA-\d+` en el mensaje | obligatorio — preguntar si falta |
| `environment` | "master" / "dev_saas" / "dev saas" | `"master"` |

Si `ticket_key` no está: `"¿Cuál es el número del ticket? (ej. NAA-4467)"`

---

## PR-2: Anunciar inicio

```
▶ Pipeline Run — [ticket_key]
  Ambiente:  [environment]
  Trigger:   manual (training mode)

Iniciando pipeline...
```

No esperar confirmación. Ejecutar directamente.

---

## PR-3: Invocar qa-orchestrator

```
Agent({
  subagent_type: "qa-orchestrator",
  prompt: "Ejecutar el qa-orchestrator para el ticket [ticket_key] en ambiente [environment]. requested_by: manual."
})
```

El orquestador maneja toda la lógica interna: idempotencia, sub-agentes, execution context, reporte en Jira.

---

## PR-4: Capturar el resultado

Cuando el orquestador retorna, leer `pipeline-logs/completed/[ticket_key].json` (o `active/` si aún está ahí) para obtener `milestone_notes.outcome`.

Para el mapeo completo de outcomes → ciclos: leer [`references/outcomes.md`](references/outcomes.md).

---

## PR-5: Ciclos de aprendizaje post-ejecución

### Ciclo de éxito (`outcome: "success"`)

```
✅ Pipeline completado — [ticket_key]
   Tests encontrados: [total_tests]
   Pasaron: [passed] | Fallaron: [failed]
   Comentario posteado en Jira: [last_comment_id]
```

→ Ejecutar **PR-6**.

---

### Ciclo de brecha de cobertura (`outcome: "no_sessions"`)

```
⚠️ No se encontraron tests para [ticket_key]

  Módulo detectado: [classification.module]
  Componente:       [classification.component]
  Criterios:        [acceptance_criteria[].description]

¿Querés que genere los tests ahora?
  → "sí, generá los tests" — activa create-session
  → "no, lo anoto"        — registra gap en wiki/log.md
```

Si el usuario confirma, activar skill `create-session` pasando los criterios del `ticket_analyst_output`.

→ Ejecutar **PR-6** siempre.

---

### Ciclo de escalación humana (`outcome: "human_escalation"`)

El orquestador ya imprimió el `escalation_report`. Agregar:

```
🧑 Escalación al humano — [ticket_key]

  Para entrenar al sistema, podés:
  1. Responder con los criterios correctos de validación.
     → Los capturo como convención y persisto en memoria.
  2. Validar manualmente y decirme el resultado ("pasó" / "falló").
     → Registro el resultado en el execution context.
  3. Saltear este ticket.
     → No se aprende nada de esta ejecución.

¿Cuál es el criterio correcto para este ticket?
```

Si el usuario provee criterios:
- Capturar como memoria `reference_<modulo>_<tema>.md`
- Proponer entrada en `wiki/pages/<módulo>.md` según regla `memory-wiki-bridge`
- Agregar campo `human_feedback` en `pipeline-logs/completed/[ticket_key].json`

---

### Ciclo no-automatizable (`outcome: "non_automatable"`)

```
🚫 Criterios no automatizables — [ticket_key]

  Razón: [escalation_report.reason]
  Guía de testing manual ya incluida en el comentario de Jira.

  ¿Registramos esto como patrón conocido para futuros tickets similares?
  → "sí" — capturo el patrón en memoria.
  → "no"
```

Si confirma, guardar memoria `reference_non_automatable_<pattern>.md`.

---

### Ciclo de error (`outcome: "error"`)

```
💥 Error en el pipeline — [ticket_key]

  Stage: [error_log[-1].stage]
  Tipo:  [error_log[-1].error_type]
  Msg:   [error_log[-1].message]
```

Para pasos de resolución según `error_type` → leer [`references/errors.md`](references/errors.md).

---

### Outcome: ticket en estado incorrecto (`outcome: "wrong_status"`)

Informar al usuario: `"El ticket [ticket_key] está en estado '[status]' — no corresponde procesarlo en ambiente [environment] ahora."` No ejecutar PR-6.

### Outcome: ya procesado (`outcome: "skipped"`)

Informar: `"Este ticket ya fue procesado anteriormente (already_reported: true). Para forzar re-ejecución, eliminá pipeline-logs/completed/[ticket_key].json."` No ejecutar PR-6.

---

## PR-6: Captura de aprendizajes (cierre universal)

Ejecutar en todo ciclo que no sea `wrong_status` ni `skipped`.

### PR-6.1 — Preguntar

```
📚 Aprendizajes de esta ejecución

  ¿Algo que el pipeline interpretó incorrectamente?
  ¿Alguna convención o definición que quieras que recuerde para futuros tickets?

  Ejemplos:
  - "El módulo de videos siempre incluye el flujo de thumbnail"
  - "Cuando dice 'guardar borrador' validar que no se publique"
  - "En dev_saas, el campo X no es obligatorio"

  → Respondé o decí "nada" para cerrar.
```

### PR-6.2 — Procesar feedback

Si el usuario provee algo:
1. Convención de código/POM → memoria `feedback_*.md`
2. Comportamiento del CMS (locator, estado, condición) → memoria `reference_*.md`
3. Si es project-wide → proponer migración a `wiki/` según regla `memory-wiki-bridge`
4. Confirmar:
   ```
   ✓ Capturado: [nombre del archivo de memoria]
   [si aplica] También propongo agregar esto a wiki/pages/[módulo].md — ¿confirmo?
   ```

### PR-6.3 — Log de la sesión

Agregar entrada a `wiki/log.md`:
```
[training-run] [fecha] — [ticket_key] — outcome: [outcome] — [una línea resumida o "sin aprendizajes nuevos"]
```

---

## PR-7: Resumen final

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pipeline Run — [ticket_key] — DONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Resultado:    [outcome]
Aprendizajes: [N memorias guardadas / "ninguno"]
Próximo paso: [acción sugerida o "listo"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para el próximo ticket, decime el número o pegalo directo.
```

---

## Restricciones

- No eliminar execution contexts de `pipeline-logs/` — son el historial de entrenamiento.
- Las memorias capturadas no reemplazan la wiki — proponer siempre la migración según `memory-wiki-bridge`.
