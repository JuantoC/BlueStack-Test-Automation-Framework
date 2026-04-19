---
name: sanitize-docs
model: sonnet
effort: low
description: Reviews and documents public functions and classes from TypeScript files in the Bluestack project with full JSDoc and inline comments. Use when the user says "document this file", "sanitize folder X", "add JSDoc", "review the comments of", "document the project", or any variation of wanting to improve code documentation. Always activate when the user mentions wanting to work/sanitize a specific folder such as @src/core, @src/pages, @src/tests, or any subfolder of the project.
---

# Sanitize Docs Skill

Adds and completes JSDoc documentation on public functions and classes in TypeScript files of the Bluestack project. The goal is not only to document for humans — comments must be rich enough for an AI agent to understand the purpose, contract, and behavior of each piece **without needing to read the function body**.

---

## What to document

### ✅ Always document

- **Public** functions and methods (exported or without a `private` modifier)
- **Full classes** (JSDoc at class level + their public methods)

### ❌ Do not document

- Private methods (`private`)
- Internal / non-exported helper functions inside a method
- Trivial getters/setters
- Simple constructors that only assign properties (unless they contain relevant logic)

---

## Golden rule: respect what already exists

**If a function or class already has JSDoc → do not touch it.**
Only intervene when:

- It has no JSDoc comment at all
- It has an incomplete JSDoc comment (missing required fields — see next section)

If the existing JSDoc is complete, even if brief, leave it as is.

---

## Required JSDoc structure

All generated JSDoc must include these fields in this order:

```typescript
/**
 * [Description: what it does, why it exists, what its design intent is.
 *  Oriented so that an AI agent understands the role of this piece in the system
 *  without needing to read its implementation.]
 *
 * @param paramName - [Type implicit from TypeScript] Semantic meaning of the parameter.
 * @param otherParam - Same.
 * @returns {ReturnType} What the returned value represents and when it is relevant.
 */
```

### Rules for each field

**Description (first line/paragraph):**

- Explain the *intent*, not repeat the signature
- Mention the design pattern if applicable (e.g.: "Orchestrator", "Facade", "Strategy")
- If it delegates to other methods, mention them: "Delegates to `clickSafe` to gain focus"
- If it is part of a larger flow, indicate it: "Used by `MainPostPage` to..."

**`@param`:**

- One per parameter, in the same order as the signature
- The type is already in TypeScript, do not repeat it in the JSDoc unless it adds context
- Describe the *semantic meaning*, not the type: not "string with the text" but "String to enter in the field, unsanitized"
- For `opts: RetryOptions` always write: "Retry and traceability options. Propagated to all internal sub-calls."

**`@returns`:**

- Always present if the function is not `Promise<void>`
- Describe what the value represents, not just the type
- Example: `@returns {Promise<WebElement>} The target element after confirming the write.`

---

## Inline comments on complex steps

Inside the body, add inline comments **only when the code block does not explain itself**. Follow the project pattern:

```typescript
// 1. Preparation: Prior click to gain focus and ensure visibility.
const element = await clickSafe(driver, ID, internalOpts);

// 2. Identification: We determine the nature of the input.
const isEditable = await isContentEditable(element);

// 3. Execution: Atomic write action.
if (isEditable) { ... }
```

**When to add inline:**

- Blocks with non-obvious logic (type detection, conditional strategies, retries)
- Sequential steps with numbers (`// 1.`, `// 2.`) when there are 3+ chained steps
- Any workaround or non-evident design decision

**When NOT to add inline:**

- Simple assignment lines or direct calls
- Already commented blocks
- Self-explanatory code through variable/method names

---

## Class JSDoc

For classes, the JSDoc goes at the declaration level and includes:

```typescript
/**
 * [Description of the class's role in the system. What CMS section it represents,
 *  what pattern it applies (Facade, Page Object, Orchestrator), what sub-components it coordinates, and what are the main methods to use.]
 *
 * @example
 * const page = new MainPostPage(driver, opts);
 * await page.createNewNote('POST');
 */
export class MainPostPage { ... }
```

The `@example` is optional but highly recommended for Page Objects and frequently used classes, as it gives the agent a direct instantiation pattern.

---

## Language

**Always in Spanish.** No exceptions, even if the existing code has comments in English. New or completed comments go in Spanish.

---

## Operation mode per folder

When the user indicates a folder (e.g.: `src/core/actions/`):

**Paso 0 — Inventario automático de gaps JSDoc**

Ejecutar `jsdoc-scanner.ts` sobre el path indicado **antes de leer ningún archivo**:

```bash
./node_modules/.bin/tsx scripts/skills/jsdoc-scanner.ts --path <ruta-indicada>
```

- Si retorna `[]`: informar al usuario que el módulo ya tiene JSDoc completo y detener.
- Si retorna gaps: usar el JSON como lista de trabajo. Los pasos de identificación manual de exports y verificación de JSDoc **quedan reemplazados** por este output.

1. **Announce** the file being processed using the files present in el JSON del scanner
2. **Show the changes** as a diff or before/after block for each entity listed in the scanner output
3. **Wait for confirmation** from the user before moving to the next file
4. **Repeat** for each file con gaps en el output del scanner

If the user says "continue" or "apply all" without reviewing, process the rest without interruptions.

---

## Review process per file

For each `.ts` file:

1. Usar el JSON del scanner (Paso 0) para conocer qué entidades tienen gaps — **no releer el archivo para identificarlas**
2. Leer el archivo `.ts` completo solo para escribir el JSDoc (es necesario ver el cuerpo de los métodos)
3. Escribir/completar los gaps según el output del scanner:
   - `hasJsDoc: false` → generar JSDoc completo desde cero
   - `hasJsDoc: true` con `missingParams` o `missingDescription` → completar solo los campos faltantes listados
   - `missingReturns: true` → agregar `@returns` faltante
4. Identify if the body has complex steps without inline comments → add if applicable
5. Present the changes grouped by file

---

## Completeness criteria for existing JSDoc

An existing JSDoc is considered **incomplete** if it is missing any of these:

- Description (first line)
- At least one `@param` for each parameter in the signature (except `this`)
- `@returns` when the return is not `void` or `Promise<void>`

If only `@returns` is missing in a `void` function, it is considered complete.

---

## Transformation example

**Before (no JSDoc):**

```typescript
export async function clickSafe(
  driver: WebDriver,
  ID: Locator | WebElement,
  opts: RetryOptions = {}
): Promise<WebElement> {
  // ...body...
}
```

**After:**

```typescript
/**
 * Executes a safe click on an element, guaranteeing prior visibility and focus.
 * Orchestrates scroll, visibility wait, and automatic retry on transient failures.
 * Recommended entry point for any interaction requiring a click in the framework.
 *
 * @param driver - Active WebDriver instance for the current session.
 * @param ID - Locator or WebElement of the target element.
 * @param opts - Retry and traceability options. Propagated to all internal sub-calls.
 * @returns {Promise<WebElement>} The target element after confirming the successful click.
 */
export async function clickSafe(
  driver: WebDriver,
  ID: Locator | WebElement,
  opts: RetryOptions = {}
): Promise<WebElement> {
  // ...body...
}
```

---

## What this skill does NOT do

- Does not refactor code
- Does not rename variables or methods
- Does not modify the logic of any function
- Does not touch private methods
- Does not rewrite JSDoc that already exists and is complete
- Does not translate existing inline comments (only adds new ones in Spanish)
