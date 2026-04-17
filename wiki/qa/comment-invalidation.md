# Invalidación de criterios por comentarios — TA-4.4

Descripción del mecanismo por el que el ticket-analyst descarta criterios antes de correr tests.

## Cuándo aplica

Siempre, después de extraer o inferir los criterios (TA-4.1 o TA-4.2), antes de calcular testability_summary.

## Señales de invalidación

### Señal de máxima prioridad: criterio delegado a ticket específico
Cuando un comentario menciona que un criterio "ya tiene creado un ticket NAA-XXXX", "está siendo trabajado en NAA-XXXX", "tenemos reportado en NAA-XXXX":
1. Verificar el estado del ticket referenciado via MCP
2. Si no está `Done` / `Cerrado` → criterio delegado → excluir

Esta señal tiene precedencia absoluta. No puede ser contrarrestada por otra señal del mismo comentario.

### Señal: criterio incierto / especulativo
Frases como "puede que esté haciendo referencia a", "eso interpreto", "podría ser que", "habría que evaluar", "se puede evaluar y definir" → criterio sin base verificable → excluir.

### Señal: evaluación pendiente
Frases como "evaluar y definir", "a definir", "pendiente de decisión", "falta definir" → criterio sin implementación confirmada → excluir.

### Señal: QA como comentarista
Cuando el comentario es del QA del equipo (jtcaldera@bluestack.la) y clasifica o redirige criterios → señal de máxima confianza. El QA tiene contexto del sistema y está diciendo explícitamente dónde se trabaja cada punto.

## Resultado de la invalidación

- Si quedan criterios válidos: pipeline continúa con los criterios restantes.
- Si todos quedan invalidados: `criteria_source: "none"`, `testable: false`, `human_escalation: true` → ORC-6 con `escalation_mode: true`.

## Ejemplo real — NAA-4188 (2026-04-16)

El ticket tenía 3 criterios inferidos de la descripción. El único comentario (del QA) decía:
- Criterio 1: "El primero ya tiene creado un ticket: NAA-4037 puesto en la v.8.6.17" → NAA-4037 estaba In Progress → delegado → excluir
- Criterio 2: "puede que esté haciendo referencia al error reportado en el NAA-4102" → especulativo + referencia a ticket abierto → excluir
- Criterio 3: "se puede evaluar y definir acción" → pendiente de decisión → excluir

Resultado correcto: `testable: false`, `human_escalation: true`, escalación con guía manual. El pipeline debía escalar, no correr tests.

Lo que ocurrió incorrectamente: el pipeline ignoró TA-4.4, mantuvo los 3 criterios, corrió `NewYoutubeVideo` y transicionó el ticket a "A Versionar". El QA debió revertirlo manualmente.
