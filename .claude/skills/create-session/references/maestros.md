# Maestros — Catálogo de Page Objects disponibles

> Solo importar Maestros (`Main*` y `SidebarAndHeader`) en tests. Nunca sub-components directamente.
> Excepción: en modo debug (M2 de SKILL.md), instanciar sub-component directamente si el Maestro no expone el método públicamente.
> Paths asumen `sessions/<subfolder>/Test.test.ts` (dos niveles arriba = `../../`).

---

## Main Pages

| Maestro | Import path |
|---|---|
| `MainLoginPage` | `../../src/pages/login_page/MainLoginPage.js` |
| `MainPostPage` | `../../src/pages/post_page/MainPostPage.js` |
| `MainEditorPage` | `../../src/pages/post_page/note_editor_page/MainEditorPage.js` |
| `MainVideoPage` | `../../src/pages/videos_page/MainVideoPage.js` |
| `MainImagePage` | `../../src/pages/images_pages/MainImagePage.js` |
| `MainTagsPage` | `../../src/pages/tags_page/MainTagsPage.js` |
| `MainAIPage` | `../../src/pages/post_page/ai_note/MainAIPage.js` |
| `SidebarAndHeader` | `../../src/pages/SidebarAndHeaderSection.js` |

Wiki de cada PO: [`wiki/index.md`](../../../../wiki/index.md) → sección "Pages".

---

## Constructores frecuentes

```typescript
// Sin tipo de nota
new MainLoginPage(driver, opts)
new MainVideoPage(driver, opts)
new MainImagePage(driver, opts)
new MainTagsPage(driver, opts)
new SidebarAndHeader(driver, opts)

// Con tipo de nota (string literal)
new MainPostPage(driver, 'POST', opts)       // o 'LISTICLE' | 'LIVEBLOG'
new MainEditorPage(driver, 'POST', opts)     // mismo NoteType que el de arriba
new MainAIPage(driver, opts)
```

---

## Sub-components por sección

> Solo bajar a sub-components si la wiki no cubre lo que necesitás. Registrar el gap en `wiki/log.md`.

- `login_page/` → `LoginSection.ts`, `TwoFASection.ts`
- `post_page/` → `PostTable.ts`, `NewNoteBtn.ts`
- `post_page/note_editor_page/` → `EditorHeaderActions.ts`, `EditorTextSection.ts`, `EditorTagsSection.ts`, `EditorAuthorSection.ts`, `EditorLateralSettings.ts`, `EditorImagesSection.ts`, `noteList/BaseListicleSection.ts`, `noteList/ListicleItemSection.ts`
- `videos_page/` → `VideoTable.ts`, `UploadVideoBtn.ts`, `UploadVideoModal.ts`, `VideoInlineActions.ts`, `FooterActions.ts`
- `images_pages/` → `ImageActions.ts`, `ImageTable.ts`, `UploadImageBtn.ts`, `images_editor_page/EditorHeaderActions.ts`
- `tags_page/` → `NewTagModal.ts`, `NewTagBtn.ts`, `TagActions.ts`, `TagAlphaFilter.ts`, `TagFooterActions.ts`, `TagTable.ts`
- `modals/` → `CKEditorImageModal.ts`, `PublishModal.ts`
- `post_page/ai_note/` → `AIPostModal.ts`

---

## Tipos de string literal

Para los valores exactos de cada tipo, ver [`wiki/interfaces/data-types.md`](../../../../wiki/interfaces/data-types.md).

| Tipo | Valores conocidos |
|---|---|
| `NoteType` | `'POST'` · `'LISTICLE'` · `'LIVEBLOG'` · `'AI_POST'` |
| `VideoType` | `'YOUTUBE'` · `'NATIVO'` · `'EMBEDDED'` |
| `AuthorType` | `'INTERNAL'` · `'ANONYMOUS'` · `'MANUAL'` |

`NoteExitAction`, `SidebarOption`, `FooterActionType` y demás: verificar en el wiki o en el `.ts` fuente del Maestro correspondiente.
