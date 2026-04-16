# Wiki Audit Report — Baseline (sin skill)

**Fecha:** 2026-04-16 | Metodología: scan lineal directo

## HALLAZGOS CRÍTICOS (3)

### C1 — conventions.md: fuente de NoteType incorrecta
Wiki: "fuente canónica: NewNoteBtn.ts". Código: `import type { NoteType } from "../../interfaces/data.js"`. La fuente real es `src/interfaces/data.ts`.

### C2 — video-image-editors.md: EXIT_WITHOUT_SAVING contradice el código
Wiki: "sin opción Salir sin guardar en imágenes". Código: EXIT_WITHOUT_SAVING_OPT existe en LOCATORS y en el switch.

### C3 — _shared.md: FooterActions tabla — testids mal atribuidos
Wiki: mapea acciones directamente a testids de items individuales. Código: el mapa apunta al dropdown toggle button; los items se resuelven internamente en el switch.

## HALLAZGOS MEDIOS (4)

### M1 — HeaderNewContentBtn usa step() — viola convención sub-componente
Código: `await step('Crear nuevo contenido: ${type}', ...)` en sub-componente. Wiki: no lo documenta. Convención: sub-componentes NO usan step().

### M2 — PostTable: tipos ViewFilterType (19 keys), ViewModeType (2 keys) sin documentar en wiki
### M3 — PostTable: ~15 métodos públicos sin cobertura en wiki/pages/post-page.md
### M4 — actions.md: supressRetry:true no explicitado en diagrama de clickSafe

## GAPS

### G1 — NOTE_TYPE_TESTID_MAP: migración no documentada
NewNoteBtn usa NOTE_TYPE_TESTID_MAP (por data-testid) en lugar del NOTE_TYPE_MAP (por texto multilingüe). Wiki aún describe el mecanismo antiguo.

### G2 — PostTable.ROW_ACTION_MAP: wiki remite al código en lugar de listar los 12 keys

## Bugs de código detectados durante la auditoría

### BUG-1 — assertValueEquals.ts: imports duplicados al final del archivo (líneas 132-138)
### BUG-2 — HeaderNewContentBtn: sub-componente usa step() — viola convención documentada