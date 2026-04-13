# Formato de Commits — smart-commit

## Estructura del mensaje

```
<tipo>(<módulo>): <título imperativo en español, máx 72 chars>

Módulo: <nombre del módulo o área funcional>
Impacto: <descripción de una línea del impacto en el sistema o cobertura>
Escenarios: <flujos o casos cubiertos, separados por coma>
Archivos clave: <lista de los archivos más relevantes del grupo>
```

## Tabla de tipos

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad, nuevo Page Object, nuevo handler, nueva clase funcional |
| `fix` | Corrección de bug, estabilización de flujo existente |
| `refactor` | Reestructuración sin cambio de comportamiento, reducción de deuda técnica |
| `test` | Nuevos tests, nuevas suites, extensión de cobertura |
| `docs` | README, JSDoc, comentarios, skills, CLAUDE.md |
| `config` | Docker, CI/CD, grids, pipelines, dependencias |
| `chore` | Archivos de configuración menores, limpieza, renombrados sin impacto funcional |

## Tabla de traducción módulo → impacto

Usar para redactar el campo `Impacto` cuando el tipo de cambio no es obvio del diff:

| Patrón en archivos/diff | Impacto a expresar |
|---|---|
| Handler / class nueva | Implementación de capacidad funcional en [módulo] que habilita [flujo] |
| Refactor / restructure | Reducción de deuda técnica, mejora de mantenibilidad y escalabilidad |
| Page Object / session | Ampliación de cobertura automatizada hacia [sección del CMS] |
| Factory / faker / dynamic data | Generación de datos dinámicos, eliminando dependencias estáticas |
| JSDoc / comments / docs | Extensión de documentación interna para facilitar mantenimiento |
| Skill / CLAUDE.md / agent config | Configuración del agente IA, avance en automatización del ciclo QA |
| Docker / grid / CI / pipeline | Mejora de infraestructura de ejecución paralela e integración continua |
| Test / spec / suite | Extensión de cobertura hacia [flujo o módulo específico] |
| Toast / banner / modal | Implementación de validación de resultados de operación |
| Bulk / mass / publish | Cobertura de flujos de publicación masiva, reducción de riesgo de regresión |

**Regla de ambigüedad:** Si un grupo no encaja en ningún patrón, describir el impacto técnico concreto inferible del diff, sin inventar impacto de negocio.