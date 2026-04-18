---
last-updated: 2026-04-17
---

# Roles de Testing — `role` en test-engine

> Define los roles disponibles para ejecución de tests y cómo test-engine los resuelve.

---

## Valores válidos

| Valor | Descripción | Default |
|-------|-------------|---------|
| `"editor"` | Usuario con permisos de edición de contenido (crear, editar, publicar notas, videos, imágenes) | **Sí** |
| `"admin"` | Usuario con permisos de administración (configuración del CMS, gestión de usuarios, acceso a áreas restringidas) | No |
| `"basic"` | Usuario con permisos mínimos (solo lectura o acceso limitado) | No |

---

## Cómo test-engine resuelve el rol

El campo `role` es opcional en el input de test-engine. Si se omite → default `"editor"`.

```json
{
  "ticket_analyst_output": { ... },
  "role": "editor"  // opcional
}
```

**Comportamiento del comando Jest:**
- Si `role === "editor"` → **no incluir** `TEST_ROLE` en el comando (es el default del framework — evitar ruido en el log).
- Si `role !== "editor"` → incluir `TEST_ROLE=<rol>` como env var inline.

```bash
# rol editor (omitido — es el default)
NODE_OPTIONS='--experimental-vm-modules' node node_modules/.bin/jest SessionName

# rol admin
TEST_ROLE=admin NODE_OPTIONS='--experimental-vm-modules' node node_modules/.bin/jest SessionName
```

---

## Resolución de credenciales

Las credenciales por rol y entorno están en `.env` con el patrón:

```
{ENV}_EDITOR_USER / {ENV}_EDITOR_PASS
{ENV}_ADMIN_USER  / {ENV}_ADMIN_PASS
{ENV}_BASIC_USER  / {ENV}_BASIC_PASS
```

Donde `{ENV}` es `MASTER` o `TESTING` (pre-prod).

---

## `@default-role` en sessions

Cada session en `sessions/` tiene la anotación `@default-role` en su cabecera:

```typescript
// @default-role: editor
```

El pipeline respeta este default. Solo se sobreescribe si el ticket explícitamente requiere otro rol (ej: probar un flujo de admin).

---

## Referencias

- `.claude/agents/test-engine.md` — TE-input schema, regla de omisión de TEST_ROLE
- [wiki/qa/environments.md](environments.md) — mapping de entornos y credenciales
- `.env` — variables `{ENV}_*_USER` y `{ENV}_*_PASS`
