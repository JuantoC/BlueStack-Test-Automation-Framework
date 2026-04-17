# pom-generator — Formatos Operativos

## Modo Extensión — Gap Analysis

Formato de la tabla de brechas a presentar en el Paso 1E:

| Elemento UI | ¿Tiene locator? | ¿Tiene método? | Acción propuesta |
|---|---|---|---|
| [Nombre del elemento] | Sí / No | Sí / No / Parcial | Agregar locator · Agregar método · Nada |

Reglas de llenado:
- Una fila por elemento UI identificado en el input del usuario.
- "Parcial" en la columna método = el método existe pero no cubre el caso pedido.
- "Acción propuesta" solo puede ser: "Agregar locator", "Agregar método", "Agregar locator + método", o "Nada (ya cubierto)".
- NO incluir filas con Acción = "Nada" si la tabla resultaría muy larga — filtrarlas para mostrar solo gaps reales.

---

## Modo Extensión — Formatos de Output

Para **archivos existentes**, la salida siempre se entrega en bloques de inserción explícitos. Nunca se reescribe el archivo completo.

### Formato de bloque de inserción — locators

```typescript
// ── INSERTAR después de la última declaración de locator existente ──
private static readonly NUEVO_LOCATOR: Locator = By.css('[data-testid="TODO_nuevo_elemento"]');
```

### Formato de bloque de inserción — métodos

```typescript
// ── INSERTAR al final de la clase, antes del último `}` ──
/**
 * Descripción del método nuevo.
 * @param param - descripción del parámetro
 */
async nuevoMetodo(param: string, opts: RetryOptions): Promise<void> {
  try {
    await clickSafe(this.driver, ClaseExistente.NUEVO_LOCATOR, opts);
  } catch (error: unknown) {
    logger.error(`Error en nuevoMetodo: ${getErrorMessage(error)}`, { label: opts.label });
    throw error;
  }
}
```

### Formato de bloque de inserción — map + switch coordinado

Cuando el archivo tiene un map de acciones y un switch coordinado, ambos se insertan en el mismo bloque:

```typescript
// ── INSERTAR en ACTIONS map: nuevo entry ──
NUEVA_ACCION: ClaseExistente.NUEVO_LOCATOR,

// ── INSERTAR en switch(action): nuevo case ──
case 'NUEVA_ACCION':
  // comportamiento post-click según lo especificado por el usuario
  break;
```

---

## Placeholder format — locators pendientes

Cuando un locator no puede determinarse del input del usuario (descripción textual o imagen sin DOM), usar este formato exacto:

```typescript
private static readonly ELEMENT_NAME: Locator = By.css('[data-testid="TODO_element_name"]');
```

Reglas:
- Prefijo `TODO_` seguido del nombre semántico del elemento en `snake_case`.
- Nunca inventar un selector que parezca real — siempre el formato TODO.
- El nombre describe el elemento semánticamente (ej: `TODO_save_button`, `TODO_title_input`).
- Este formato aplica tanto en Modo Creación (Paso 2) como en Modo Extensión (Paso 3E).

El patrón `TODO_placeholder_name` debe buscarse en el SKILL.md y en este archivo si se quiere cambiar — modificar en ambos lugares.