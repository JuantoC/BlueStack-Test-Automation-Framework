# Field map y convenciones — Proyecto NAA

## Issue Types

| Nombre | ID | Cuándo usar |
|--------|----|-------------|
| QA Bug - Front | 10027 | Bug en Angular/UI detectado por QA |
| QA Bug - Back | 10030 | Bug en backend/API/servicio detectado por QA |
| Story - Front | 10015 | Historia de usuario frontend |
| Story - Back | 10028 | Historia de usuario backend |
| Bug - Front | 10017 | Bug confirmado (no QA) frontend |
| Bug - Back | 10029 | Bug confirmado (no QA) backend |
| Task | 10016 | Tarea técnica genérica |
| Task - Back | 10031 | Tarea técnica backend |
| Epic | 10018 | Épica agrupadora |
| Subtarea | 10019 | Subtarea de cualquier issue |

## Prioridades

| Nombre | ID | Cuándo usar |
|--------|----|-------------|
| Critical production site | 10002 | Producción caída, bloqueante total |
| Critical path development | 10001 | Bloquea el sprint actual |
| Normal production site | 10000 | Afecta prod pero hay workaround |
| Highest | 1 | Muy urgente |
| High | 2 | Importante — detectado en Dev_SAAS o entorno de cliente |
| Medium | 3 | Normal (default para automatización desde master) |
| Low | 4 | Puede esperar |
| Lowest | 5 | Nice-to-have |

> **Regla de prioridad para bugs creados por el pipeline automatizado:**
> - `dev_saas` o ambiente de cliente → `High` mínimo
> - `master` → `Medium` por defecto

## Campos custom

| Campo | fieldId | Tipo | Descripción |
|-------|---------|------|-------------|
| Componente | `customfield_10061` | array[string] | Tag de componente técnico |
| Resumen Ejecutivo | `customfield_10062` | string | Una línea ejecutiva del issue |
| Descripción Funcional | `customfield_10072` | string | Detalle funcional adicional |
| Cambios SQL - Deploy | `customfield_10066` | string | Solo para tickets de deploy |
| Cambios Librerías | `customfield_10067` | string | Solo para tickets de deploy |
| Key ticket original (CMSM) | `customfield_10073` | string | Referencia a ticket de soporte origen |

> **Labels vs Componente:**
> - `labels` (campo nativo) = tickets de soporte con tag del cliente (ej. "Martin", "LAURACARVAJAL")
> - `customfield_10061` (Componente) = tag técnico del módulo afectado (ej. "AI", "Editor")

## Componentes conocidos (no exhaustivo)

`AI`, `Editor`, `CKEditor`, `Planning`, `Auth`, `Login`, `Perfil`, `Videos`, `Multimedia`,
`Tags`, `Notas`, `Galería`, `Dashboard`, `Notifications`, `Links`, `URL`

> Un nuevo componente puede crearse si se identifica un módulo recurrente no listado.
> Para automatización: usar el nombre del módulo que se testeó en la suite Selenium.

## AccountIds conocidos

| Nombre | accountId | Área |
|--------|-----------|------|
| Juan Tomas Caldera (Juanto) | `712020:59e4ac7b-f44f-45cb-a444-44746cecec49` | QA — reporter default |
| Verónica Tarletta | `5c51d02898c1ac41b4329be3` | Backend / IA / servicios Java |
| Paula Valentina Rodriguez Roberto | `633b5c898b75455be4580f5b` | Frontend Angular |
| Fernando Sismonda | `712020:2a7b50cb-749e-4524-9efe-245bf14c23af` | Dev (mencionar en comentarios) |
| Claudia Tobares | `5c1d65c775b0e95216e8e175` | CKEditor / rich text |

> Para usuarios no listados: `lookupJiraAccountId` con el nombre completo.

## Épicas conocidas

| Key | Summary | Módulo |
|-----|---------|--------|
| NAA-1977 | AI | Funcionalidades de inteligencia artificial |

> Para buscar más épicas: `project = NAA AND issuetype = Epic ORDER BY created DESC`

## Issue link types

| Nombre | Uso QA |
|--------|--------|
| Relates | Vincular ticket Dev_SAAS/cliente con ticket original |
| Blocks | Ticket que bloquea otro |
| Duplicate | Ticket duplicado de otro |
| Cloners | Ticket clonado de otro |

## Ambientes soportados

| Ambiente | Identificador | Cuándo usar |
|----------|---------------|-------------|
| Master | `master` | Entorno de desarrollo — validaciones QA iniciales |
| Dev_SAAS | `dev_saas` | Pre-productivo — validación pre-liberación |
| Cliente específico | `[nombre-cliente]` | Entorno dedicado para un cliente — ej. `"LAURACARVAJAL"` |

> Para ambiente de cliente: usar el nombre del cliente (como aparece en Labels de soporte)
> en el header del comentario. Ej: `"Se valida sobre [NOMBRE CLIENTE] los cambios aplicados:"`

## Statuses y transiciones

Ver `jira-reader/references/transitions.md` para el mapa completo.

**Resumen rápido:**
| Estado | transition.id |
|--------|---------------|
| A Versionar | `42` |
| FEEDBACK | `2` |
| Done | `31` |
| In Progress | `21` |
| To Do | `11` |