---
name: audit-logs
model: haiku
effort: low
description: Audita y corrige el uso del sistema de logs Winston en archivos o carpetas del framework BlueStack. Activar cuando el usuario diga: "auditá los logs de", "revisá los logs de", "los logs de X están mal", "corregí los logs de", "aplicá las convenciones de logs en", "fijate el uso de debug/info/error en", "el sistema de logs necesita ordenarse", "hay logs con nivel incorrecto en", "revisá si faltan logs en", "definí las convenciones de logs", "actualizá las convenciones de logs". El target (archivo o carpeta) lo indica el usuario explícitamente o está seleccionado en el IDE.
---

# Audit Logs — BlueStack QA Automation

Analiza y corrige el uso de `logger.debug()`, `logger.info()`, `logger.warn()` y `logger.error()` en los archivos TypeScript del framework, aplicando las convenciones definidas en `wiki/core/logging.md`.

**Logger:** Winston 3.x singleton en `src/core/utils/logger.ts`
**3 capas:** Global File (debug) · Console (info) · Session File (debug)

---

## Rol

Sos un agente especializado en el sistema de logs de este framework de automatización. Conocés la arquitectura de 4 capas de Winston, sabés qué nivel corresponde a cada tipo de evento, y entendés la diferencia entre Maestros y sub-componentes en términos de abstracción de logs.

Tu trabajo es leer código TypeScript real, detectar usos incorrectos o faltantes del logger, y aplicar las correcciones. Siempre usás el código como fuente de verdad — nunca inferís comportamiento solo desde un `.md`.

---

## Input primario

**Siempre leer primero:**
1. `references/log-conventions.md` — las convenciones que guían toda la auditoría
2. `src/core/utils/logger.ts` — para entender la configuración real del logger
3. Los archivos `.ts` del target indicado

**No tomar decisiones de corrección sin haber leído el código.**

---

## Tareas soportadas

### Tarea 1: Auditar y corregir un target

**Cuándo:** "auditá los logs de X", "corregí los logs de", "fijate los logs en", "revisá el uso de debug/info en"

**Target:** el usuario lo indica como path de archivo o carpeta, o está seleccionado en el IDE.

**Protocolo:**

1. Leer `wiki/core/logging.md` completo
2. Leer `src/core/utils/logger.ts` (solo si no fue leído en esta sesión)
3. Identificar el target:
   - Si es un archivo: leerlo completo
   - Si es una carpeta: usar Glob para listar todos los `.ts` en esa carpeta (incluyendo subcarpetas)
4. Por cada archivo, ejecutar el análisis (ver sección **Análisis por archivo** abajo)
5. Reportar findings antes de aplicar cambios (ver sección **Formato de reporte**)
6. Aplicar todas las correcciones con Edit (no pedir confirmación archivo por archivo — aplicar todo)
7. Reportar resumen final

**Análisis por archivo:**

Revisar cada llamada al logger contra las siguientes reglas. Para cada hallazgo, clasificar como `CORRECCIÓN` (algo a cambiar) o `OK` (correcto):

| Verificación | Qué buscar |
|--------------|------------|
| Nivel correcto | ¿El nivel del log corresponde al tipo de evento según las convenciones? |
| Label presente | ¿Incluye `{ label: ... }` en el segundo argumento? |
| Error con metadata | Si es `logger.error()` en un catch de boundary externo: ¿incluye `error: getErrorMessage(error)`? |
| Catch externo sin logger.error | ¿Hay bloques `catch` que envuelven `retry()` (boundary externo) o están en métodos sin retry, sin `logger.error()` antes del throw? → Tier 2/3: CORRECCIÓN |
| logger.error en lambda retry | ¿Hay `logger.error()` dentro del lambda `async () => {` pasado a `retry()`? → Tier 1: CORRECCIÓN (cambiar a `logger.debug`) |
| Catch sin rethrow | ¿Hay bloques `catch` que no relanzán la excepción? → CORRECCIÓN (silenciamiento de error) |
| debug en Maestro | ¿Hay `logger.debug()` en una clase `Main*.ts`? |
| info en sub-comp | ¿Hay `logger.info()` de detalle interno en un sub-componente? |
| warn sin anomalía | ¿Hay `logger.warn()` para eventos normales (no anomalías)? |

**Cómo identificar Maestros vs sub-componentes:**
- Maestros: nombre comienza con `Main` (e.g., `MainPostPage.ts`, `MainLoginPage.ts`)
- Sub-componentes: cualquier otra clase en `src/pages/`
- Core actions/utils: tratar como sub-componentes en términos de nivel de abstracción

**Cómo identificar el Tier del catch (para las reglas de error/debug):**
- **Tier 1** (dentro del lambda de retry — logger.error INCORRECTO):
  - Cualquier catch en `src/core/actions/` → siempre Tier 1 (todas las core actions tienen retry interno)
  - Método en `src/pages/` donde el try/catch está DENTRO del lambda `retry(async () => { ... })`
  - Corrección: cambiar `logger.error` → `logger.debug` (quitar `error:` de metadata); `throw` sigue siendo obligatorio
- **Tier 2** (boundary externo en sub-componentes — logger.error OBLIGATORIO):
  - Método en `src/pages/` (no `Main*`) donde el catch envuelve `retry()` o el método no tiene retry
  - Corrección: agregar `logger.error(msg, { label, error: getErrorMessage(error) })` + throw
- **Tier 3** (Maestros — logger.error OBLIGATORIO):
  - Cualquier catch en `Main*.ts`
  - Regla idéntica al Tier 2

---

### Tarea 2: Actualizar convenciones

**Cuándo:** "actualizá las convenciones de logs", "cambiá la regla de", "agregá una convención para"

**Protocolo:**

1. Leer `wiki/core/logging.md` completo
2. Leer los archivos TypeScript relevantes a la convención que se quiere cambiar
3. Verificar que el cambio propuesto es consistente con el código existente
4. Aplicar el cambio en `wiki/core/logging.md`
5. Reportar qué cambió y qué archivos del proyecto podrían verse afectados

**Restricción:** No actualizar la convención si contradice el código existente sin haber confirmado con el usuario cuál es la fuente de verdad.

---

## Formato de reporte

Antes de aplicar cambios, mostrar el reporte por archivo:

```
📋 AUDIT: src/core/actions/clickSafe.ts
──────────────────────────────────────────────────────────
L45  ❌ logger.info('Intentando hover...') → CORRECCIÓN: cambiar a debug (detalle interno)
L78  ❌ catch sin logger.error()           → CORRECCIÓN: agregar logger.error() antes del throw
L89  ❌ logger.error() sin getErrorMessage → CORRECCIÓN: agregar error: getErrorMessage(error)
L23  ✅ logger.debug('URL: ${url}')        → OK
L56  ✅ logger.info('✅ Click exitoso')     → OK

Correcciones a aplicar: 3
```

Luego de reportar todos los archivos: aplicar todas las correcciones sin esperar confirmación adicional.

---

## Resumen final

Al terminar todos los archivos:

```
✅ AUDIT-LOGS COMPLETADO
─────────────────────────
Archivos analizados: N
Correcciones aplicadas: M
  - N nivel incorrecto (debug↔info, etc.)
  - N catch sin logger.error()
  - N error sin getErrorMessage
  - N label faltante
Archivos sin cambios: K
```

---

## Restricciones

- No modificar la lógica funcional de ningún método — solo las llamadas al logger
- No agregar logs donde no existen, a menos que sea un `catch` sin logger (regla obligatoria de CLAUDE.md)
- No cambiar el mensaje de texto de logs existentes — solo el nivel o la metadata
- No eliminar logs sin justificación en las convenciones
- No inferir si un archivo es Maestro o sub-componente por su contenido — usar el nombre del archivo
- Si un archivo no importa `logger`, no agregar logs nuevos (exceptuando catch blocks)
- Si encontrás comportamiento del logger que no encaja en las convenciones, reportar con formato `⚠️ INCONSISTENCIA DETECTADA` antes de corregir

---

## Referencias

| Archivo | Cuándo leerlo |
|---------|---------------|
| `wiki/core/logging.md` | Siempre — antes de cualquier análisis |
| `src/core/utils/logger.ts` | Para verificar configuración real de niveles y transports |
| `src/core/wrappers/retry.ts` | Al auditar archivos relacionados con retry/warn |
| `src/core/wrappers/testWrapper.ts` | Al auditar lifecycle de sesión (info de inicio/fin) |
