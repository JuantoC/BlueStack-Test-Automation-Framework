---
name: audit-docs
description: Audita todas las fuentes de verdad del repositorio BlueStack y produce un inventario clasificado de inconsistencias entre código TypeScript, JSDoc/TSDoc y archivos .md. Invocar cuando el usuario diga "auditá la documentación", "revisá el estado documental", "qué está desincronizado", o como primer paso antes de cualquier tarea de limpieza o migración documental, o cuando se sospeche que hay .md con contenido que debería estar en el código
---

# Instrucción al agente

Ejecutá la auditoría documental del proyecto con estos pasos en orden:

1. Corré `./node_modules/.bin/tsx scripts/audit-docs.ts` en la terminal
2. Leé el archivo generado en `docs/audit/doc-audit.json`
3. Producí un resumen en `docs/audit/AUDIT-SUMMARY.md` con estas secciones:
   - **Archivos .md con lógica embebida** (riesgo alto): listado con path y descripción del problema
   - **Skills con dependencia primaria en .md**: listado con path y qué .md consumen
   - **Inconsistencias JSDoc/TSDoc**: función, archivo, parámetros desincronizados
   - **Acción recomendada por ítem**: migrar al código / eliminar / conservar como contextual
4. NO modifiques ningún archivo fuera de `docs/audit/` en esta fase
5. Reportá el conteo de ítems por categoría al finalizar

## Artefactos de salida

| Artefacto | Ruta | Formato |
|-----------|------|---------|
| Inventario completo | `docs/audit/doc-audit.json` | JSON estructurado |
| Resumen ejecutivo | `docs/audit/AUDIT-SUMMARY.md` | Markdown legible |

---

# FASE 2 — Redefinición de Arquitectura Documental

**Objetivo**: Establecer el modelo canónico de dos capas con contratos explícitos.

## El modelo de dos capas
```
┌─────────────────────────────────────────────────────────────┐
│  CAPA DE VERDAD (Source of Truth)                           │
│  ─────────────────────────────────────────────────────────  │
│  • Tipos TypeScript e interfaces                            │
│  • Firmas de funciones y contratos                          │
│  • JSDoc/TSDoc (parametros, retornos, @throws, @example)    │
│  • Tests (comportamiento observable documentado)            │
│  • Archivos de configuración tipados                        │
│                                                             │
│  Autoridad: ABSOLUTA. Comportamiento real del sistema.      │
└─────────────────────────────────────────────────────────────┘
           ↓ genera / es descrita por
┌─────────────────────────────────────────────────────────────┐
│  CAPA DESCRIPTIVA (Contextual Layer)                        │
│  ─────────────────────────────────────────────────────────  │
│  • README.md — onboarding, propósito, setup                 │
│  • CONTRIBUTING.md — convenciones de contribución           │
│  • docs/architecture/*.md — decisiones arquitectónicas      │
│  • docs/guides/*.md — guías de uso para humanos             │
│  • .claude/*.md — instrucciones al agente                   │
│                                                             │
│  Autoridad: CONTEXTUAL. No vinculante a nivel funcional.    │
│  Siempre subordinada al código cuando hay conflicto.        │
└─────────────────────────────────────────────────────────────┘
```

### Qué DEBE migrar al código desde `.md`

| Contenido en `.md` actualmente | Destino en el código |
|-------------------------------|---------------------|
| Definición de contratos de entrada/salida | Interfaces/types TypeScript |
| Reglas de negocio expresadas en prosa | JSDoc `@remarks` + tipos discriminados |
| Enumeraciones de estados posibles | `enum` o `const` objects TypeScript |
| Esquemas de configuración | Tipos TS + Zod schema con `.describe()` |
| Invariantes del sistema | `@invariant` en JSDoc o assertions en código |
| Parámetros de funciones de skills | Tipos de input/output en TS |

### Qué DEBE y NO DEBE estar en `.md`

**DEBE estar:**
- Contexto histórico de decisiones (`why`, no `what`)
- Guías de onboarding para nuevos desarrolladores
- Instrucciones de setup del entorno
- Convenciones de equipo no expresables como tipos
- Decisiones arquitectónicas (Architecture Decision Records)
- Instrucciones al agente Claude Code

**NO DEBE estar:**
- Definiciones de tipos o estructuras de datos
- Lógica condicional o flujos de control
- Contratos de entrada/salida de funciones
- Enumeraciones de valores válidos
- Reglas de validación

### Convención de estructura y nombrado para `.md` restantes
```
docs/
├── audit/              ← generado por el agente, no editar manualmente
├── architecture/       ← ADRs: YYYYMMDD-titulo-decision.md
├── guides/             ← guías de uso: kebab-case.md
└── api/                ← generado por typedoc, no editar manualmente

.claude/
├── CLAUDE.md           ← instrucciones persistentes del agente
├── rules/              ← restricciones operacionales: REGLA-nombre.md
└── skills/             ← automatizaciones: verb-noun.md

README.md               ← root, solo onboarding y links a docs/
CONTRIBUTING.md         ← convenciones de contribución
CHANGELOG.md            ← generado/asistido, no fuente de verdad