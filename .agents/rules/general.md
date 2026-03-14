---
trigger: always_on
---

# AI Agent Rules

## General Behavior
- Always prefer explicit, intention-revealing code over clever shortcuts.
- Never silently swallow errors. Every `catch` must log and re-throw.
- Never use `driver.sleep()` without a comment explaining why no explicit wait works.
- All internal TypeScript imports must use the `.js` extension (ESM requirement).