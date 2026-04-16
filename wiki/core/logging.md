---
source: src/core/utils/logger.ts · src/core/wrappers/testWrapper.ts · src/core/wrappers/retry.ts
last-updated: 2026-04-13
---

# Core: Convenciones de Logging Winston

## Propósito

Convenciones autoritativas del sistema de logs Winston para el framework. Define cuándo usar cada nivel, la arquitectura de capas, reglas estructurales y anti-patrones.

---

## Arquitectura de 3 capas (por qué los niveles importan)

| Capa | Destino | Nivel mínimo | Qué captura |
|------|---------|-------------|-------------|
| Global File | `logs/application-YYYY-MM-DD.log` | `debug` | Todo |
| Console | Terminal durante ejecución | `info` | INFO, WARN, ERROR |
| Session File | `logs/session-<label>.log` | `debug` | Todo (solo durante el test) |

**Consecuencia directa:** `debug` es **invisible en terminal**. Solo aparece en archivos de log.
Usá `debug` para ruido de implementación. Usá `info` para lo que querés ver mientras el test corre.

---

## Cuándo usar cada nivel

### `debug`
**Qué loguear:** Traza interna de un paso atómico. Ruido de implementación útil solo al debugear.

| ✅ Correcto para debug | Ejemplo |
|----------------------|---------|
| URL o ID de recurso antes de navegar | `'Navegando a Post ID: ${id}. URL: ${url}'` |
| Estado interno de retry (intento N/M) | `'Intento ${attempt}/${retries}...'` |
| Hover sobre ancestro, scroll, foco interno | `'Intentando hover sobre ancestro...'` |
| Selector o locator evaluado | `'Locator evaluado: ${selector}'` |
| Toast capturado por monitor | `'[ToastMonitor] Toast: ${event.type}'` |
| Parámetro de entrada de acción primitiva | `'Esperando visibilidad de: ${label}'` |

**Dónde pertenece:** `src/core/actions/`, utils internos, sub-componentes de `src/pages/`. **Nunca en Maestros.**

---

### `info`
**Qué loguear:** Evento observable de negocio. Lo que querés ver en terminal para saber que el test avanza.

| ✅ Correcto para info | Ejemplo |
|----------------------|---------|
| Inicio / fin de sesión de prueba | `'>>> Iniciando Sesión: ${label} <<<'` |
| WebDriver y CDP listos | `'🚀 WebDriver y CDP listos'` |
| Acción de negocio completada | `'✅ Login exitoso para ${user}'` |
| Resultado exitoso de flujo de alto nivel | `'✅ Post guardado: "${title}"'` |
| Acción recuperada por retry (evento, no detalle) | `'✅ Acción recuperada en intento ${attempt}'` |

**Dónde pertenece:** `src/core/wrappers/testWrapper.ts`, `src/core/config/driverManager.ts`, Maestros (`Main*.ts`).

---

### `warn`
**Qué loguear:** Anomalía recuperada. El test continuó pero ocurrió algo inesperado.

| ✅ Correcto para warn | Ejemplo |
|----------------------|---------|
| JS errors detectados en browser | `'⚠️ Errores de JS detectados en [${label}]'` |
| Inestabilidad en retry (falló pero sigue) | `'${prefix} Inestabilidad en intento ${attempt}/${retries}'` |
| Estado inesperado que no requirió fallar | `'⚠️ Elemento no visible pero continuando...'` |

**Dónde pertenece:** `src/core/wrappers/retry.ts`, `src/core/utils/browserLogs.ts`, monitores.
**Nunca:** para detalles de implementación ni para eventos normales.

---

### `error`
**Qué loguear:** Fallo capturado en `catch`. Siempre con metadata de error.

| ✅ Correcto para error | Ejemplo |
|-----------------------|---------|
| Toda excepción en un catch | `logger.error(\`Error en miMetodo: ${getErrorMessage(error)}\`, { label, error: getErrorMessage(error) })` |
| Fallo crítico de sesión | `'❌ FALLO CRÍTICO en ${opts.label}'` |
| Error de red capturado por monitor | ver `networkMonitor.ts` |

**Regla estructural:** `logger.error()` en catch **siempre** incluye `error: getErrorMessage(error)` en el objeto de metadata.

---

## Concepto: Retry Boundary

Un **retry boundary** es el punto donde `retry()` es la capa de manejo de errores más externa en un camino de ejecución. Determina qué catch block es responsable del log terminal.

**Dentro del retry boundary** (dentro del lambda `async () => {` pasado a `retry()`):
- El error es transitorio hasta que retry lo declare terminal.
- El log terminal lo emite `retry` al agotar los reintentos o detectar un error FATAL.
- El catch solo debe `throw` (obligatorio) y opcionalmente `logger.debug` (diagnóstico de intento).
- `logger.error()` está **prohibido** aquí — dispara en cada intento fallido, generando falsos alarmas en terminal.

**Fuera / en el borde del retry boundary** (el catch que envuelve a `retry()`, o cualquier catch sin retry):
- El error es terminal. Si llega aquí, no hay reintento que lo resuelva.
- `logger.error()` es **obligatorio** antes del throw.

**Cómo detectar si un catch está dentro de un retry boundary:**
1. ¿El archivo está en `src/core/actions/`? → Siempre dentro (todas las core actions son Tier 1).
2. ¿El método en `src/pages/` abre con `return await retry(async () => {` o `await retry(async () => {` y el try/catch está adentro de ese lambda? → Tier 1.
3. ¿El catch está FUERA del retry (envolviéndolo)? → Boundary externo → `logger.error` obligatorio.

---

## Reglas estructurales (no negociables)

| # | Regla | Racional |
|---|-------|---------|
| 1a | Todo `catch` DEBE re-lanzar la excepción | Silenciar = atrapar sin relanzar. Nunca atrapar y descartar. |
| 1b | Un `catch` dentro del lambda de `retry()` **NO DEBE** usar `logger.error()`. Puede usar `logger.debug()`. | Un `logger.error()` dentro de retry dispara en cada intento fallido. `retry` es el dueño del log terminal — lo emite al agotar reintentos o detectar error FATAL. |
| 2 | Un `catch` que **envuelve** `retry()` (boundary externo) o está en un método sin retry DEBE usar `logger.error()` | Este sí es el boundary final. Si llega aquí, retry ya agotó sus intentos. |
| 3 | `logger.error()` en catch de boundary externo DEBE incluir `error: getErrorMessage(error)` en metadata | Trazabilidad completa del error |
| 4 | Todo log DEBE tener `{ label }` en metadata | Sin label, el log no es trazable a sesión |
| 5 | Los Maestros NUNCA tienen `logger.debug()` | Los Maestros no tienen lógica interna; delegan |
| 6 | Los sub-componentes NUNCA tienen `logger.info()` de negocio | El nivel de abstracción no corresponde |
| 7 | `logger.warn()` solo para anomalías reales, no para estado normal | Evitar ruido de warn |

---

## Anti-patrones que detectar y cómo corregirlos

| Anti-patrón | Ejemplo incorrecto | Corrección |
|-------------|-------------------|------------|
| `error` dentro de lambda de retry | `catch (e) { logger.error('Error en clickSafe...'); throw e; }` (dentro del callback de `retry()`) | Cambiar a `logger.debug(...)` sin `error:` en metadata; el retry wrapper maneja el log terminal |
| `catch` sin rethrow dentro de retry | `catch (e) { logger.debug(...); }` sin `throw e` | Agregar `throw e` — sin rethrow, retry interpreta el intento como exitoso |
| Boundary externo sin logger.error | `catch (e) { throw e; }` envolviendo un `retry()` | Agregar `logger.error(...)` con `error: getErrorMessage(e)` — este catch SÍ es el boundary final |
| `info` con detalle interno | `logger.info('Intentando hover sobre ancestro...')` | Cambiar a `debug` |
| `debug` en un Maestro | `logger.debug('Iniciando flujo de login')` | Cambiar a `info` o mover al sub-componente |
| `error` sin `getErrorMessage` (boundary externo) | `logger.error('Falló', { label })` | Agregar `error: getErrorMessage(error)` |
| Log sin `{ label }` | `logger.info('Texto')` | Agregar `{ label: this.config.label }` |
| `warn` para estado normal | `logger.warn('Botón clickeado')` | Cambiar a `debug` o `info` según contexto |
| Log de UI-detail con `info` en sub-componente | `logger.info('Seteando valor del campo')` | Cambiar a `debug` |

---

## Formato del label según contexto

```typescript
// En testWrapper / config (acceso directo)
logger.info('mensaje', { label: sessionLabel });
logger.info('mensaje', { label: config.label });

// En sub-componentes y Maestros (vía this.config)
logger.error(`Error: ${getErrorMessage(error)}`, { 
  label: this.config.label,
  error: getErrorMessage(error)
});

// En utils con label como parámetro
logger.debug('mensaje', { label });    // cuando label es el nombre de la variable
logger.debug('mensaje', { label: configLabel });
```

---

## Emojis permitidos (convención del proyecto)

| Emoji | Uso |
|-------|-----|
| `🚀` | Inicio de infraestructura (driver, CDP) |
| `✅` | Acción o flujo completado exitosamente |
| `❌` | Fallo crítico |
| `⚠️` | Anomalía o advertencia |
| `>>>` / `<<<` | Delimitadores de sesión |

No agregar emojis donde no los haya actualmente. Solo respetar el patrón existente.

---

## API del logger

Ver [core/utils.md](utils.md) para la API completa del logger Winston (`import`, `addSessionTransport`, configuración de archivos rotativos).
