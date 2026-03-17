# Bluestack Test Automation Framework

A robust, production-ready UI test automation framework built with **Selenium WebDriver**, **TypeScript**, and **Jest**, designed to interact with the Bluestack CMS. The framework provides full end-to-end coverage for core editorial workflows — including content creation, video management, and publishing — with integrated **Allure** reporting, structured logging, and **Docker**-based **Selenium Grid** support.

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
│   ├── login_page/
│   ├── post_page/
│   ├── videos_page/
│   ├── comment_page/
│   ├── image_page/
│   ├── user_profile_page/
│   └── SidebarAndHeaderSection.ts
└── interfaces/              # Shared TypeScript data interfaces

sessions/                    # Test files (*.test.ts) — one per workflow
src/data_test/               # Static test fixture data (titles, video URLs, etc.)
```

### How it works

Each CMS page is a **Facade Page Object** (e.g., `MainVideoPage`, `MainPostPage`) that internally composes smaller, focused sub-components (`VideoTable`, `UploadVideoModal`, `VideoActions`). This two-layer design keeps each class small and focused:

- **Sub-components** handle a single UI section (e.g., the upload modal).
- **Main Page Objects** orchestrate the full workflow across sub-components.

Test sessions import the Page Objects they need and call high-level methods, keeping the test logic clean and readable.

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

> **Note:** The `.env` file is gitignored. Never commit credentials to the repository.

---

## How to Write a New Test

All test files live in the `sessions/` directory and must follow the naming pattern `*.test.ts`. Jest discovers them automatically via the `testMatch` glob `**/sessions/**/*.test.ts`.

### Step-by-step

**1. Create a new test file** in `sessions/`:

```bash
sessions/MyNewFeature.test.ts
```

**2. (Optional) Add fixture data** in `src/data_test/` following the existing TypeScript interfaces in `src/interfaces/data.ts`.

**3. Write the test** using `runSession()` as the entry point and composing the Page Objects you need, for example:

```typescript
// sessions/PublishNewPost.test.ts

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
import { MainPostPage } from "../src/pages/post_page/MainPostPage.js";
import { MainEditorPage } from "../src/pages/post_page/note_editor_page/MainEditorPage.js";
import { NoteType } from "../src/pages/post_page/NewNoteBtn.js";
import { NoteExitAction } from "../src/pages/post_page/note_editor_page/EditorHeaderActions.js";
import { PostData } from "../src/data_test/noteData.js";
import { description } from "allure-js-commons";

runSession(
  "Publish New Post",
  async ({ driver, opts, log }) => {

    description("Validates that a new Post is saved and published correctly.");

    // 1. Navigate to the CMS
    const { user, pass } = ENV_CONFIG.getCredentials("editor");
    const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);
    await driver.get(authUrl);

    // 2. Instantiate Page Objects, passing driver and opts
    const login  = new MainLoginPage(driver, opts);
    const post   = new MainPostPage(driver, NoteType.POST, opts);
    const editor = new MainEditorPage(driver, NoteType.POST, opts);

    // 3. Execute the workflow using high-level Page Object methods
    await login.passLoginAndTwoFA({ username: user, password: pass });
    await post.createNewNote();
    await editor.fillFullNote(PostData[0]);
    await editor.closeNoteEditor(NoteExitAction.SAVE_AND_EXIT);

    // 4. Assert the result
    await post.enterToEditorPage(PostData[0].title!);
    log.info("✅ Post created and re-entered successfully.");
  },
  {
    epic: "Content Management",
    feature: "Post Creation",
    severity: "critical",
  }
);
```

### Key conventions

- **One workflow per file.** Each test file contains a single `runSession()` call.
- **`runSession()`** wraps the Jest `test()` call, handles driver lifecycle, automatic screenshots on failure, and network error detection.
- **`opts`** carries retry configuration and is passed to every Page Object constructor.
- **Allure metadata** (`epic`, `feature`, `severity`, `tags`, `issueId`) is supplied as the optional third argument to `runSession()`.

---

## Test Execution

To run individual tests, Jest uses a search pattern (regex) within the sessions/ directory. You do not need to provide the full file path or the .ts extension. Valid examples for TestName include: `PublishNewPost`, `EditInline`, or `NativeVideo`.

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

Starts a headed Chrome browser on your local machine. Use this when writing or debugging tests.

```bash
# Clean previous results and run all sessions
npm run test:dev

# Run and automatically open the Allure report when done
npm run test:grid
npm run report:show

```

### Docker Grid Execution (headless, multi-node)

Spins up a Selenium Hub + Chrome node(s) via Docker Compose, then runs tests against the grid.

**Step 1 — Start the infrastructure** (only once per session):

```bash
npm run infra:up
```

This brings up:

- `selenium-hub` on ports `4442–4444`
- `chrome-node` (number of replicas controlled by `MAX_INSTANCES` in `.env`)

**Step 2 — Run tests against the grid:**

```bash
# Run all sessions against the grid
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
# Run 3 parallel Chrome nodes
MAX_INSTANCES=3 npm run test:grid
```

> The Selenium Grid UI is accessible at **<http://localhost:4444>** while the infrastructure is running.

### CI/CD Pipeline Execution (GitHub Actions / headless, full lifecycle)

The `test:ci` script handles the complete lifecycle automatically: clean → start Docker Grid → run tests → stop Docker Grid.

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
| Main Page Object class    | `Main<PageName>Page`     | `MainPostPage`
| Sub-component Page Object | `<Feature><Component>`   | `VideoTable`, `UploadVideoModal`
| Data fixture file         | `camelCase.ts`           | `noteData.ts`, `videoData.ts`
| Allure `epic` / `feature` | Match CMS section name   | `"Content Management"`, `"Videos"`

### Page Object rules

1. **One directory per CMS section** under `src/pages/`. Sub-components of the same page live in the same folder.
2. **Constructor signature:** Every Page Object must accept `(driver: WebDriver, opts: RetryOptions)`. Pass `opts` down to all sub-components so retry and timeout config is consistently propagated.
3. **No raw element sleeps.** Use the shared wait utilities in `src/core/actions/` and `src/core/utils/`. Raw `sleep()` calls are only acceptable as a last resort with a comment explaining why.
4. **Log with context.** Use the injected `logger` and always pass `{ label: this.config.label }` so logs are traceable to their Page Object.
5. **Wrap multi-step operations with `step()` from `allure-js-commons`** to get granular step visibility in the Allure report, this needs to be in the Main Page Object Class only, not in the Sub-componenet Page Object.

### Branching & PR

- Branch from `main` using the pattern `feat/<short-description>` or `fix/<short-description>`.
- Include the corresponding Jira ticket ID in both the branch name and the `issueId` metadata field of `runSession()`.
- All new sessions must pass locally (`npm run test:dev`) before opening a PR.
