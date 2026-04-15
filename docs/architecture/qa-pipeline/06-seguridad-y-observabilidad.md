# Seguridad, Credenciales y Observabilidad — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## 9. Seguridad y Credenciales

### 9.1 Credenciales requeridas por el pipeline

| Credencial | Tipo | Dónde se configura |
|-----------|------|-------------------|
| MCP Atlassian (Jira) | Token de API Atlassian | `.mcp.json` + cuenta Atlassian activa en sesión Claude Code |
| CMS credentials (TESTING_URL, ADMIN_USER, ADMIN_PASS) | Variables de entorno | `.env` del repositorio (en .gitignore) |
| BASIC_AUTH_USER / BASIC_AUTH_PASS | Variables de entorno | `.env` del repositorio |
| Grid URL (para USE_GRID=true) | Variable de entorno | `.env` o default `http://localhost:4444` |

> El pipeline **no gestiona credenciales por sí mismo** — las lee del `.env` del repo y del contexto de sesión MCP ya configurado.

### 9.2 Datos sensibles en git

**Regla:** Ningún identificador personal (Account IDs, emails, tokens) entra en archivos versionados.

| Tipo de dato | Ubicación correcta |
|-------------|-------------------|
| Account IDs Jira de personas del equipo | `.claude/references/team-accounts.md` (en `.gitignore`) |
| API tokens / credenciales | `.env` (en `.gitignore`) |
| Cloud ID de Jira | Puede estar versionado — es un ID público |
| URLs de entornos de pre-prod | Pueden estar versionados |

### 9.3 Account IDs — archivo separado no versionado

Crear y agregar a `.gitignore`:
```
.claude/references/team-accounts.md
```

Contenido del archivo (no versionado):
```markdown
# Team Account IDs — NO VERSIONAR
Juanto (Juan Caldera): 712020:59e4ac7b-f44f-45cb-a444-44746cecec49
Paula Rodriguez:       633b5c898b75455be4580f5b
Verónica Tarletta:     5c51d02898c1ac41b4329be3
Claudia Tobares:       5c1d65c775b0e95216e8e175
```

Los schemas del pipeline usan `assignee_hint` (`"frontend"`, `"backend"`, `"editor"`) que el jira-writer resuelve internamente a Account IDs. El Account ID nunca viaja en los payloads del pipeline.

---

## 10. Observabilidad

### 10.1 step_log por stage

El `step_log[]` del Execution Context (§7.2) registra cada stage con timestamp, duración y notas. Esto permite:
- Detectar qué stage consume más tiempo.
- Identificar dónde falló un pipeline interrumpido.
- Calcular latencias por stage en forma histórica.

Los logs de Winston del test runner (`sessions/`) se correlacionan con el `pipeline_id` mediante el output file de Jest: `pipeline-logs/results-{ticket_key}-{pipeline_id}.json`.

### 10.2 failed-reports.json (Dead Letter Queue mínimo)

Si jira-writer falla después de 3 reintentos, el payload se agrega a `pipeline-logs/failed-reports.json`:

```json
[
  {
    "pipeline_id": "pipe-20260413-001",
    "timestamp": "2026-04-13T14:35:00Z",
    "ticket_key": "NAA-4429",
    "operation": "validate_master",
    "payload": { },
    "error": "MCP connection timeout después de 3 reintentos",
    "retry_count": 3
  }
]
```

Este archivo debe revisarse manualmente antes de cada sesión de trabajo. Los payloads pendientes se re-envían manualmente con jira-writer.

### 10.3 Alertas: mecanismo actual

En Fases 1-5, el mecanismo de alerta es:
1. Si `human_escalation = true` en el Agent Execution Record → el Orchestrator postea un comentario en el ticket Jira explicando por qué el pipeline no pudo resolver automáticamente.
2. Si `final_status = "error"` → el pipeline guarda el record en `pipeline-logs/completed/` con el detalle del error. Revisar antes de la siguiente sesión.

No se implementa infraestructura adicional de alertas (Slack, email) hasta Fase 6 cuando el pipeline corre sin sesión local activa.

### 10.4 Evolución futura (Fase 6+)

Cuando el pipeline migre a GitHub Actions:
- Los logs de ejecución quedan en GitHub Actions workflow logs (sin configuración adicional).
- Errores pueden notificarse vía GitHub Actions `notify-slack` action o similar.
- Para observabilidad de LLM calls directas (si se migra de Claude Code CLI a Claude API): evaluar LangSmith o Helicone.
