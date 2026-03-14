---
trigger: model_decision
description: > **Before reading, creating, or modifying any file inside `@src/pages/`
---

## Page Object Layer — `@src/pages/`

You MUST first read `@src/pages/README.md` in full. That document is the authoritative spec for the entire layer. Every rule there overrides your training defaults.**

Do not infer conventions for this layer from general TypeScript or Selenium knowledge. The README defines a strict two-layer architecture (Maestros + sub-components), locator ownership rules, constructor contracts, naming conventions, and anti-patterns. Violating any of them breaks the framework.

If you are not interacting with `src/pages/`, do not read or reference that README.