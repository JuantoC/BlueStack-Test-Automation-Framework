---
source: README.md · src/pages/README.md · src/core/README.md
last-updated: 2026-04-14
---

# Overview — BlueStack Test Automation Framework

## Propósito

Framework de automatización de pruebas UI end-to-end para el CMS interno de Bluestack.
Cubre flujos editoriales críticos: creación de contenido, gestión de video, generación de posts asistida por IA y publicación.

## Stack

| Tecnología | Versión | Rol |
|------------|---------|-----|
| TypeScript | 5.x | Lenguaje principal |
| Selenium WebDriver | 4.38 | Driver de automatización |
| Jest | 29.7 | Test runner |
| ts-jest | 29.1 | Transpilación Jest + ESM |
| Allure (allure-jest + allure-js-commons) | 3.x | Reportes |
| faker-js | 10.3 | Generación de datos de prueba |
| Winston | 3.x | Logging estructurado |
| tsx | 4.x | Ejecución TypeScript directa |
| ts-morph | 27.x | Manipulación AST (scripts internos) |

**Módulos:** ESM (`"type": "module"`) — todos los imports internos TypeScript usan extensión `.js` (nunca `.ts`).

## Estructura de Carpetas

```
src/
├── core/           # Motor del framework (retry, actions, config, errors, utils)
│   ├── actions/    # Acciones atómicas: clickSafe, writeSafe, waitFind, waitVisible, waitEnabled, assertValueEquals
│   ├── config/     # Configuración: driver, env, defaults, monitors
│   ├── errors/     # Clasificación y tipos de error
│   ├── helpers/    # Primitivas DOM de bajo nivel
│   ├── utils/      # Logger, routes, URL builders, backoff
│   └── wrappers/   # runSession (testWrapper) y retry
├── pages/          # Page Objects (POM con Facade Pattern)
│   ├── login_page/
│   ├── post_page/
│   ├── videos_page/
│   ├── images_pages/   # ⚠️ plural con "s" — images_pages, no image_page
│   ├── tags_page/
│   └── modals/
├── interfaces/     # Contratos de datos: data.ts, config.ts
└── data_test/
    ├── factories/  # NoteDataFactory, VideoDataFactory, AINoteDataFactory, ImageDataFactory
    ├── images/     # Imágenes de prueba
    └── videos/     # Videos de prueba

sessions/           # Tests .test.ts organizados por categoría
├── auth/
├── post/
├── video/
├── images/
├── cross/
├── stress/
└── debug/
```

## Comandos de Ejecución

Referencia completa de todos los modos, multi-entorno, forma directa y agente: [`.claude/references/COMMANDS.md`](../.claude/references/COMMANDS.md)

`NODE_OPTIONS='--experimental-vm-modules'` es siempre obligatorio (WSL2 + ESM).

## Arquitectura — Page Object Model con Facade Pattern

### Dos capas:

**Maestros (`Main*Page`):**
- Componen sub-componentes en el constructor.
- Exponen workflows de alto nivel al test.
- Sus métodos públicos están envueltos en `step()` de allure-js-commons.
- No tienen locators propios — los delegan a sub-componentes.

**Sub-componentes:**
- Poseen una región de UI específica.
- Declaran sus locators como `private static readonly`.
- Nunca llaman a hermanos ni al Maestro.
- Nunca usan `step()`.

### Cadena de Orquestación

```
Test (.test.ts)
  └─> runSession()
        └─> MainPage (Maestro)
              └─> SubComponent
                    └─> clickSafe / writeSafe / waitFind
                          └─> retry() con exponential backoff
```

## Convenciones de Naming

| Artefacto | Convención | Ejemplo |
|-----------|-----------|---------|
| Maestros | `Main<Módulo>Page` | `MainPostPage` |
| Sub-componentes | `<Concepto><Tipo>` | `EditorHeaderActions`, `PostTable` |
| Locators | `private static readonly NOMBRE_ELEMENTO` | `SUBMIT_BTN` |
| Tipos derivados de maps | `keyof typeof Clase.MAP` | `NoteType`, `VideoType` |
| Factories | `<Entidad>DataFactory` | `NoteDataFactory` |

## Variables de Entorno

### Infraestructura (compartidas, sin prefijo de entorno)

| Variable | Descripción |
|----------|-------------|
| `TARGET_ENV` | Entorno activo: `testing` \| `master` \| `cliente` (default: `testing`) |
| `USE_GRID` | `true` para Docker Selenium Grid |
| `IS_HEADLESS` | `false` para ver el navegador (default: `true`) |
| `GRID_URL` | URL del Grid (default: `http://localhost:4444`) |
| `MAX_INSTANCES` | Workers paralelos (default: 1) |
| `TEST_ROLE` | Override de rol para agentes: `admin` \| `editor` \| `basic` (opcional) |

### Credenciales por entorno (prefijo `{ENV}_`)

Cada entorno requiere su propio bloque. Solo el entorno activo (`TARGET_ENV`) se carga en memoria.

| Variable | Descripción |
|----------|-------------|
| `{ENV}_BASE_URL` | URL base del CMS (obligatoria — lanza error si falta) |
| `{ENV}_BASIC_USER` / `{ENV}_BASIC_PASS` | HTTP Basic Auth |
| `{ENV}_ADMIN_USER` / `{ENV}_ADMIN_PASS` | Rol administrador |
| `{ENV}_EDITOR_USER` / `{ENV}_EDITOR_PASS` | Rol editor |

**Ejemplos:** `TESTING_BASE_URL`, `MASTER_BASIC_USER`, `CLIENTE_ADMIN_PASS`

> **Bridge de migración:** `TESTING_URL` (sin prefijo) sigue siendo aceptado como fallback mientras se actualizan secrets de CI.
