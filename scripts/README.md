<!--
@doc-type: readme
@scope: config
@audience: both
@related: [.claude/hooks/, .claude/references/COMMANDS.md]
@last-reviewed: 2026-04-16
@summary: Scripts de soporte del framework: herramientas de validación, sincronización y helpers de skills, más las fuentes de los Git hooks.
-->

# `scripts/` — Scripts de soporte del framework

> Utilidades standalone que corren fuera del runtime de tests. Incluye herramientas de validación/sincronización, helpers consumidos por skills, y las fuentes versionables de los Git hooks del proyecto.

---

## Directorio

```
scripts/
├── validate-ssot.ts            # Valida coherencia SSoT: lógica en .md, JSDoc desincronizado, skills con .md como input primario
├── sync-test-map.ts            # Detecta drift entre sessions/ en disco y test-map.json
├── cleanup-pending-docs.ts     # Archiva entradas 'reviewed' antiguas de pending-doc-updates.json
├── setup-hooks.sh              # Instala los Git hooks en .git/hooks/ (correr una vez por colaborador)
├── hooks/
│   ├── pre-commit              # Git hook: detecta archivos modificados y acumula deuda documental
│   └── post-commit             # Git hook: asigna hash real al commit y notifica para sync-docs
└── skills/
    ├── commit-parser.ts        # Parsea git log y traduce commits a bullets orientados a negocio (para commit-report)
    ├── jsdoc-scanner.ts        # Escanea archivos .ts y reporta gaps de JSDoc en funciones, métodos y clases
    └── pending-docs-reader.ts  # Lee pending-doc-updates.json y reporta commits pendientes de revisión documental
```

---

## Arquitectura

La carpeta agrupa tres familias de artefactos con propósitos distintos:

**Herramientas de validación y sincronización** (`validate-ssot.ts`, `sync-test-map.ts`, `cleanup-pending-docs.ts`): se ejecutan directamente con `tsx` o desde skills/pipelines de Claude. No forman parte del runtime de tests.

**Git hooks** (`hooks/`): son las fuentes versionables de los hooks que viven en `.git/hooks/`. El directorio `scripts/hooks/` es el único lugar donde se mantiene y modifica el código de los hooks; `setup-hooks.sh` los instala en `.git/`. Son ejecutados por `git commit`, no por Claude ni por Node.

**Helpers de skills** (`skills/`): scripts consumidos internamente por skills de Claude (commit-report, sanitize-docs, sync-docs). No están pensados para ejecución directa por humanos. Output siempre a stdout como JSON.

---

## Diferencia entre `scripts/hooks/` y `.claude/hooks/`

| Carpeta | Sistema | Quién lo ejecuta |
|---|---|---|
| `scripts/hooks/` | Git hooks (pre/post-commit) | `git commit` |
| `.claude/hooks/` | Claude Code hooks (Stop hook) | El harness de Claude Code |

Son dos sistemas independientes. No unificarlos.

---

## 🔗 Referencias

- [.claude/references/COMMANDS.md](.claude/references/COMMANDS.md) — comandos de ejecución para cada script
- [.claude/hooks/](.claude/hooks/) — Claude Code Stop hook (sistema separado)
- [.claude/pipelines/test-engine/references/test-map.json](.claude/pipelines/test-engine/references/test-map.json) — archivo que sincroniza `sync-test-map.ts`
- [.claude/pending-doc-updates.json](.claude/pending-doc-updates.json) — archivo que opera `cleanup-pending-docs.ts`
