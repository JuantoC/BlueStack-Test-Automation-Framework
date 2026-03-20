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

All test files live in the `sessions/` directory and must follow the naming pattern `*.test.ts`. Jest discovers them automatically via the `testMatch` glob `**/sessions/**/*.test.ts`.

### Step-by-step

**1. Create a new test file** in `sessions/`:

```bash
sessions/MyNewFeature.test.ts
```

**2. Generate test data** using the faker-js factories in `src/data_test/factories/`. No static fixture files needed — each factory call produces unique dynamic data.

**3. Write the test** using `runSession()` as the entry point and composing the Page Objects you need, for example:

```typescript
// sessions/PublishNewPost.test.ts

runSession(
  "Publish New Post",
  async ({ driver, opts, log }) => {

    description(`
### Test: Publicar nuevo post
---
**Objetivo:** Validar que un post puede crearse, guardarse y publicarse.
**Flujo:** 
1. Login
2. Crear nota
3. Llenar y guardar
4. Reingresar y publicar

> **Resultado esperado:** Post publicado y accesible desde el listado.
    `);

    // 1. Navegar hacia el cms
    const { user, pass } = ENV_CONFIG.getCredentials("editor");
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    // 2. Generar datos de prueba dinamicos con faker-js
    const postData = PostDataFactory.create();

    // 3. Instanciar Page Objects
    const login  = new MainLoginPage(driver, opts);
    const post   = new MainPostPage(driver, 'POST', opts);
    const editor = new MainEditorPage(driver, 'POST', opts);

    // 4. Ejecutar el flujo
    await login.passLoginAndTwoFA({ username: user, password: pass });
    await post.createNewNote();
    await editor.fillFullNote(postData);
    await editor.closeNoteEditor('SAVE_AND_EXIT');
    await post.enterToEditorPage(postData.title);
    await editor.closeNoteEditor('PUBLISH_AND_EXIT');

    log.info("✅ Post creado y publicado exitosamente.");
  },
  // Metadatos para Allure Opcionales
  {
    epic: "Content Management",
    feature: "Post Creation",
    severity: "critical",
  }
);

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { PostDataFactory } from "../src/data_test/factories/index.js";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
```

### Key conventions

- **One workflow per file.** Each test file contains a single `runSession()` call.
- **`runSession()`** wraps the Jest `test()` call, handles driver lifecycle, automatic screenshots on failure, and network error detection.
- **`opts`** carries retry configuration and is passed to every Page Object constructor.
- **Dynamic data only.** Use faker-js factories from `src/data_test/factories/`. No static data objects.
- **Imports go at the bottom** of the file, after the `runSession()` call — this is a project convention.
- **Imports** Always `.js` extension on internal imports
- **Allure metadata** (`epic`, `feature`, `severity`, `tags`, `issueId`) is supplied as the optional third argument to `runSession()`.

---

## Test Data

All test data is generated dynamically via **faker-js** factories located in `src/data_test/factories/`.

| Factory | Usage |
|---|---|
| `PostDataFactory` | Creates data for Post, fills title/body/tags/author |
| `ListicleDataFactory` | Creates data for Listicle, supports `itemCount` override |
| `LiveBlogDataFactory` | Creates data for LiveBlog, supports `entryCount` override |
| `YoutubeVideoDataFactory` | Creates YouTube video data with random URL from pool |
| `NativeVideoDataFactory` | Creates native video data, references files in `src/data_test/videos/` |

For AI-generated posts (`MainAIPage`), use the `AINoteData` interface from `src/interfaces/data.ts` and pass a partial object with the desired prompt fields.

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

1. **One directory per CMS section** under `src/pages/`. Sub-components of the same page live in the same folder.
2. **Constructor signature:** Every Page Object must accept `(driver: WebDriver, opts: RetryOptions)`. Maestros that manage a content type also receive the type as a string literal second argument. Pass `opts` down to all sub-components.
3. **No raw element sleeps.** Use the shared wait utilities in `src/core/actions/` and `src/core/utils/`.
4. **Log with context.** Use the injected `logger` and always pass `{ label: this.config.label }`.
5. **Wrap multi-step operations with `step()` from `allure-js-commons`** in the Main Page Object class only — not in sub-components.
6. **Shared modals** go in `src/pages/modals/` and are invoked by Maestros only, never directly from tests.
7. **`FooterActions`** is a shared sub-component — instantiate it in every Maestro that needs footer-level actions.

### Branching & PR

- Branch from `main` using the pattern `feat/<short-description>` or `fix/<short-description>`.
- Include the corresponding Jira ticket ID in both the branch name and the `issueId` metadata field of `runSession()`.
- All new sessions must pass locally (`npm run test:dev`) before opening a PR.
