---
name: sanitize-docs
description: Revisa y documenta funciones públicas y clases de archivos TypeScript del proyecto Bluestack con JSDoc completo y comentarios inline. Usar cuando el usuario diga "documentá este archivo", "sanitizá la carpeta X", "agregá JSDoc", "revisá los comentarios de", "documentá el proyecto", o cualquier variante de querer mejorar la documentación del código. También activar cuando el usuario mencione una carpeta específica como src/core, src/pages, o cualquier subcarpeta del proyecto.
---

# Sanitize Docs Skill

Agrega y completa documentación JSDoc en funciones públicas y clases TypeScript del proyecto Bluestack. El objetivo no es solo documentar para humanos — los comentarios deben ser suficientemente ricos para que un agente de IA pueda entender el propósito, contrato y comportamiento de cada pieza **sin necesidad de leer el cuerpo de la función**.

---

## Qué documentar

### ✅ Documentar siempre
- Funciones y métodos **públicos** (exportados o sin modificador `private`)
- **Clases completas** (JSDoc a nivel de clase + sus métodos públicos)

### ❌ No documentar
- Métodos privados (`private`)
- Funciones internas / helpers no exportados dentro de un método
- Getters/setters triviales
- Constructores simples que solo asignan propiedades (a menos que tengan lógica relevante)

---

## Regla de oro: respetar lo existente

**Si una función o clase ya tiene JSDoc → no tocarla.**
Solo intervenir cuando:
- No tiene ningún comentario JSDoc
- Tiene un comentario JSDoc incompleto (le faltan campos obligatorios — ver sección siguiente)

Si el JSDoc existente está completo aunque sea breve, dejarlo como está.

---

## Estructura del JSDoc obligatoria

Todo JSDoc generado debe incluir estos campos en este orden:

```typescript
/**
 * [Descripción: qué hace, por qué existe, cuál es su intención de diseño.
 *  Orientada a que un agente IA entienda el rol de esta pieza en el sistema
 *  sin necesidad de leer su implementación.]
 *
 * @param nombreParam - [Tipo implícito por TypeScript] Significado semántico del parámetro.
 * @param otroParam - Idem.
 * @returns {TipoDeRetorno} Qué representa el valor devuelto y cuándo es relevante.
 */
```

### Reglas de cada campo

**Descripción (primera línea/párrafo):**
- Explicar la *intención*, no repetir la firma
- Mencionar el patrón de diseño si aplica (ej: "Orquestador", "Facade", "Strategy")
- Si delega en otros métodos, mencionarlos: "Delega en `clickSafe` para ganar foco"
- Si forma parte de un flujo mayor, indicarlo: "Usado por `MainPostPage` para..."

**`@param`:**
- Uno por parámetro, en el mismo orden que la firma
- El tipo ya está en TypeScript, no repetirlo en el JSDoc salvo que aporte contexto
- Describir el *significado semántico*, no el tipo: no "string con el texto" sino "Cadena a ingresar en el campo, sin sanitizar"
- Para `opts: RetryOptions` siempre escribir: "Opciones de reintento y trazabilidad. Se propaga a todos los sub-llamados internos."

**`@returns`:**
- Siempre presente si la función no es `Promise<void>`
- Describir qué representa el valor, no solo el tipo
- Ejemplo: `@returns {Promise<WebElement>} El elemento objetivo tras confirmar la escritura.`

---

## Comentarios inline en pasos complejos

Dentro del cuerpo, agregar comentarios inline **solo cuando el bloque de código no se explica solo**. Seguir el patrón del proyecto:

```typescript
// 1. Preparación: Click previo para ganar foco y asegurar visibilidad.
const element = await clickSafe(driver, ID, internalOpts);

// 2. Identificación: Determinamos la naturaleza del input.
const isEditable = await isContentEditable(element);

// 3. Ejecución: Acción atómica de escritura.
if (isEditable) { ... }
```

**Cuándo agregar inline:**
- Bloques con lógica no obvia (detección de tipo, estrategias condicionales, reintentos)
- Pasos secuenciales con número (`// 1.`, `// 2.`) cuando hay 3+ pasos encadenados
- Cualquier workaround o decisión de diseño no evidente

**Cuándo NO agregar inline:**
- Líneas simples de asignación o llamadas directas
- Bloques ya comentados
- Código autoexplicativo por nombres de variables/métodos

---

## JSDoc de clases

Para clases, el JSDoc va a nivel de declaración e incluye:

```typescript
/**
 * [Descripción del rol de la clase en el sistema. Qué sección del CMS representa,
 *  qué patrón aplica (Facade, Page Object, Orchestrator), y qué sub-componentes coordina.]
 *
 * @example
 * const page = new MainPostPage(driver, NoteType.POST, opts);
 * await page.createNewNote();
 */
export class MainPostPage { ... }
```

El `@example` es opcional pero muy recomendado para Page Objects y clases de uso frecuente, ya que le da al agente un patrón de instanciación directo.

---

## Idioma

**Siempre en español.** Sin excepciones, incluso si el código existente tiene comentarios en inglés. Los comentarios nuevos o completados van en español.

---

## Modo de operación por carpeta

Cuando el usuario indique una carpeta (ej: `src/core/actions/`):

1. **Listar** todos los archivos `.ts` de esa carpeta (no recursivo salvo que el usuario lo pida)
2. **Anunciar** el archivo que vas a procesar: `"Procesando: src/core/actions/writeActions.ts"`
3. **Revisar** el archivo e identificar qué entidades necesitan documentación
4. **Mostrar los cambios** como diff o bloque antes/después para cada entidad modificada
5. **Esperar confirmación** del usuario antes de pasar al siguiente archivo
6. **Repetir** para cada archivo de la carpeta

Si el usuario dice "seguí" o "aplicá todo" sin revisar, procesar el resto sin interrupciones.

---

## Proceso de revisión por archivo

Para cada archivo `.ts`:

1. Leer el archivo completo
2. Identificar todas las funciones públicas exportadas y clases
3. Para cada una, verificar:
   - ¿Tiene JSDoc? → Si está completo, skip. Si le faltan campos obligatorios, completar.
   - ¿No tiene JSDoc? → Generar uno completo
4. Identificar si el cuerpo tiene pasos complejos sin comentarios inline → agregar si aplica
5. Presentar los cambios agrupados por archivo

---

## Criterio de completitud de un JSDoc existente

Un JSDoc existente se considera **incompleto** si le falta alguno de estos:
- Descripción (primera línea)
- Al menos un `@param` por cada parámetro de la firma (excepto `this`)
- `@returns` cuando el retorno no es `void` o `Promise<void>`

Si solo le falta el `@returns` en una función `void`, se considera completo.

---

## Ejemplo de transformación

**Antes (sin JSDoc):**
```typescript
export async function clickSafe(
  driver: WebDriver,
  ID: Locator | WebElement,
  opts: RetryOptions = {}
): Promise<WebElement> {
  // ...cuerpo...
}
```

**Después:**
```typescript
/**
 * Ejecuta un click seguro sobre un elemento, garantizando visibilidad y foco previo.
 * Orquesta scroll, espera de visibilidad y reintento automático ante fallos transitorios.
 * Punto de entrada recomendado para cualquier interacción que requiera click en el framework.
 *
 * @param driver - Instancia activa de WebDriver para la sesión actual.
 * @param ID - Locator o WebElement del elemento objetivo.
 * @param opts - Opciones de reintento y trazabilidad. Se propaga a todos los sub-llamados internos.
 * @returns {Promise<WebElement>} El elemento objetivo tras confirmar el click exitoso.
 */
export async function clickSafe(
  driver: WebDriver,
  ID: Locator | WebElement,
  opts: RetryOptions = {}
): Promise<WebElement> {
  // ...cuerpo...
}
```

---

## Lo que este skill NO hace

- No refactoriza código
- No renombra variables ni métodos
- No modifica la lógica de ninguna función
- No toca métodos privados
- No reescribe JSDoc que ya existe y está completo
- No traduce comentarios inline existentes (solo agrega nuevos en español)