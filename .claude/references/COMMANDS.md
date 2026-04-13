# COMMANDS — BlueStack Test Automation Framework

> Repositorio central de comandos del proyecto.
> **Convención:** cada vez que descubras o uses un comando nuevo relevante para este proyecto, agregalo aquí antes de usarlo en conversación. Este archivo debe crecer solo con el uso.

---

## Tests — Modos de ejecución

`TestName` = nombre del archivo sin extensión (ej: `CreatePost`).

### npm scripts (recomendado)

| Modo | Comando | Cuándo usar |
|---|---|---|
| Dev | `npm run test:dev -- TestName` | Desarrollo local, navegador visible |
| Grid | `npm run test:grid -- TestName` | Headless contra Docker Selenium Grid |
| CI | `npm run test:ci -- TestName` | Flujo completo (clean → infra:up → exec → infra:down) |

### Forma directa (cuando npm falla en WSL2)

```bash
# Dev — navegador visible
cross-env NODE_OPTIONS='--experimental-vm-modules' USE_GRID=false IS_HEADLESS=false npx jest TestName

# Grid — headless, Docker
cross-env NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true npx jest TestName
```

Por qué: WSL2 no reenvía argumentos correctamente a través de npm scripts en algunos contextos. `NODE_OPTIONS='--experimental-vm-modules'` es siempre obligatorio (ESM).

---

## Jira — Consulta manual via curl

Usar solo cuando el MCP de Atlassian no está disponible. Requiere variables de entorno `JIRA_USERNAME` y `JIRA_API_TOKEN`.

```bash
curl -s -u "$JIRA_USERNAME:$JIRA_API_TOKEN" \
  -H "Accept: application/json" \
  "https://bluestack-cms.atlassian.net/rest/api/3/issue/NAA-XXXX?fields=summary,status,issuetype,assignee,description,attachment"
```

Reemplazar `NAA-XXXX` por el número de ticket.

---

## Infraestructura Docker

(agregar comandos aquí a medida que se usen)