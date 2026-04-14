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
| Dev / master | `npm run test:dev:master -- TestName` | Dev local contra entorno master |
| Grid / master | `npm run test:grid:master -- TestName` | Grid headless contra entorno master |
| Dev / cliente | `npm run test:dev:cliente -- TestName` | Dev local contra entorno cliente |
| Grid / cliente | `npm run test:grid:cliente -- TestName` | Grid headless contra entorno cliente |

### Multi-entorno — inline y con override de rol

```bash
# Entorno inline (equivalente a los scripts de conveniencia)
TARGET_ENV=master npm run test:dev -- TestName
TARGET_ENV=cliente npm run test:grid -- "post|video"

# Override de rol para pipeline (TEST_ROLE pisa el rol declarado en el test)
TARGET_ENV=master TEST_ROLE=admin npm run test:grid -- FailedLogin

# TARGET_ENV inválido falla inmediatamente con error legible (antes de iniciar el test)
TARGET_ENV=staging npm run test:dev -- NewPost
# ✗ [envConfig] TARGET_ENV="staging" inválido. Valores válidos: testing, master, cliente
```

### Forma directa (cuando npm falla en WSL2)

> **Causa raíz documentada:** `npm` y `npx` en este entorno resuelven al binario de **Windows**
> (`/mnt/c/Program Files/nodejs/`). El binario de Windows rechaza rutas UNC WSL2 con
> `"No se permiten rutas UNC"`. Usar siempre `node node_modules/.bin/jest` directamente.
> `cross-env` tampoco funciona — pasar variables inline antes del comando.

```bash
# Dev — navegador visible
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=false IS_HEADLESS=false \
  node node_modules/.bin/jest TestName

# Grid — headless, Docker
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true \
  node node_modules/.bin/jest TestName

# Multi-entorno directo
TARGET_ENV=master NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true \
  node node_modules/.bin/jest TestName
```

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

## Pipeline QA — Comandos del sistema multi-agente

### sync-test-map.ts — Verificar drift entre sessions en disco y test-map.json

```bash
./node_modules/.bin/tsx scripts/sync-test-map.ts
```

Correr antes de cada release del pipeline o al agregar/eliminar sessions.
Output: tests en disco no mapeados, y paths en test-map.json que no existen.

### Jest en modo pipeline — con output JSON para result parser

```bash
# Ejecución headless contra grid, con output estructurado para el pipeline
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true \
  node node_modules/.bin/jest TestName \
  --json --outputFile=pipeline-logs/results-NAA-XXXX-exec-001.json

# Ejecución Dev_SAAS — override de URL sin tocar .env
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true \
  TESTING_URL="https://dev-saas.bluestack-cms.com" \
  node node_modules/.bin/jest TestName \
  --json --outputFile=pipeline-logs/results-NAA-XXXX-exec-001.json
```

`--json --outputFile` es obligatorio para que test-engine parsee los resultados.
Nunca modificar el `.env` para cambiar la URL — usar override inline.

### Discovery de campos custom Jira (pendiente)

```bash
# Obtener todos los campos de un ticket para identificar customfield_* de deploy/SQL/VFS
curl -s -u "$JIRA_USERNAME:$JIRA_API_TOKEN" \
  -H "Accept: application/json" \
  "https://bluestack-cms.atlassian.net/rest/api/3/issue/NAA-XXXX" \
  | jq '[to_entries[] | select(.key | startswith("customfield")) | {key, value}]'
```

Ejecutar sobre un ticket que tenga los campos "deploy", "cambios SQL" y "cambios VFS" completados.
Agregar los IDs encontrados a OP-1 y OP-6 de jira-reader y a classification-rules.md.

---

## Infraestructura Docker

| Acción | Comando |
|--------|---------|
| Levantar Selenium Grid | `docker compose up -d --wait` |
| Bajar Selenium Grid | `docker compose down` |
| Reiniciar Grid | `docker compose down && docker compose up -d --wait` |
| Verificar estado | `curl -s http://localhost:4444/status \| python3 -c "import sys,json; d=json.load(sys.stdin); print('ready:', d['value']['ready'], '\| nodes:', len(d['value']['nodes']))"` |

`docker-compose.yml` en la raíz del repo. El grid escucha en `http://localhost:4444`.
> `npm run infra:up` falla en WSL2 (npm resuelve al binario de Windows). Usar `docker compose` directo.
> Ver detalles: `wiki/core/docker-grid.md`.