# Docker Selenium Grid — Setup y Ejecución (WSL2)

**Stack:** Docker Desktop for Windows + WSL2 Ubuntu · Selenium Grid 4.38 · Chrome nodes

---

## Setup del Grid

### Levantar (una vez por sesión de trabajo)

```bash
# Desde la raíz del repo — usa el binario Linux de docker, NO npm run infra:up
docker compose up -d --wait
```

`--wait` bloquea hasta que todos los healthchecks pasen (hub + nodes).

### Verificar que está listo

```bash
curl -s http://localhost:4444/status | python3 -c "
import sys,json
d=json.load(sys.stdin)
print('ready:', d['value']['ready'], '| nodes:', len(d['value']['nodes']))
"
```

### Apagar

```bash
docker compose down
```

---

## Problema conocido: `npm run infra:up` falla en WSL2

`npm` y `npx` resuelven al binario de **Windows** (`/mnt/c/Program Files/nodejs/`).
Cuando un script npm intenta ejecutarse desde una ruta UNC (`\\wsl.localhost\...`),
Windows CMD lo rechaza con `"No se permiten rutas UNC"`.

**Workaround:** Invocar los binarios Linux directamente, sin pasar por npm:

```bash
# ✅ Funciona — docker está en /usr/bin/docker (Linux)
docker compose up -d --wait

# ❌ Falla — npm en PATH es el de Windows
npm run infra:up

# ❌ Falla — npx en PATH es /mnt/c/Program Files/nodejs/npx
npx jest NewPost

# ✅ Funciona — node está en /usr/bin/node (Linux) + jest local
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true \
  node node_modules/.bin/jest {TestName} \
  --json --outputFile=pipeline-logs/results-{ticket}-{execution_id}.json
```

---

## Comando de ejecución Jest (pipeline)

Forma canónica para el test-engine en este entorno WSL2:

```bash
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true \
  node node_modules/.bin/jest {TestName} \
  --json --outputFile=pipeline-logs/results-{ticket}-{execution_id}.json
```

Para Dev_SAAS (TESTING_URL inline):

```bash
NODE_OPTIONS='--experimental-vm-modules' USE_GRID=true IS_HEADLESS=true \
  TESTING_URL="{url}" \
  node node_modules/.bin/jest {TestName} \
  --json --outputFile=pipeline-logs/results-{ticket}-{execution_id}.json
```

> `cross-env` en los npm scripts es innecesario cuando se invoca directamente desde bash —
> las variables de entorno se pasan inline antes del comando.

---

## Diagnóstico rápido

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `CMD.EXE se inició con esta ruta como el directorio actual. No se permiten rutas UNC.` | npm/npx de Windows ejecutando desde path WSL | Usar `docker` o `node node_modules/.bin/jest` directo |
| `curl /status` devuelve vacío | Hub todavía iniciando | Esperar 5s y reintentar |
| Grid levantado pero tests fallan con `ECONNREFUSED` | `USE_GRID=true` no se pasó | Verificar variable de entorno en el comando |
| Tests de IA fallan en TESTING | Feature de IA down en entorno testing | Correr otra session (liveblog, post, video) |

---

## Console errors conocidos en TESTING (no bloquean tests)

Estos errores aparecen en `console_errors_detected[]` del test-engine output pero son
**ruido de entorno**, no fallos de la aplicación bajo test:

| Error | Frecuencia | Causa | Acción |
|-------|-----------|-------|--------|
| `"Your session has expired (failed to identify the intended token)"` | Siempre x2 | Token de sesión de algún servicio externo (no el CMS) expira al navegar | Ignorar — no afecta flujo de automatización |
| `"Google Maps JavaScript API included multiple times"` | Siempre | Dos scripts de Maps cargados en la misma página | Ignorar — warning de Google, no error funcional |

> Si aparece un console error NO listado aquí, puede ser un bug real — reportarlo en el Pipeline Context y no ignorarlo.

---

## Features con fallas conocidas en TESTING (2026-04-14)

| Feature | Session afectada | Error | Estado |
|---------|-----------------|-------|--------|
| Generación de nota IA | `NewAIPost` | `"Modelo inexistente"` / error 429 | ❌ Down — usar otra session |
| Resumen IA automático en Posts | `NewPost` (si genera resumen) | Probable fallo IA | ❌ Evitar — sin confirmar |

Sessions recomendadas para E2E en TESTING: `NewLiveBlog`, `NewListicle`, `NewPost` (sin resumen IA), `NewYoutubeVideo`.
