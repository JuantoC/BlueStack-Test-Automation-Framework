# Transiciones disponibles — Proyecto NAA

Extraídas en vivo el 2026-04-07 desde NAA-4429 (global al proyecto).

## Mapa de transiciones

| transition.id | Nombre | status destino | status ID | Categoría |
|---------------|--------|---------------|-----------|-----------|
| `2` | FEEDBACK | FEEDBACK | 10022 | In Progress (amarillo) |
| `3` | BLOCKED | BLOCKED | 10023 | To Do |
| `4` | BLOCKED - CLIENT | BLOCKED - CLIENT | 10027 | To Do |
| `5` | BLOCKED -WS | BLOCKED -WS | 10028 | To Do |
| `6` | CANCELED | CANCELED | 10029 | Done |
| `11` | To Do | To Do | 10018 | To Do |
| `21` | In Progress | In Progress | 10019 | In Progress |
| `31` | Done | Done | 10020 | Done |
| `41` | Revisión | Revisión | 10021 | In Progress |
| `42` | A Versionar | A Versionar | 10033 | Done (verde) |

## Flujo QA estándar

```
To Do → In Progress → Revisión → [QA valida en Master]
                                        ↓
                           ┌────────────────────────┐
                           │  ¿Todos los casos OK?   │
                           └────────────────────────┘
                               ✔ SÍ          ✘ NO
                                ↓              ↓
                          A Versionar      FEEDBACK
                               ↓
                     [QA valida en Dev_SAAS]
                                ↓
                           ┌──────────────┐
                           │  ¿Todo OK?   │
                           └──────────────┘
                            ✔ SÍ    ✘ NO
                             ↓       ↓
                           Done   → Crear ticket nuevo
                                    (Relates to original)
```

## Reglas de transición por resultado de validación

| Situación | Acción en Jira |
|-----------|---------------|
| Validación Master OK (todos ✔) | Transición `42` → A Versionar |
| Validación Master con errores (algún ✘) | Transición `2` → FEEDBACK |
| Validación Dev_SAAS OK | Transición `31` → Done |
| Validación Dev_SAAS con errores | Crear ticket nuevo + link "Relates to" al original |

## Uso con transitionJiraIssue

```json
{
  "cloudId": "c303d73b-75df-492e-9e64-479b722035cf",
  "issueIdOrKey": "NAA-XXXX",
  "transition": { "id": "42" }
}
```
