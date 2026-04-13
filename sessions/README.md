<!--
@doc-type: readme
@scope: module
@audience: both
@related: wiki/sessions/catalog.md, wiki/core/run-session.md, wiki/patterns/factory-api.md
@last-reviewed: 2026-04-13
@summary: Colección de tests E2E ejecutables del CMS Bluestack — uno por flujo editorial, descubiertos automáticamente por Jest.
-->

# `@sessions/` — Test Sessions

> Colección de tests E2E ejecutables. Cada archivo representa un flujo de usuario completo e independiente sobre el CMS Bluestack. Son la fuente de verdad del comportamiento observable del sistema.

---

## Quick Reference

| Concepto | Regla |
|---|---|
| Punto de entrada | `runSession(label, testLogic, metadata?)` — obligatorio |
| Un archivo = un flujo | Un solo `runSession()` por archivo |
| Imports | Siempre al final del archivo, extensión `.js` |
| Datos de prueba | Solo fábricas faker-js — cero fixtures estáticos |
| Naming de archivo | `PascalCase.test.ts` dentro de su subcarpeta de dominio |
| Descubrimiento | Jest glob `**/sessions/**/*.test.ts` — recursivo por subcarpeta |
| Timeout por test | 20 minutos (`jest.config.cjs`) |
| Paralelismo | Controlado por `MAX_INSTANCES` en `.env` |

---

## Directorio

```
sessions/
├── auth/
│   └── FailedLogin.test.ts              # Auth — login fallido reiterado + exitoso
├── post/
│   ├── NewPost.test.ts                  # Post — creación, guardado y publicación
│   ├── NewListicle.test.ts              # Listicle — creación con BACK_SAVE y publicación
│   ├── NewLiveBlog.test.ts              # LiveBlog — creación y publicación
│   ├── NewAIPost.test.ts                # AI Post — generación asistida por IA + guardado
│   └── MassPublishNotes.test.ts         # Mass Actions — Post + Listicle + Liveblog masivos
├── video/
│   ├── NewEmbeddedVideo.test.ts         # Video — creación de Embedded + edición inline
│   ├── NewYoutubeVideo.test.ts          # Video — subida YouTube + edición inline
│   └── MassPublishVideos.test.ts        # Mass Actions — publicación masiva de videos
├── images/
│   └── MassPublishImages.test.ts        # Mass Actions — subida nativa, edición inline y publicación
├── cross/
│   └── PostAndVideo.test.ts             # Cross-component — Post + YouTube (critical)
├── stress/
│   └── StressMassActions.test.ts        # Stress — notas + videos + AI + publicación masiva
└── debug/
    ├── DebugImageEditorHeader.test.ts   # Debug — header del editor de imágenes
    └── DebugVideoEditorHeader.test.ts   # Debug — header del editor de videos
```

---

## Arquitectura

Los archivos en `sessions/` son el nivel más alto del framework. No contienen lógica de UI — solo orquestación: `runSession()` envuelve `test()` de Jest e inyecta automáticamente driver, logger, metadata de Allure, screenshot en fallo y verificación de errores de red via `NetworkMonitor`.

Firma completa de `runSession`, `TestContext` y `TestMetadata`: [wiki/core/run-session.md](../wiki/core/run-session.md).

---

## Convenciones

| Artefacto | Patrón |
|---|---|
| Archivo de test | `PascalCase.test.ts` dentro de su subcarpeta de dominio |
| Imports | Al final del archivo — extensión `.js` obligatoria |
| Datos de prueba | Instanciar factory antes de instanciar Page Objects |
| `opts` | Pasar a cada constructor de Page Object — habilita reintentos end-to-end |
| Cierre exitoso | `log.info("✅ ...")` como última línea del flujo |

Estructura canónica de un `.test.ts`: [sessions/post/NewPost.test.ts](post/NewPost.test.ts).

Las categorías `debug/` son para diagnóstico rápido — no integran la suite de regresión principal.

---

## 🔗 Referencias

- [wiki/sessions/catalog.md](../wiki/sessions/catalog.md) — inventario de los 14 tests con POs y factories de cada uno
- [wiki/core/run-session.md](../wiki/core/run-session.md) — API completa de `runSession`, `TestContext` y `TestMetadata`
- [wiki/patterns/factory-api.md](../wiki/patterns/factory-api.md) — catálogo de factories faker-js y sus firmas
- [sessions/post/NewPost.test.ts](post/NewPost.test.ts) — estructura canónica de referencia
- [src/pages/README.md](../src/pages/README.md) — especificación autoritativa de la capa Page Object
- [.claude/references/COMMANDS.md](../.claude/references/COMMANDS.md) — comandos de ejecución y filtrado por dominio
- [jest.config.cjs](../jest.config.cjs) — timeout, workers, testMatch y entorno Allure
