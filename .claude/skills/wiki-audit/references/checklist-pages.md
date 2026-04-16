# Checklist: Gaps en pages y código

## Qué auditar

### 1. src/pages/README.md — tabla de directorio

Verificar que cada archivo `.ts` activo en `src/pages/` tenga una entrada en la tabla de directorio de `src/pages/README.md`.

**Método:** listar archivos `.ts` en `src/pages/` (raíz y subdirectorios de maestros) y cruzar con las entradas del README.

**Directorios a revisar:**
- `src/pages/` (raíz) — componentes compartidos
- `src/pages/login_page/`
- `src/pages/post_page/`
- `src/pages/post_page/note_editor_page/`
- `src/pages/post_page/ai_note/`
- `src/pages/videos_page/`
- `src/pages/videos_page/video_editor_page/`
- `src/pages/images_pages/`
- `src/pages/images_pages/images_editor_page/`
- `src/pages/tags_page/`

**Directorios vacíos conocidos (no documentar):**
- `src/pages/comment_page/` — 0 archivos .ts, intencional
- `src/pages/user_profile_page/` — 0 archivos .ts, intencional

**Acción si falta una entrada:** agregar a README con formato:
```
├── NombreArchivo.ts    # Descripción breve — Tipo exportado → wiki/pages/<módulo>.md#sección
```

### 2. wiki/pages/*.md — precisión de contenido vs código

Leer cada página wiki y abrir los archivos `.ts` correspondientes. Verificar frase a frase que la wiki dice lo que el código hace. La wiki es descripción; el código es la verdad.

**Señales de error que buscar:**
- Locator documentado con testid/selector diferente al del `.ts` (ej: wiki dice `app-new-content-dropdown`, código usa `dropdown-menu-new-content`)
- Método usa `retry()` internamente pero la wiki no lo menciona
- Método usa `supressRetry: true` para evitar anidamiento pero la wiki no lo aclara
- Método espera visibilidad de un elemento antes de interactuar (waitVisible, waitClickable) y la wiki omite ese paso
- La wiki atribuye un `data-testid` a una acción pero el código lo usa para otra acción diferente
- La wiki describe un mecanismo antiguo (ej: selección por texto) pero el código usa uno nuevo (ej: mapa por testid como `NOTE_TYPE_TESTID_MAP`)
- Tipo exportado con valores en wiki que no coinciden exactamente con el enum/const en el .ts
- `catch` que intencionalmente no hace rethrow (excepción documentada a la convención) pero la wiki no lo menciona

**Cómo verificar:** leer el método en el `.ts` correspondiente, línea a línea, y comparar con la descripción en wiki/. No alcanza con verificar la estructura — hay que verificar el contenido.

**Prioridad de revisión:**
- `wiki/pages/post-page.md` → `src/pages/post_page/` raíz + `note_editor_page/`
- `wiki/pages/_shared.md` → `src/pages/` raíz (SidebarAndHeader, FooterActions, HeaderNewContentBtn)
- `wiki/pages/modals.md` → `src/core/helpers/handleUpdateModal.ts`
- `wiki/pages/video-image-editors.md` → `src/pages/videos_page/` e `src/pages/images_pages/`
- `wiki/patterns/conventions.md` § tipos → `src/interfaces/data.ts` y `src/pages/`

**Formato de reporte:**
```
[CONTENIDO-INCORRECTO] wiki dice: "..." / código dice: "..." / archivo: path:línea
[GAP-CONTENIDO] wiki no documenta: "..." / archivo: path:línea
```

### 3. wiki/index.md — sección "deuda de cobertura"

Verificar que la lista de "directorios con deuda" en wiki/index.md refleje el estado actual.
- Si un directorio que estaba en deuda ahora tiene documentación completa → sacar de la lista
- Si un directorio nuevo no tiene cobertura wiki → agregar a la lista

### 4. Consistencia tipos exportados

Para cada tipo exportado documentado en wiki/pages/ (ej: NoteType, SidebarOption, FooterActionType), verificar que:
- El tipo existe en el archivo .ts correspondiente
- El nombre coincide exactamente (TypeScript es case-sensitive)
- La descripción de valores posibles en wiki/ coincide con los valores reales en el código

## Validación final
- Cada componente activo en src/pages/ tiene entrada en README
- Cada método en wiki/pages/ refleja el comportamiento real del código
- wiki/index.md § deuda de cobertura está actualizada