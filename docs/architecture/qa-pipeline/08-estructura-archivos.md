# Estructura de Archivos del Sistema — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## 14. Estructura de Archivos del Sistema

```
.claude/
├── agents/                     ← MODELO VIGENTE
│   ├── qa-orchestrator.md      (tools: Agent, Read, Write, Glob)
│   ├── ticket-analyst.md       (tools: Read, Glob, Write + MCP Atlassian read)
│   ├── test-engine.md          (tools: Bash, Read, Glob, Grep, Write)
│   └── test-reporter.md        (tools: Read, Write, Glob, Skill + MCP Atlassian write)
│
├── pipelines/                  ← REFERENCIA HISTÓRICA (v3.0)
│   ├── ticket-analyst/
│   │   ├── PIPELINE.md         (deprecated — ver .claude/agents/ticket-analyst.md)
│   │   └── references/         ← referencias activas que los agentes consumen
│   │       ├── component-to-module.json
│   │       ├── classification-rules.md
│   │       └── agent-capabilities.md
│   ├── test-engine/
│   │   ├── PIPELINE.md         (deprecated — ver .claude/agents/test-engine.md)
│   │   └── references/
│   │       └── test-map.json   ← activo — los agentes lo consumen
│   ├── test-reporter/PIPELINE.md  (deprecated)
│   └── qa-orchestrator/PIPELINE.md (deprecated)
│
└── skills/                     ← skills que los agentes invocan
    ├── jira-reader/
    └── jira-writer/

├── references/
│   └── team-accounts.md        ← (en .gitignore — datos sensibles)
│
src/
└── core/
    └── jira/
        ├── JiraApiClient.ts          ← Cliente HTTP base Jira REST API v3
        ├── JiraAttachmentUploader.ts ← Upload PNG/MP4 a Jira (screenshots de fallos)
        └── index.ts                  ← Re-exports del módulo

scripts/
└── sync-test-map.ts

pipeline-logs/
├── active/                     ← Execution Contexts en curso
├── completed/                  ← Agent Execution Records finales
├── failed-reports.json         ← DLQ mínimo para payloads fallidos
└── .gitkeep
```
