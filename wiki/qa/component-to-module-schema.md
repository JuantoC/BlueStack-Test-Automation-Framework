---
last-updated: 2026-04-17
---

# component-to-module.json — Schema

> Archivo de mapeo rápido de aliases de componentes Jira a módulos del pipeline. Usado en ticket-analyst (TA-6) como primera capa de matching antes del fuzzy matching.

**Path del archivo:** `.claude/pipelines/test-engine/references/component-to-module.json`

> **Estado actual:** El archivo no existe en el repositorio. El fuzzy matching de TA-6 opera sobre la tabla de aliases en `wiki/qa/domains-and-modules.md` directamente. Este schema describe la estructura esperada cuando el archivo sea creado.

---

## Propósito

Permite a ticket-analyst (TA-6) clasificar el `domain` y `module` de un ticket a partir del valor del campo `component_jira` sin depender únicamente del fuzzy matching sobre keywords.

**Flujo de uso en TA-6:**
1. Leer `component_jira` del ticket Jira
2. Buscar exact match en `component-to-module.json` (case-insensitive)
3. Si hay match → asignar `domain` y `module` directamente
4. Si no hay match → aplicar fuzzy matching sobre aliases de `wiki/qa/domains-and-modules.md`
5. Si fuzzy matching también falla → `domain: null`, `confidence: "low"`

---

## Schema del archivo

```json
{
  "version": "1.0",
  "last_updated": "YYYY-MM-DD",
  "mappings": {
    "<alias_componente_jira>": {
      "domain": "post | video | images | auth | ai-post",
      "module": "<module_key_en_test-map>"
    }
  }
}
```

### Ejemplo con aliases reales verificados

```json
{
  "version": "1.0",
  "last_updated": "2026-04-17",
  "mappings": {
    "Videos": { "domain": "video", "module": "video" },
    "Video Upload": { "domain": "video", "module": "video" },
    "Images": { "domain": "images", "module": "images" },
    "Image Gallery": { "domain": "images", "module": "images" },
    "Notes": { "domain": "post", "module": "post" },
    "Nota": { "domain": "post", "module": "post" },
    "CKEditor": { "domain": "post", "module": "post" },
    "Editor": { "domain": "post", "module": "post" },
    "Liveblog": { "domain": "post", "module": "post" },
    "NotaLista": { "domain": "post", "module": "post" },
    "Nota Lista": { "domain": "post", "module": "post" },
    "Login": { "domain": "auth", "module": "auth" },
    "Auth": { "domain": "auth", "module": "auth" },
    "2FA": { "domain": "auth", "module": "auth" },
    "AI Note": { "domain": "ai-post", "module": "ai-post" },
    "IA": { "domain": "ai-post", "module": "ai-post" },
    "Asistente": { "domain": "ai-post", "module": "ai-post" },
    "AI-Post": { "domain": "ai-post", "module": "ai-post" }
  }
}
```

---

## Campos de cada mapping

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `domain` | string | Uno de los 5 dominios válidos: `post`, `video`, `images`, `auth`, `ai-post` |
| `module` | string | Key del módulo en `test-map.json`. Generalmente igual a `domain`, salvo módulos especiales (`cross`, `stress`) |

---

## Regla de desempate

Si un alias de componente Jira puede mapear a más de un `domain` (ambigüedad real, no resuelta por el archivo):

1. Prioridad al módulo con más sessions disponibles
2. Si el empate persiste → `confidence: "medium"` y documentar en `classification.confidence_reason`
3. Si no se puede resolver → `confidence: "low"`, `human_escalation: true`

> Los aliases verificados en sesiones reales están en [wiki/qa/domains-and-modules.md](domains-and-modules.md) §Aliases conocidos por domain.

---

## Ver también

- `.claude/agents/ticket-analyst.md` — TA-6: clasificación domain/module desde component_jira
- [wiki/qa/domains-and-modules.md](domains-and-modules.md) — Tabla completa de aliases verificados
- [wiki/qa/test-map-schema.md](test-map-schema.md) — Schema de test-map.json con los module keys válidos
- `.claude/pipelines/test-engine/references/test-map.json` — Archivo real con módulos disponibles
