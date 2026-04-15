---
name: WSL2 npm/npx command failure
description: npm y npx resuelven al binario de Windows en WSL2 — usar node node_modules/.bin/jest y docker compose directo
type: feedback
---

NUNCA usar `npx jest`, `npm run test:*`, ni `npm run infra:*` desde el Bash tool en este entorno.

**Why:** `npm` y `npx` en el PATH de este entorno WSL2 resuelven al binario de Windows (`/mnt/c/Program Files/nodejs/`). Cuando npm intenta ejecutar un script desde la ruta UNC de WSL2 (`\\wsl.localhost\Ubuntu\...`), Windows CMD lo rechaza con `"No se permiten rutas UNC"`. Esto ocurre en cualquier invocación de npm/npx desde el Bash tool de Claude Code.

**How to apply:**

| Tarea | Comando CORRECTO |
|-------|-----------------|
| Ejecutar test (grid) | `NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true node node_modules/.bin/jest TestName --json --outputFile=...` |
| Ejecutar test (dev) | `NODE_OPTIONS='--experimental-vm-modules' USE_GRID=false IS_HEADLESS=false node node_modules/.bin/jest TestName` |
| Levantar Docker Grid | `docker compose up -d --wait` |
| Bajar Docker Grid | `docker compose down` |
| Verificar grid | `curl -s http://localhost:4444/status` |

`cross-env` es innecesario en bash — pasar variables inline antes del comando.

Ver detalles completos: `wiki/core/docker-grid.md`