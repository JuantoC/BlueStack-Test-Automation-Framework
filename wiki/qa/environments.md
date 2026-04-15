# Ambientes de Testing — Mapping CMS ↔ Pipeline ↔ Jira

## Tabla de equivalencias

| `.env TARGET_ENV` | URL apuntada | Pipeline `environment` | Jira (jira-writer) |
|-------------------|--------------|------------------------|--------------------|
| `testing` | `TESTING_BASE_URL` (pre-prod/staging) | `dev_saas` | `validate_devsaas` — comenta + transiciona Done o crea bugs |
| `master` | `MASTER_BASE_URL` (rama master) | `master` | `validate_master` — comenta + transiciona A Versionar o FEEDBACK |
| `cliente` | `CLIENTE_BASE_URL` | `[nombre]` | `validate_master` con header de cliente |

> **Regla crítica de naming:** `TARGET_ENV=testing` en el `.env` apunta al ambiente de **pre-producción**
> (staging). En términos de Jira/QA, ese ambiente es "Dev_SAAS". El nombre "testing" es
> un artefacto histórico del `.env`, no describe un ambiente de desarrollo local.

---

## Qué hace el pipeline según el `environment`

### `environment: "master"` (validación en rama principal)

- Test-engine corre con `TARGET_ENV=master`
- URL: `MASTER_BASE_URL`
- jira-writer MODO B: postea comentario con header "Se valida sobre **Master**..."
- Si passed → transición `42` (A Versionar)
- Si failed → transición `2` (FEEDBACK)

### `environment: "dev_saas"` (validación en pre-prod antes de release)

- Test-engine corre con `TARGET_ENV=testing`
- URL: `TESTING_BASE_URL`
- jira-writer MODO C: postea comentario con header "Se volvió a validar en ambiente Dev-SAAS..."
- Si passed → transición `31` (Done)
- Si failed → crea ticket nuevo por cada bug (MODO D) + linkea + comenta en original

---

## Qué NO es un ambiente válido del pipeline

| Valor | Problema | Acción |
|-------|----------|--------|
| `testing` en el Pipeline Trigger | Confunde el `.env TARGET_ENV` con un ambiente Jira. No corresponde a ningún flujo de Jira real. | **Usar `dev_saas` en el trigger** (que internamente usa `TARGET_ENV=testing`) |
| Omitido / null | El orchestrator no puede determinar la operación Jira. | Default a `master` si el ticket está en estado "Revisión" |

---

## Flujo mental correcto al ejecutar el pipeline

```
¿Qué querés validar?
  ├── Rama master del CMS      → trigger con environment: "master"
  │                              test-engine usa TARGET_ENV=master
  │
  └── Pre-prod antes de release → trigger con environment: "dev_saas"
                                   test-engine usa TARGET_ENV=testing
```

---

## Historia y contexto

El nombre `TARGET_ENV=testing` viene de la configuración inicial del framework,
donde "testing" era el único ambiente de prueba disponible (pre-producción).
Al integrar con Jira, el equipo llama a ese mismo ambiente "Dev_SAAS" (porque
corresponde al proceso de preliberación Dev_SAAS Testing).

Esto genera una inconsistencia de naming entre el `.env` y Jira:
- `.env` dice `testing` → Jira dice `dev_saas`
- `.env` dice `master` → Jira dice `master` (aquí coinciden)

La regla going-forward: **el Pipeline Trigger siempre usa la terminología de Jira** (`master`, `dev_saas`, `[cliente]`). El test-engine es responsable de traducir eso al `TARGET_ENV` correcto.

---

## Referencias

- [`.env`](../../.env) — variables de ambiente del framework
- [`.claude/pipelines/test-engine/PIPELINE.md`](../../.claude/pipelines/test-engine/PIPELINE.md) — TE-6 mapping TARGET_ENV
- [`wiki/qa/devsaas-flow.md`](devsaas-flow.md) — flujo completo Dev_SAAS
