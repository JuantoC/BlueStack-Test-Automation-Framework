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

## Reglas estructurales (no negociables)

| # | Regla | Racional |
|---|-------|---------|
| 1 | Todo `catch` DEBE tener `logger.error()` | CLAUDE.md: nunca silenciar errores |
| 2 | `logger.error()` en catch DEBE incluir `error: getErrorMessage(error)` en metadata | Trazabilidad completa del error |
| 3 | Todo log DEBE tener `{ label }` en metadata | Sin label, el log no es trazable a sesión |
| 4 | Los Maestros NUNCA tienen `logger.debug()` | Los Maestros no tienen lógica interna; delegan |
| 5 | Los sub-componentes NUNCA tienen `logger.info()` de negocio | El nivel de abstracción no corresponde |
| 6 | `logger.warn()` solo para anomalías reales, no para estado normal | Evitar ruido de warn |

---

## Anti-patrones que detectar y cómo corregirlos

| Anti-patrón | Ejemplo incorrecto | Corrección |
|-------------|-------------------|------------|
| `info` con detalle interno | `logger.info('Intentando hover sobre ancestro...')` | Cambiar a `debug` |
| `debug` en un Maestro | `logger.debug('Iniciando flujo de login')` | Cambiar a `info` o mover al sub-componente |
| `catch` sin log | `catch (e) { throw e; }` | Agregar `logger.error(...)` antes del throw |
| `error` sin `getErrorMessage` | `logger.error('Falló', { label })` | Agregar `error: getErrorMessage(error)` |
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
