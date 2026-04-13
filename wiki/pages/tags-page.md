---
source: src/pages/tags_page/MainTagsPage.ts · TagTable.ts · NewTagBtn.ts · NewTagModal.ts · TagActions.ts · TagAlphaFilter.ts · TagFooterActions.ts
last-updated: 2026-04-13
---

# Pages: Tags Page

## Propósito

Gestión completa del Gestor de Tags del CMS. Cubre creación, búsqueda, filtrado alfabético, acciones individuales y acciones masivas (aprobación, desaprobación, eliminación).

---

## API pública / Métodos principales

### `MainTagsPage` (Maestro)

Constructor: `constructor(driver: WebDriver, opts: RetryOptions)`

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `createNewTag(tagData)` | `tagData: TagData` | Abre modal, llena campos y confirma la creación del tag |
| `clickOnTagAction(tagContainer, action)` | `tagContainer: WebElement, action: TagActionType` | Ejecuta acción del dropdown de fila sobre un tag |
| `selectAndExecuteFooterAction(indices, action)` | `indices: number[], action: TagFooterActionType` | Selecciona tags por índice y ejecuta acción masiva de footer |
| `filterTagsByLetter(letter)` | `letter: string` | Activa filtro alfabético (A-Z, Ñ, 123#) |
| `searchTag(text)` | `text: string` | Búsqueda libre en la tabla de tags |
| `getTagContainers(count)` | `count: number` | Retorna array de N WebElements de contenedores de tags desde index 0 |
| `table` (público) | — | `TagTable` accesible directamente |

---

## Tipos / Interfaces exportadas

### `TagActionType` (de `TagActions.ts`)

Valores: `'PREVIEW' | 'DELETE' | 'EDIT' | 'DISAPPROVE' | 'APPROVE'` — verificar contra `TagActions.ACTION_MAP` para valores exactos.

### `TagFooterActionType` (de `TagFooterActions.ts`)

Valores: `'APPROVE' | 'DISAPPROVE' | 'DELETE'` — verificar contra `TagFooterActions.FOOTER_ACTION_MAP` para valores exactos.

---

## Sub-componentes

| Sub-componente | Posee |
|---------------|-------|
| `NewTagBtn` | Botón "Nuevo Tag" que abre el modal |
| `NewTagModal` | Modal de creación: título (requerido), descripción (CKEditor), sinónimos, tipo, estado |
| `TagTable` | Tabla: búsqueda, selección por índice, acceso a contenedores |
| `TagActions` | Menú de 3 puntos por tag: preview, edit, delete, approve, disapprove |
| `TagAlphaFilter` | Filtro A-Z + búsqueda libre |
| `TagFooterActions` | Footer de acciones masivas (propio de Tags — no usa `FooterActions` compartido) |

**Nota:** `MainTagsPage` usa `TagFooterActions` (propio), no el `FooterActions` compartido de `src/pages/FooterActions.ts`.

---

## Notas de uso

```typescript
const page = new MainTagsPage(driver, opts);

// Crear tag básico
await page.createNewTag({ title: 'Gaming' });

// Crear tag con todos los campos
await page.createNewTag({
  title: 'Tecnología',
  description: 'Tags de tecnología',
  synonyms: ['tech', 'IT'],
  tipo: 'tags_gammers',
  estado: 'Aprobados'
});

// Filtrar por letra y obtener contenedores
await page.filterTagsByLetter('T');
const containers = await page.getTagContainers(3);

// Acción individual sobre tag
await page.clickOnTagAction(containers[0], 'APPROVE');

// Selección masiva y acción de footer
await page.selectAndExecuteFooterAction([0, 1, 2], 'APPROVE');
```

**`getTagContainers`** retorna contenedores `div#N-dropMenu`. Estos son los containers que reciben `clickOnTagAction`.

**`NewTagModal`** llena solo los campos presentes en `tagData` — si un campo es `undefined`, se omite la interacción con ese input.

**`synonyms`** — cada sinónimo se confirma con Enter en el chip input.
