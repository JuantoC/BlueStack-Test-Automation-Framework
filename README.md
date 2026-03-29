<!--
@doc-type: readme
@scope: project
@audience: both
@related: src/pages/README.md
@last-reviewed: 2026-03-29
@summary: Guía completa del framework de automatización BlueStack: setup, ejecución de tests, convenciones de código, estructura de Page Objects y pipeline CI/CD.
-->

# Bluestack Test Automation Framework

A robust, production-ready UI test automation framework built with **Selenium WebDriver**, **TypeScript**, and **Jest**, designed to interact with the Bluestack CMS. The framework provides full end-to-end coverage for core editorial workflows — including content creation, video management, AI-assisted post generation, and publishing — with integrated **Allure** reporting, structured logging, and **Docker**-based **Selenium Grid** support.

---

## Architecture & Design Pattern

This framework is built on the **Page Object Model (POM)** pattern. Every section of the CMS UI is represented by a dedicated TypeScript class that encapsulates the element locators and interactions for that specific page or component.

```bash
src/
├── core/                    # Framework engine
│   ├── config/              # Driver setup, env variables, Chrome options
│   ├── actions/             # Low-level Selenium interactions (click, type, wait)
│   ├── helpers/             # Shared utility helpers
│   ├── utils/               # Logger, retry backoff, URL builders
│   └── wrappers/            # runSession() test wrapper & retry logic
├── pages/                   # Page Object layer (one folder per CMS section)
│   ├── SidebarAndHeaderSection.ts
│   ├── FooterActions.ts     # Shared footer actions across all pages
│   ├── login_page/
│   ├── post_page/
│   ├── videos_page/
│   ├── modals/              # Shared modal components (CKEditor, Publish)
│   ├── comment_page/
│   ├── image_page/
│   └── user_profile_page/
├── interfaces/              # Shared TypeScript interfaces
│   ├── data.ts              # NoteData, VideoData, AINoteData, etc.
│   └── auth.ts              # Auth-related interfaces
└── data_test/               # Test data
    ├── factories/           # faker-js factories (PostDataFactory, etc.)
    └── videos/              # Static .mp4 files for native video tests

sessions/                    # Test files (*.test.ts) — one per workflow
```

### How it works

Each CMS page is a **Facade Page Object** (e.g., `MainVideoPage`, `MainPostPage`, `MainAIPage`) that internally composes smaller, focused sub-components (`VideoTable`, `UploadVideoModal`, `VideoActions`). This two-layer design keeps each class small and focused:

- **Sub-components** handle a single UI section (e.g., the upload modal, the publish modal).
- **Main Page Objects** orchestrate the full workflow across sub-components.
- **Shared components** like `FooterActions` and the classes in `modals/` are reused across multiple Maestros.

Test sessions import the Page Objects they need and call high-level methods, keeping the test logic clean and readable. All typed parameters are now plain string literals.

---

## Prerequisites

| Tool                                                              | Version                 | Notes
|-------------------------------------------------------------------|-------------------------|------
| [Node.js](https://nodejs.org)                                     | `>= 18.x`               | Required to run the framework |
| [npm](https://npmjs.com)                                          | `>= 9.x`                | Bundled with Node.js |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest                  | Required for Grid execution and CI |
| Google Chrome                                                     | Latest stable           | Required for local execution |
| `chromedriver`                                                    | Matching Chrome version | Managed automatically by `selenium-webdriver` |

---

## Installation & Setup

**1. Clone the repository**

```bash
git clone <repository-url>
cd BlueStack-Test-Automation-Framework
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Copy the example and fill in the values for your target environment:

```bash
cp .env.example .env
```

Edit `.env` with the appropriate values:

```dotenv
# Infrastructure
GRID_URL=http://localhost:4444
IS_HEADLESS=true
USE_GRID=true
MAX_INSTANCES=3 # number of parallel tests

# Target CMS URL
TESTING_URL=https://your-cms-environment.com

# HTTP Basic Auth (if the environment is gated)
BASIC_AUTH_USER=your_basic_user
BASIC_AUTH_PASS=your_basic_pass

# CMS User Roles
ADMIN_USER=admin_username
ADMIN_PASS=admin_password

EDITOR_USER=editor_username
EDITOR_PASS=editor_password
```

---

## How to Write a New Test

All test files live in the `sessions/` directory and follow the naming pattern `PascalCase.test.ts`. Jest discovers them automatically via the `testMatch` glob `**/sessions/**/*.test.ts`.

For the full specification — `runSession()` API, `TestContext`, `TestMetadata`, canonical file structure, factory API, Allure conventions, and a complete worked example — see **[sessions/README.md](sessions/README.md)**.

---

## Test Execution

To run individual tests, Jest uses a search pattern (regex) within the `sessions/` directory. You do not need to provide the full file path or the `.ts` extension.

```bash
# Run a specific test in development mode (local debug)
npm run test:dev -- TestName

# Run a specific test against the grid
npm run test:grid -- TestName

# Run in CI (full lifecycle)
npm run test:ci -- TestName
```

- `test:dev` → Local execution with a visible browser; intended for development and debugging.
- `test:grid` → Headless execution against a Docker Selenium Grid.
- `test:ci` → Full lifecycle execution: clean → infra:up → exec → infra:down.

### Local Execution (visible browser, for development & debugging)

```bash
# Clean previous results and run all sessions
npm run test:dev

# Run and automatically open the Allure report when done
npm run test:grid
npm run report:show
```

### Docker Grid Execution (headless, multi-node)

**Step 1 — Start the infrastructure** (only once per session):

```bash
npm run infra:up
```

This brings up:

- `selenium-hub` on ports `4442–4444`
- `chrome-node` (number of replicas controlled by `MAX_INSTANCES` in `.env`)

**Step 2 — Run tests against the grid:**

```bash
npm run test:grid

# Run and open the Allure report when done
npm run test:grid:show
```

**Tear down the grid when finished:**

```bash
npm run infra:down
```

**Scale Chrome nodes on the fly:**

```bash
MAX_INSTANCES=3 npm run test:grid
```

> The Selenium Grid UI is accessible at **<http://localhost:4444>** while the infrastructure is running.

### CI/CD Pipeline Execution (GitHub Actions / headless, full lifecycle)

```bash
npm run test:ci
```

This expands to:

```bash
npm run clean:safe && npm run infra:up && npm run exec:grid -- --ci --runInBand --colors --forceExit && npm run infra:down
```

- `--ci` — Disables interactive watch mode.
- `--runInBand` — Runs tests serially in a single process (recommended for CI stability).
- `--forceExit` — Ensures Jest exits cleanly even if async handles are left open.

**Example GitHub Actions step:**

```yaml
- name: Run E2E Tests
  env:
    TESTING_URL: ${{ secrets.TESTING_URL }}
    EDITOR_USER: ${{ secrets.EDITOR_USER }}
    EDITOR_PASS: ${{ secrets.EDITOR_PASS }}
    BASIC_AUTH_USER: ${{ secrets.BASIC_AUTH_USER }}
    BASIC_AUTH_PASS: ${{ secrets.BASIC_AUTH_PASS }}
    MAX_INSTANCES: 2
  run: npm run test:ci
```

### Reports

```bash
# Generate the Allure HTML report from the last run's results
npm run report:gen

# Open the generated report in the browser
npm run report:open

# Generate + open in one command
npm run report:show

# Delete all raw results and generated reports
npm run clean
```

---

## Contributing & Guidelines

### Naming Conventions

| Artifact                  | Convention               | Example
|---------------------------|--------------------------|---
| Session test file         | `PascalCase.test.ts`     | `PublishNewPost.test.ts`
| Main Page Object class    | `Main<PageName>Page`     | `MainPostPage`, `MainAIPage`
| Sub-component Page Object | `<Feature><Component>`   | `VideoTable`, `UploadVideoModal`
| Shared modal component    | `<Modal>Modal.ts`        | `PublishModal.ts`, `CKEditorImageModal.ts`
| Factory file              | `<Type>DataFactory`      | `PostDataFactory`, `NativeVideoDataFactory`
| Type key/value            | `SCREAMING_SNAKE_CASE`   | `'SAVE_AND_EXIT'`,
| Folder name               | `snake_case`             | `data_test`, `video_page`

### Page Object rules

For the full specification of the Page Object layer — constructor contracts, method contracts, naming conventions, locator ownership, types, and shared utilities — see [src/pages/README.md](src/pages/README.md).

### Branching & PR

- Branch from `main` using the pattern `feat/<short-description>` or `fix/<short-description>`.
- Include the corresponding Jira ticket ID in both the branch name and the `issueId` metadata field of `runSession()`.
- All new sessions must pass locally (`npm run test:dev`) before opening a PR.

---

## 🤖 Skills disponibles

Skills automatizadas invocables en Claude Code para tareas recurrentes del proyecto:

| Skill | Invocación | Descripción |
|---|---|---|
| `generate-readme` | `"Usando la skill generate-readme, documenta la carpeta X"` | Genera o actualiza un `README.md` para cualquier carpeta del proyecto siguiendo las convenciones de este repo |
| `create-session` | `"Crea un nuevo test para el flujo X"` | Genera un archivo `.test.ts` en `/sessions` para un nuevo caso de prueba |
| `sanitize-docs` | `"Sanitizá el archivo X"` | Revisa y completa JSDoc/TSDoc en archivos TypeScript |
| `sync-docs` | `"Revisá la documentación pendiente"` | Sincroniza docs con el código tras commits recientes |
| `audit-docs` | `"Auditá la documentación"` | Detecta inconsistencias entre código, JSDoc y archivos `.md` |
| `validate-ssot` | `"Validá el SSoT"` | Verifica que ningún `.md` contenga lógica que debería estar en código |
| `week-report` | `"Generá el reporte semanal"` | Genera el correo de reporte de avance QA para el PM |

---

## 🔗 Documentación relacionada

- [sessions/README.md](sessions/README.md) — catálogo de tests, API de `runSession`, factories de datos y convenciones de escritura de sesiones
- [src/pages/README.md](src/pages/README.md) — especificación autoritativa de la capa Page Object: arquitectura, contratos, naming y tipos
- [src/core/README.md](src/core/README.md) — motor del framework: acciones, retry, configuración del driver, errores, utilidades y wrapper del ciclo de vida del test