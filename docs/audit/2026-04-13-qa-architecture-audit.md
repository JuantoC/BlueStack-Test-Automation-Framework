# Auditoría de Arquitectura — QA Pipeline Multi-Agente
**Fecha:** 2026-04-13  
**Documento auditado:** `docs/architecture/qa-automation-architecture.md` v2.0  
**Resultado:** Reemplazado por v3.0 (mismo archivo, misma ruta)  
**Formato:** Cada hallazgo indica la sección afectada en v3.0

---

## Cómo usar este documento

Este documento es la bitácora de las decisiones tomadas durante la auditoría de la v2.0.
Para cada hallazgo se indica:
- `[§X.Y]` → la sección del documento v3.0 donde se aplicó la corrección
- **Estado**: RESUELTO en v3.0 / ABIERTO (requiere decisión tuya)

---

## 1. Executive Summary

| # | Hallazgo | Severidad | Estado | Sección v3.0 |
|---|---------|-----------|--------|-------------|
| E1 | poll-jira.ts no tiene puente hacia Claude Code | Crítico | RESUELTO | §4.4 |
| E2 | Sin idempotencia: pipeline ejecutado 2x postea 2 comentarios | Crítico | RESUELTO | §7.2 |
| E3 | Context window budget no documentado | Crítico | RESUELTO | §11.6 |
| E4 | Account IDs personales en documento versionado | Crítico | RESUELTO | §9.3 |
| E5 | auto_generated tests postean en Jira sin revisión humana | Alto | RESUELTO | §5.4, §15 Fase 5 |
| E6 | test-generator mezclado dentro de test-engine | Alto | RESUELTO | §3.2, §3.3 |
| E7 | Envelope de mensajes inconsistente con ejemplos concretos | Medio | RESUELTO | §7.1 |
| E8 | confidence_score ausente en fuzzy matching | Medio | RESUELTO | §6.2 |
| E9 | MODO F en jira-writer: inconsistencia entre skills | Medio | ABIERTO | §META DECISION-01 |
| E10 | Sección de seguridad/credenciales ausente | Alto | RESUELTO | §9 |

---

## 2. Análisis de Arquitectura

### 2.1 Patrón Orchestrator

**Hallazgo:** El patrón orchestrator central (qa-orchestrator → sub-pipelines) es correcto para este caso.  
**Por qué:** Equipo de 1 persona, flujo lineal, no hay paralelismo real a gestionar.  
**Comparativa:**
- LangGraph (DAG): útil si hubiera ejecución paralela de múltiples tickets. Overhead sin ganancia real aquí.
- Choreography/Event-driven: requiere broker de mensajes. Sobreingeniería total para 1 persona.
- AutoGen/CrewAI: para colaboración de múltiples agentes. Aquí hay un agente con herramientas.

**Corrección aplicada:** Ninguna — el patrón se mantiene.  
**Sección v3.0:** §3.1

---

### 2.2 Claude Code como runtime — Advertencia explícita

**Hallazgo:** La v2.0 no documentaba las implicancias reales de correr el pipeline dentro de Claude Code.  
**Riesgos no documentados:**

| Dimensión | Problema real |
|-----------|--------------|
| Context window | Un pipeline completo puede consumir 60-120K tokens. Sin gestión activa, los pipelines largos fallan silenciosamente. |
| Costo de tokens | 100 pipelines/semana ≈ $10-50/semana solo en tokens. Sin tracking ni presupuesto. |
| Paralelismo | Claude Code es single-threaded por sesión. No puede procesar múltiples tickets simultáneamente. |
| Disponibilidad | CronCreate requiere sesión activa. Si Claude se cierra, el cron no dispara. |

**Corrección aplicada:** §11.6 documenta el límite operativo (80K tokens) y la estrategia cuando se acerca. La nota de "arquitectura experimental" está en §1.  
**Sección v3.0:** §1, §11.6

---

### 2.3 test-generator extraído de test-engine

**Hallazgo:** En v2.0, `generate_and_run` era un tercer modo del test-engine. Esto mezcla responsabilidades: discovery/execution vs. generation son operaciones fundamentalmente diferentes.  
**Corrección aplicada:** test-generator es ahora un pipeline separado. test-engine solo tiene `discover_and_run` y `run_existing`. El Orchestrator decide si invocar test-engine o test-generator.  
**Sección v3.0:** §3.2, §3.3 (test-generator), §15 Fase 5

---

## 3. Contratos y Schemas

### 3.1 Inconsistencia: Envelope vs. payloads directos

**Hallazgo:** La sección 7.1 de v2.0 definía un envelope con `payload: {}` pero TODOS los ejemplos concretos del documento usaban el payload directo sin envelope. El envelope existía en el documento pero nunca en los ejemplos de uso.  
**Corrección aplicada:** Envelope eliminado. `pipeline_id` se agrega como campo directo en todos los schemas existentes.  
**Sección v3.0:** §7.1

---

### 3.2 schema_version sin estrategia de migración

**Hallazgo:** El campo `schema_version: "2.0"` existía pero era decorativo. No había tabla de cambios entre versiones, ni comportamiento definido cuando un receptor recibe la versión incorrecta.  
**Corrección aplicada:** La tabla de cambios v2.0 → v3.0 está en §META del documento.  
**Sección v3.0:** §META "Qué cambió de v2.0 a v3.0"

---

### 3.3 Idempotencia — Gap crítico

**Hallazgo:** Si el pipeline se ejecuta dos veces sobre el mismo ticket (por error, reintento o polling duplicado), posta dos comentarios idénticos en Jira. No había ningún mecanismo de deduplicación.  
**Escenario real:** Orchestrator corre → Jest pasa → jira-writer postea comentario → conexión se corta antes de confirmación → Orchestrator reintenta → segundo comentario duplicado.  
**Corrección aplicada:** Campo `idempotency` agregado al Pipeline Context con `last_comment_id` y `already_reported`. El Orchestrator verifica antes de postear.  
**Sección v3.0:** §7.2

---

## 4. Sistema de Triggers

### 4.1 Gap en poll-jira.ts — El puente faltante

**Hallazgo:** La v2.0 decía explícitamente: "El script no invoca Claude directamente — produce los trigger events para que el usuario (o un cron externo) los pase al Orchestrator." Esto es un gap arquitectónico real: el script era inútil en modo automatizado porque nadie cerraba el loop.  
**Evaluación de opciones:**
- CronCreate de Claude Code: cero infraestructura, nativo del entorno, sesión activa requerida → correcto para Fases 4-5.
- `crontab` WSL2: funciona sin sesión activa pero frágil (cron no siempre activo en WSL2).
- GitHub Actions schedule: HA nativa, logs centralizados → correcto para Fase 6.

**Corrección aplicada:** §4.4 documenta CronCreate como implementación concreta de T3 con el schedule y prompt exactos. Fase 6 migra a GitHub Actions.  
**Sección v3.0:** §4.4, §15 Fase 4, §15 Fase 6

---

### 4.2 Triggers adicionales no documentados

**Hallazgo:** Dos tipos de trigger relevantes no estaban en la tabla:
- T6: trigger por PR merge (requiere T4/GH Actions — diferido a Fase 6 futura)
- T7: trigger manual batch ("validar todos los tickets del sprint")

**Corrección aplicada:** T6 documentado como fuera de alcance en §4.1. T7 está implícito en `scheduled_sweep` del polling.  
**Sección v3.0:** §4.1

---

## 5. test-map.json

### 5.1 Riesgo de desactualización

**Hallazgo:** La v2.0 no tenía mecanismo para detectar cuando `test-map.json` quedaba desactualizado respecto a los archivos en `sessions/`. El único mitigador era el fuzzy match como fallback.  
**Riesgo concreto:** Developer agrega `sessions/post/NewPollNote.test.ts` sin actualizar `test-map.json`. El pipeline entra en `generate_and_run` y genera un test duplicado.  
**Corrección aplicada:** `scripts/sync-test-map.ts` detecta el drift. Está en el checklist de Fase 0 y en el proceso de review.  
**Sección v3.0:** §6.4, §15 Fase 0 checklist

---

### 5.2 Keyword `imagen` matchea módulo incorrecto

**Hallazgo:** Ticket: "POST - Imagen de portada no se guarda" → keywords matchean `images` (`imagen`, `imágenes`) pero el módulo correcto es `post`. El módulo `post` no tenía `"imagen de portada"` en sus keywords.  
**Corrección aplicada:** Keywords del módulo `post` en `test-map.json` actualizadas para incluir `"imagen de portada"` e `"imagen destacada"`.  
**Sección v3.0:** §6.1 (test-map.json, módulo "post")

---

### 5.3 Sin confidence_score en fuzzy matching

**Hallazgo:** El algoritmo de matching no tenía umbral de confianza. Si solo 1 keyword matcheaba, el pipeline ejecutaba de todas formas con baja confianza, pudiendo ejecutar el módulo incorrecto.  
**Corrección aplicada:** Pasos de matching actualizados con `confidence_score`: "high" (component_jira exacto), "medium" (keywords ≥ 2), "low" (1 keyword) → "low" escala en lugar de ejecutar.  
**Sección v3.0:** §6.2

---

### 5.4 Sin precedencia definida entre component_jira y keyword matching

**Hallazgo:** El algoritmo no definía que `component_jira` tiene precedencia máxima sobre el fuzzy match por keywords.  
**Corrección aplicada:** Paso 1 del algoritmo es ahora el lookup por `component_jira` en `component-to-module.json`.  
**Sección v3.0:** §6.2

---

## 6. Generación Automática de Tests

### 6.1 auto_generated: true es guardarrail insuficiente

**Hallazgo:** En v2.0, los tests auto-generados podían ejecutarse y postear resultados en Jira sin revisión humana. El único freno era `auto_generated: true` en el Pipeline Execution Record (un campo interno que el desarrollador quizás no lea).  
**Escenario de riesgo:** test-generator crea un test con `expect(true).toBe(true)`, el test "pasa", test-reporter postea "✔ Caso validado" en Jira, el ticket transiciona a "A Versionar". La funcionalidad puede estar rota.  
**Práctica del mercado:** Ninguna herramienta madura (Mabl, Testim, Functionize) postea resultados de tests AI-generados en el sistema de tickets sin revisión humana en el primer ciclo.  
**Corrección aplicada:** dry_run obligatorio para todos los tests auto-generados. NO postean en Jira hasta que el commit tenga `[validated]` en el mensaje.  
**Sección v3.0:** §5.4, §3.3 (test-generator output), §15 Fase 5

---

### 6.2 test_hints son insuficientes para generar assertions útiles

**Hallazgo:** Los hints del tipo "Verificar que el prompt enviado se refleja en la nota generada" no contienen qué elemento del DOM verificar, qué valor comparar, qué Page Object usar. El test generado tendrá assertions débiles o vacías.  
**Corrección aplicada parcial:** El test-generator ahora recibe también `page_objects[]` de `test-map.json` como contexto. Para tests completamente nuevos (módulo sin POM), pom-generator se invoca primero.  
**Lo que queda sin resolver:** La calidad de las assertions depende del `create-session` skill. Esto es una limitación intrínseca de la generación por texto.  
**Sección v3.0:** §3.3 (test-generator input incluye `page_objects`)

---

## 7. Manejo de Errores

### 7.1 Tabla de errores incompleta — 6 casos críticos faltantes

**Hallazgo:** La tabla de errores de v2.0 no cubría casos críticos.

| Error faltante | Por qué es crítico |
|---------------|-------------------|
| Context window excedido | El pipeline se trunca silenciosamente — el más difícil de detectar |
| MCP token expirado (401/403) | Todo el pipeline falla en el primer call; no se autorenueva |
| Docker Selenium Grid no disponible | Jest falla con connection refused antes de ejecutar el test |
| `jest --json` produce output vacío | Result Parser falla con JSON parse error sin mensaje útil |
| Pipeline Context corrompido | Orchestrator no puede reanudar |
| `test-map.json` no encontrado | test-engine falla antes de empezar |

**Corrección aplicada:** Los 6 casos están en la tabla de §7.3.  
**Sección v3.0:** §7.3

---

### 7.2 Sin Dead Letter Queue para payloads fallidos

**Hallazgo:** Si jira-writer falla después de 3 reintentos, el Pipeline Execution Record decía "error" pero el payload se perdía. El desarrollador no sabía que su ticket fue procesado pero el feedback nunca llegó a Jira.  
**Corrección aplicada:** `pipeline-logs/failed-reports.json` actúa como DLQ mínimo. Los payloads fallidos se acumulan para reintento manual.  
**Sección v3.0:** §10.2, §12 (tabla de riesgos), §14

---

### 7.3 Sin mecanismo de recuperación de estado

**Hallazgo:** Si el pipeline fallaba después de test-engine (Jest ya corrió, costó 3 minutos), no había forma de retomar desde ese punto. Se volvía a ejecutar desde el principio.  
**Corrección aplicada:** Pipeline Context se persiste a disco en cada transición de stage. El Orchestrator verifica si existe un context activo al iniciar y retoma desde el último stage completado.  
**Sección v3.0:** §7.2 (Pipeline Context con persistencia), §8.3 (mecanismo de resumption)

---

## 8. Observabilidad

### 8.1 Archivos JSON en pipeline-logs/ son insuficientes para producción

**Hallazgo:** El único mecanismo de observabilidad en v2.0 era el Pipeline Execution Record al final de cada run. Sin:
- Logs de cada step durante la ejecución
- Correlación entre logs de Winston (Selenium) y logs del pipeline
- Detección de cuánto tarda cada stage

**Corrección aplicada:** `step_log[]` agregado al Pipeline Context y al Pipeline Execution Record. Registra timestamp, duración y status de cada stage.  
**Sección v3.0:** §7.2, §8.1, §10.1

**Nota sobre herramientas del mercado:** LangSmith, Arize, Helicone son relevantes si el pipeline migra a Claude API directa (Fase 6+). Para Fases 1-5 con Claude Code CLI, los archivos JSON + step_log son suficientes.

---

### 8.2 Sin mecanismo de alertas documentado

**Hallazgo:** La v2.0 no mencionaba cómo se notificaba al equipo cuando el pipeline fallaba.  
**Corrección aplicada:** §10.3 documenta el mecanismo de alerta para Fases 1-5: comentario en Jira cuando `human_escalation = true`. No se implementa infraestructura adicional hasta Fase 6.  
**Sección v3.0:** §10.3

---

## 9. Seguridad

### 9.1 Account IDs personales en documento versionado — Riesgo real

**Hallazgo:** El Apéndice B de v2.0 tenía Account IDs de Jira de personas reales:
```
Paula Rodriguez:   633b5c898b75455be4580f5b
Verónica Tarletta: 5c51d02898c1ac41b4329be3
```

Si este documento entra en git, esos IDs quedan en el historial **permanentemente**, incluso si se eliminan en un commit posterior. Los Account IDs de Jira pueden usarse para acciones en nombre de esas personas vía la API.

**Corrección aplicada:** Apéndice B limpiado. Los Account IDs se mueven a `.claude/references/team-accounts.md` con entrada en `.gitignore`. Se agrega al checklist de Fase 0.  
**Sección v3.0:** §9.3, §15 Fase 0 checklist

---

### 9.2 Sección de seguridad/credenciales ausente

**Hallazgo:** La v2.0 mencionaba variables de entorno (§11.4) pero no tenía sección dedicada a seguridad. No quedaba claro cómo se manejaban las credenciales del MCP Atlassian durante el pipeline, ni cómo cambiar `TESTING_URL` para Dev_SAAS sin romper otras sesiones.  
**Corrección aplicada:** Sección §9 completa (Seguridad y Credenciales). §11.5 documenta el mecanismo concreto de cambio de `TESTING_URL` (inline en el comando Jest, no modificar el .env).  
**Sección v3.0:** §9, §11.5

---

## 10. Métricas

### 10.1 Target "< 10 min" es optimista

**Hallazgo:** "< 10 min para sessions existentes" no consideraba: Claude Code analizar el ticket (2-3 min) + Jest run completo en Selenium grid (3-7 min) + jira-writer (1-2 min). El rango real es 6-12 minutos, con el target en el límite inferior.  
**Corrección aplicada:** Target ajustado a < 15 min.  
**Sección v3.0:** §13

---

### 10.2 Métricas faltantes importantes

**Hallazgo:** Las 6 métricas de v2.0 no incluían métricas críticas para la sostenibilidad del sistema.

| Métrica faltante | Por qué importa |
|-----------------|----------------|
| Token cost por pipeline run | Sin esto no se puede saber si el sistema es económicamente viable |
| Latencia P95 | El promedio oculta los outliers. Un ticket con historial largo puede tardar 3x el promedio. |
| Tasa de fallos infraestructura vs. aplicación | Sin esta distinción, no se puede mejorar la resiliencia del sistema |
| test-map drift | Si el archivo se desactualiza, el discovery rate cae pero nadie lo sabe |

**Corrección aplicada:** Las 4 métricas están en §13 con sus targets.  
**Sección v3.0:** §13

---

### 10.3 "Coverage del test-map: incremento medible" es vago

**Hallazgo:** "Incremento medible en cada Fase 5" no es un target accionable.  
**Corrección aplicada:** Target específico: "+2 módulos nuevos por sprint de Fase 5".  
**Sección v3.0:** §13

---

## 11. Plan de Fases

### 11.1 Falta primer test E2E manual en Fase 0

**Hallazgo:** La Fase 0 de v2.0 listaba archivos a crear pero no incluía el primer test end-to-end manual del ciclo completo. Automatizar sin haber verificado el ciclo manual es un riesgo.  
**Corrección aplicada:** El checklist de Fase 0 incluye "Primer test E2E manual: ticket-analyst + test-engine + test-reporter manualmente antes de automatizar nada".  
**Sección v3.0:** §15 Fase 0 checklist

---

### 11.2 SQLite en Fase 5+ — Sobreingeniería eliminada

**Hallazgo:** La v2.0 planeaba migrar a SQLite en Fase 5+ para queries históricas. Para el volumen actual (decenas de pipelines/semana) esto agrega una dependencia, un schema que mantener, y un proceso de migración sin ganancia real.  
**Corrección aplicada:** SQLite eliminado completamente. JSON files en `pipeline-logs/` son la única solución. Revisar si el volumen justifica SQLite cuando se superen 500 pipeline runs.  
**Sección v3.0:** §8.2

---

### 11.3 Fase 6 simplificada — Webhooks eliminados del alcance

**Hallazgo:** La v2.0 incluía Jira Webhooks con servidor externo como opción A de Fase 6. Para un equipo de 1 persona con CI en WSL2, esto es una trampa de complejidad: requiere servidor con IP pública, ngrok en dev, infraestructura dedicada en prod.  
**Corrección aplicada:** Fase 6 es exclusivamente GitHub Actions schedule. Jira webhooks documentados como "fuera de alcance hasta que el equipo crezca".  
**Sección v3.0:** §15 Fase 6

---

## 12. Decision-01 Abierta — MODO F en jira-writer

**Hallazgo:** El `jira-reader/references/pipeline-schema.md` referencia "MODO F" como punto de entrada unificado para el pipeline. El `jira-writer/SKILL.md` no tiene MODO F implementado. La nota al final de v2.0 lo reconocía como inconsistencia.

**Esto es una deuda técnica que bloquea Fase 3.** Antes de implementar test-reporter hay que saber si:
- El test-reporter llama `validate_master`, `validate_devsaas` etc. directamente (Opción B — status quo)
- O el test-reporter llama un MODO F unificado que jira-writer implementa internamente (Opción A — requiere reescribir jira-writer/SKILL.md)

**Estado:** ⚠️ ABIERTA.  
**Sección v3.0:** §META DECISION-01, §Apéndice D

---

## 13. Diagnóstico Final — Resumen de Madurez

### Lo que estaba bien en v2.0 (mantenido en v3.0)

1. Los JSON examples concretos con valores reales → directamente implementables.
2. La propagación de `jira_metadata` → `runSession()` → Allure sin transformación.
3. Los comandos Jest con flags exactos (`NODE_OPTIONS`, `--json --outputFile`).
4. Las JQL queries reales con nombres de status exactos del proyecto NAA.
5. La separación skills existentes / pipelines nuevos.
6. El mapeo `component_jira → module` con nulos documentados.
7. Los ejemplos ADF concretos inline.
8. El `correlation_id` / `pipeline_id` para trazabilidad cross-pipeline.

### Percentil de madurez estimado

**v2.0:** 55-60 percentil. Los ejemplos concretos lo elevaban sobre el promedio, pero los gaps críticos (idempotencia, seguridad, context window) lo bajaban.

**v3.0:** 70-75 percentil. Con los gaps resueltos, es un documento directamente implementable para un sistema de este alcance.

**Para llegar a 90+ percentil (no necesario para este contexto):**
- Cost modeling completo con presupuesto mensual
- Runbook de incidentes (qué hace el QA cuando el pipeline postea mal)
- Evaluación del output del LLM (¿cómo medir si Claude clasifica bien los tickets?)
- Test de carga (¿qué pasa con 50 tickets simultáneos en "A Versionar"?)

**Lo que sigue siendo experimental (no hay equivalente en producción documentado):**
- Pipelines de esta complejidad corriendo íntegramente en Claude Code CLI (Fases 1-5)
- Test auto-generation → dry_run → habilitación manual → pipeline production (Fase 5)
- CronCreate de Claude Code como scheduler de sistema crítico (Fase 4)

---

*Fin de la auditoría. Para el documento actualizado ver `docs/architecture/qa-automation-architecture.md` v3.0.*
