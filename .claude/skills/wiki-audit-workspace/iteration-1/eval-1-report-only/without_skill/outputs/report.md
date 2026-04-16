# Reporte de problemas de la wiki — Baseline (sin skill)

**Nota:** No se realizó ningún cambio al repositorio. Reporte de solo lectura.

## Problemas detectados

### P1 — Locator de HeaderNewContentBtn incorrecto (Media)
Wiki: `app-new-content-dropdown`. Código: `By.css('[data-testid="dropdown-menu-new-content"]')`.

### P2 — HeaderNewContentBtn.selectNewContent usa step() sin documentar (Media)
Viola convención de sub-componentes documentada en conventions.md.

### P3 — Fuente canónica de NoteType contradictoria entre páginas (Baja)
post-page.md y conventions.md apuntan a orígenes distintos.

### P4 — clickSafe descrito como manejador de "toast" — maneja modal de actualización (Baja)

### P5 — video-image-editors.md: contradicción sobre EXIT_WITHOUT_SAVING en imágenes (Media)

### P6 — actions.md: supressRetry:true atribuido incorrectamente al retry() externo (Baja)

### P7 — modals.md: handleUpdateModal con 4 selectores — código solo usa 2 (Media)

## Gaps detectados

### G1 — NOTE_TYPE_TESTID_MAP: migración no documentada en ninguna página wiki
### G2 — PostTable.ROW_ACTION_MAP remite al código en lugar de listar valores

## Tabla resumen

| ID | Severidad | Descripción |
|----|-----------|-------------|
| P1 | Media | Locator dropdown HeaderNewContentBtn incorrecto |
| P2 | Media | selectNewContent usa step() no documentado |
| P3 | Baja | Fuente NoteType contradictoria |
| P4 | Baja | clickSafe descrito como manejador de toast |
| P5 | Media | EXIT_WITHOUT_SAVING contradice código |
| P6 | Baja | supressRetry:true atribuido incorrectamente |
| P7 | Media | handleUpdateModal con 2 selectores fantasma |
| G1 | Gap | NOTE_TYPE_TESTID_MAP sin cobertura |
| G2 | Gap | ROW_ACTION_MAP no listado |