# Jira Transition IDs — Proyecto NAA

IDs numéricos de las transiciones de estado usados por test-reporter y jira-writer.

| ID | Nombre | Estado destino | Cuándo se aplica |
|----|--------|----------------|-----------------|
| `42` | A Versionar | A Versionar | Test passed en `master` con confidence high/medium y all_automatable: true |
| `2` | FEEDBACK | Feedback | Test failed en `master` |
| `31` | Done | Done | Test passed en `dev_saas` |

## Reglas de uso

- `"42"` solo se aplica si `partial_coverage: false` y `confidence != "low"`. Ver TR-4b en test-reporter.
- `"2"` se aplica cuando hay al menos 1 test fallido en `master`.
- `"31"` se aplica cuando todos los tests pasan en `dev_saas`.
- En entorno `[cliente]`: seguir la misma lógica que `master` (IDs `42` / `2`).
- En entorno `testing`: **nunca transicionar** — solo comentario informativo.

## Obtener transiciones actualizadas

```bash
curl -u EMAIL:API_TOKEN \
  "https://bluestack-cms.atlassian.net/rest/api/3/issue/NAA-1/transitions" \
  | jq '.transitions[] | {id, name}'
```

Ver también `.claude/references/COMMANDS.md` para el comando curl completo.