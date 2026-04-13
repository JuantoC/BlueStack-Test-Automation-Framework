<!--
@doc-type: readme
@scope: module
@audience: both
@related: ../../wiki/patterns/factory-api.md, ../../wiki/interfaces/data-types.md
@last-reviewed: 2026-04-13
@summary: Datos de prueba del framework — factories dinámicas, imágenes y videos de muestra para tests E2E.
-->

# `src/data_test/` — Test Data

> Fixtures y archivos estáticos del framework. Contiene las factories que generan datos tipados en español y los archivos locales (imágenes y videos) usados en tests de subida de contenido.

---

## Directorio

```
src/data_test/
├── factories/
│   ├── index.ts                  # Punto de entrada unificado — importar siempre desde acá
│   ├── NoteDataFactory.ts        # PostDataFactory · ListicleDataFactory · LiveBlogDataFactory
│   ├── VideoDataFactory.ts       # YoutubeVideoDataFactory · NativeVideoDataFactory · EmbeddedVideoDataFactory · NATIVE_VIDEO_PATHS
│   ├── AINoteDataFactory.ts      # AINoteDataFactory · ThematicGroup
│   └── ImageDataFactory.ts       # ImageDataFactory · IMAGE_PATHS
├── images/                       # 4 archivos de prueba (JPG, WEBP, PNG) para tests de subida
└── videos/                       # 1 archivo MP4 para tests de video nativo
```

---

## Arquitectura

`factories/` produce objetos tipados compatibles con las interfaces de `src/interfaces/data.ts`. Cada factory usa faker-js con pools temáticos en castellano y agrega un sufijo numérico derivado de `Date.now()` para garantizar unicidad entre ejecuciones paralelas.

`images/` y `videos/` son archivos estáticos referenciados por las constantes `IMAGE_PATHS` y `NATIVE_VIDEO_PATHS`. Los POs los reciben como rutas relativas desde la raíz del proyecto y las resuelven con `path.resolve()` internamente.

---

## Convenciones

| Artefacto | Patrón |
|---|---|
| Import en tests | Siempre desde `factories/index.js` — nunca importar directo de un archivo individual |
| Rutas de archivos estáticos | Relativas a la raíz del proyecto; el PO destino aplica `path.resolve()` |
| Unicidad de datos | Sufijo `- NNNNNN` en títulos (ej. `"Tutorial: cloud computing - 482031"`) |
| Estado de factories | Sin estado — cada `create()` es independiente; no hay reset entre tests |

---

## 🔗 Referencias

- [wiki/patterns/factory-api.md](../../wiki/patterns/factory-api.md) — API completa: métodos, firmas, pools internos y ejemplos de uso
- [wiki/interfaces/data-types.md](../../wiki/interfaces/data-types.md) — Interfaces tipadas que retornan las factories
- [sessions/video/NewYoutubeVideo.test.ts](../../sessions/video/NewYoutubeVideo.test.ts) — Ejemplo canónico de uso de factory en test E2E
