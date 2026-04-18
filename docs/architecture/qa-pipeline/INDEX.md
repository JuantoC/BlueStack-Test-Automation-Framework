# QA Automation Pipeline — Arquitectura Multi-Agente

> **HISTORIAL DE DISEÑO** — Este directorio contiene el historial de planificación y decisiones arquitecturales del pipeline QA.
> El conocimiento operacional actualizado vive en `wiki/qa/`. **Los agentes NO deben consumir este directorio en runtime** — usar siempre `wiki/` como fuente de verdad.

> Entry point para lectura humana. Leer solo el archivo correspondiente al tema, no todo el directorio.

Este directorio documenta la arquitectura del pipeline QA end-to-end que conecta el framework de automatización Selenium/Jest con el proyecto Jira NAA de Bluestack. El pipeline corre íntegramente dentro de Claude Code y coordina 5 sub-agentes (ticket-analyst, test-engine, test-reporter, test-generator, qa-orchestrator) para cerrar el ciclo completo: ticket → interpretación → pruebas → feedback → resolución.

---

## Tabla de decisión — Si necesitás X, leer Y

| Si necesitás... | Leer |
|---|---|
| Entender qué hace un agente específico (ticket-analyst, test-engine, etc.) | [`02-arquitectura-agentes.md`](02-arquitectura-agentes.md) |
| Ver el contrato de payload entre pipelines (schemas JSON) | [`05-contratos-y-persistencia.md`](05-contratos-y-persistencia.md) |
| Entender triggers y crons (CronCreate, GitHub Actions, polling) | [`03-triggers-y-flujos.md`](03-triggers-y-flujos.md) |
| Buscar un término del glosario (ADF, dry_run, confidence, DLQ...) | [`10-apendices.md`](10-apendices.md) |
| Ver en qué fase está la implementación y qué falta | [`09-plan-implementacion.md`](09-plan-implementacion.md) |
| Ver cómo funciona test-map.json y el matching de módulos | [`04-test-map.md`](04-test-map.md) |
| Entender credenciales, env vars y qué no versionar | [`06-seguridad-y-observabilidad.md`](06-seguridad-y-observabilidad.md) |
| Ver la estructura de carpetas del sistema (pipelines, logs, scripts) | [`08-estructura-archivos.md`](08-estructura-archivos.md) |
| Ver métricas de éxito, KPIs y riesgos | [`07-entorno-riesgos-metricas.md`](07-entorno-riesgos-metricas.md) |
| Ver decisiones arquitecturales tomadas (DECISION-01, D-02..D-10) | [`00-meta.md`](00-meta.md) |
| Entender visión general del sistema y estado actual de implementación | [`01-vision-y-estado.md`](01-vision-y-estado.md) |
| Ver transiciones Jira y referencias cruzadas de skills | [`10-apendices.md`](10-apendices.md) |
| Integrar upload de screenshots/videos al pipeline (JiraAttachmentUploader) | [`11-multimedia-attachments.md`](11-multimedia-attachments.md) |
| Ver esquemas operacionales de criterios, outcomes y roles de test | [`wiki/qa/`](../../../wiki/qa/) |
| Entender cómo se invalidan criterios en ticket-analyst (TA-4.4) | [`wiki/qa/comment-invalidation.md`](../../../wiki/qa/comment-invalidation.md) |
| Ver el schema de output de ticket-analyst | [`wiki/qa/ticket-analyst-output-schema.md`](../../../wiki/qa/ticket-analyst-output-schema.md) |
| Ver el schema de output de test-engine | [`wiki/qa/test-engine-output-schema.md`](../../../wiki/qa/test-engine-output-schema.md) |
| Ver el schema del Execution Context completo | [`wiki/qa/execution-context-schema.md`](../../../wiki/qa/execution-context-schema.md) |
| Ver tipos de criterio, automatizabilidad y roles de test | [`wiki/qa/criterion-types-and-scopes.md`](../../../wiki/qa/criterion-types-and-scopes.md), [`wiki/qa/test-roles.md`](../../../wiki/qa/test-roles.md), [`wiki/qa/criterion-automatizability.md`](../../../wiki/qa/criterion-automatizability.md) |
| Ver outcomes posibles del pipeline | [`wiki/qa/pipeline-outcomes.md`](../../../wiki/qa/pipeline-outcomes.md) |
| Ver catálogo de errores del pipeline | [`wiki/qa/error-handling-catalog.md`](../../../wiki/qa/error-handling-catalog.md) |
| Ver lógica de routing del pipeline | [`wiki/qa/pipeline-routing.md`](../../../wiki/qa/pipeline-routing.md) |
| Ver dominios, módulos y componentes | [`wiki/qa/domains-and-modules.md`](../../../wiki/qa/domains-and-modules.md) |
| Ver formato ADF para comentarios Jira | [`wiki/qa/adf-format-guide.md`](../../../wiki/qa/adf-format-guide.md) |

---

## Tabla de contenidos

| Archivo | Contiene |
|---|---|
| [`00-meta.md`](00-meta.md) | Historial de cambios v2.0→v3.0, decisiones abiertas y resueltas (DECISION-01 y D-02..D-10), motivaciones arquitecturales. |
| [`01-vision-y-estado.md`](01-vision-y-estado.md) | Objetivo del pipeline, diagrama de flujo global, restricciones de arquitectura, estado actual de cada pieza con su fase y status. |
| [`02-arquitectura-agentes.md`](02-arquitectura-agentes.md) | Definición completa de los 5 pipelines (qa-orchestrator, ticket-analyst, test-engine, test-reporter, test-generator): responsabilidades, inputs/outputs con schemas JSON completos, lógica interna. |
| [`03-triggers-y-flujos.md`](03-triggers-y-flujos.md) | Tipos de trigger (T1-T5), schema del evento trigger, JQL queries del polling, configuración CronCreate, y los 4 flujos de ejecución (Master, Re-test, Dev_SAAS, generación de tests). |
| [`04-test-map.md`](04-test-map.md) | Contenido actual de test-map.json, estrategia de matching (component_jira → fuzzy keywords), mapeo componente Jira → módulo interno, script sync-test-map.ts. |
| [`05-contratos-y-persistencia.md`](05-contratos-y-persistencia.md) | Schema de mensajes inter-agente, Execution Context completo con idempotencia y resumption, tabla de manejo de errores, Agent Execution Record con schema y almacenamiento. |
| [`06-seguridad-y-observabilidad.md`](06-seguridad-y-observabilidad.md) | Credenciales requeridas, reglas de datos sensibles en git, team-accounts.md (no versionado), step_log, failed-reports.json (DLQ), mecanismo de alertas actual y evolución futura. |
| [`07-entorno-riesgos-metricas.md`](07-entorno-riesgos-metricas.md) | Consideraciones WSL2+ESM, ADF obligatorio, naming de sessions, variables de entorno, cambio de TESTING_URL, context window budget (80K tokens), tabla de riesgos y mitigaciones, métricas de éxito con targets. |
| [`08-estructura-archivos.md`](08-estructura-archivos.md) | Árbol completo de directorios del sistema: pipelines, skills, references, scripts, pipeline-logs, con indicación de fase de creación para cada entregable nuevo. |
| [`09-plan-implementacion.md`](09-plan-implementacion.md) | Flowchart visual de las 6 fases, checklist detallado de Fase 0, entregables y criterios de validación de cada fase (1-6), resumen de timeline con dependencias. |
| [`10-apendices.md`](10-apendices.md) | Glosario de términos, datos de Jira Cloud (Cloud ID, transiciones por ID), tabla de referencias cruzadas de skills con operaciones, contratos de integración (pipeline-schema.md), DECISION-01 (resuelta). |
| [`11-multimedia-attachments.md`](11-multimedia-attachments.md) | Especificación completa de integración multimedia: módulo `src/core/jira/`, upload de PNG y MP4 a Jira via REST API, Fase F2.5 de jira-writer, schema v3.1. Todas las decisiones resueltas. |
