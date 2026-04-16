---
name: skill-retrospective
description: >
  Proceso interno post-ejecución que Claude aplica por iniciativa propia al finalizar cualquier skill activa
  O cualquier turno donde se editaron archivos o el usuario declaró una convención explícita.
  Cubre cuatro dimensiones: (1) calidad de la skill ejecutada, (2) convenciones explícitas declaradas en la sesión,
  (3) conocimiento nuevo a persistir en wiki/memoria, (4) sincronización de docs ante cambios de código.
  Auto-aplica cambios seguros (memoria, wiki/log.md, adiciones a .md) sin pedir confirmación.
  Solo pregunta para cambios que modifican comportamiento existente o tocan .ts.
  No aplica sobre: skill-retrospective, skill-creator, senior-prompt-engineer.
---

# Skill — Skill Retrospective

Al terminar cualquier skill activa **o** al finalizar cualquier turno donde se editaron archivos `.ts`/`.md` o el usuario declaró una convención, ejecutás este proceso **internamente**. Tenés cuatro lentes de análisis.

Salís del silencio con el reporte solo si encontraste algo concreto y accionable. Los cambios **seguros se aplican automáticamente** sin esperar confirmación (ver §Política de auto-apply).

**No aplica a:** `skill-retrospective` (esta misma), `skill-creator`, `senior-prompt-engineer`.

---

## Política de auto-apply

Antes de cualquier lente, internalizá esta tabla. Define qué se aplica automáticamente y qué espera confirmación:

| Tipo de cambio | Política |
|---|---|
| Crear nueva memoria (`feedback_*`, `reference_*`, `project_*`) | **AUTO-APLICA** — sin preguntar |
| Actualizar memoria existente | **AUTO-APLICA** — sin preguntar |
| Agregar entrada a `wiki/log.md` ([gap], [update], [fix]) | **AUTO-APLICA** — sin preguntar |
| Agregar nueva sección **aditiva** a un `.md` existente (no modifica contenido previo) | **AUTO-APLICA** — sin preguntar |
| Eliminar contenido existente de cualquier archivo | **PREGUNTA** antes de proceder |
| Cambiar la descripción de un comportamiento ya documentado | **PREGUNTA** antes de proceder |
| Modificar cualquier archivo `.ts` | **PREGUNTA** antes de proceder |
| Modificar `CLAUDE.md` o archivos en `.claude/rules/` | **PREGUNTA** antes de proceder |

---

## Lente 4 — Detección de convenciones explícitas *(ejecutar PRIMERO)*

Escaneás la conversación completa buscando frases que indican que el usuario declaró una convención o impuso una corrección:

**Frases trigger:** "de ahora en más", "de ahora en adelante", "siempre que", "la convención es", "nunca más", "acordamos que", "usá siempre", "no, llamalo", "usá X en lugar de Y", "a partir de ahora".

**Correcciones implícitas:** el usuario rechazó código/naming y la razón revela una regla no documentada.

Para cada hallazgo:
1. Verificar si ya está en `wiki/index.md` o en alguna memoria existente.
2. Si no está: **AUTO-APLICA** → crear/actualizar la memoria correspondiente (tipo `feedback_*` si es preferencia de workflow, `reference_*` si es dato de componente, `project_*` si es decisión arquitectural).
3. Evaluar si la convención es **project-wide** (aplica a todo el equipo y código base) o **session-specific** (solo relevante para este contexto).
   - Project-wide → también proponer entrada en `wiki/patterns/conventions.md` (requiere confirmación — modifica `.md` existente con contenido previo).
   - Session-specific → solo memoria, no wiki.

---

## Lente 1 — Calidad de la skill ejecutada

Revisás la ejecución en cuatro dimensiones:

**Anomalías de proceso:** pasos que no pudieron completarse, instrucciones contradictorias, decisiones tomadas fuera del scope, dependencias no documentadas.

**Ambigüedades de regla:** interpretaciones no obvias donde otro camino válido hubiera dado output diferente; edge cases recurribles; criterios vagos aplicados de una forma pero que podrían aplicarse de otra.

**Fricción de output:** secciones que la skill especifica pero fueron redundantes; pasos que faltaron y el contexto demandó; inconsistencias entre lo que la skill dice producir y lo que resultó útil.

**Cobertura faltante:** casos frecuentes sin ejemplo de referencia; reglas implícitas que se aplicaron "porque tiene sentido" pero no están escritas.

---

## Lente 2 — Conocimiento nuevo a persistir

Escaneás la conversación completa (prompts del usuario + outputs propios) buscando:

- **Convenciones declaradas:** el usuario dijo "de ahora en adelante X", "siempre que Y", "la convención es Z"
- **Correcciones que revelan una regla implícita:** el usuario rechazó algo y la razón implica una regla del proyecto no documentada
- **Patrones establecidos en esta sesión:** se tomó una decisión de arquitectura, se definió un naming, se acordó una estructura
- **Comportamientos nuevos del framework:** una función nueva, un flujo nuevo, un tipo nuevo que surgió y no está en la wiki

Para cada hallazgo, verificás si ya está documentado (consultando `wiki/index.md` en contexto o por conocimiento de la sesión). Si no está:

→ Determinás dónde debe ir según `.claude/rules/doc-organization.md`  
→ Lo incluís en el reporte con propuesta concreta de texto

**No persistís:** decisiones one-off, preferencias estéticas, contexto solo válido para esta sesión, cosas ya en el código como JSDoc.

---

## Lente 3 — Sincronización de docs ante cambios de código

Si durante la sesión se modificaron o crearon archivos `.ts`, verificás si sus docs correspondientes necesitan actualización:

| Tipo de cambio | Docs a revisar |
|---|---|
| Nueva acción core (`src/core/actions/`) | `wiki/core/actions.md` |
| Nuevo POM o sub-componente (`src/pages/`) | Wiki page del módulo en `wiki/pages/` |
| Nueva interfaz o tipo (`src/interfaces/`) | `wiki/interfaces/data-types.md` |
| Nuevo helper o util (`src/core/`) | `wiki/core/utils.md` o el archivo correspondiente |
| Nuevo comando relevante (bash, jest, curl) | `.claude/references/COMMANDS.md` |
| Nueva convención de patterns | `wiki/patterns/conventions.md` |

Solo reportás si el gap es real — si el doc existente ya cubre el cambio, no hay nada que hacer.

---

## Criterio de reporte (aplica a las cuatro lentes)

**Reportás** solo si:
1. Hay al menos un hallazgo con impacto en sesiones futuras
2. Tenés una propuesta concreta — no vaga — de qué agregar/modificar/crear

**No reportás** cuando:
- Todo está documentado o cubierto
- Son observaciones estéticas sin impacto funcional
- Es una situación one-off
- La mejora es marginal

**Prioridad:**
- **Alta** (siempre reportar): el hallazgo cambiaría el output de la próxima ejecución, o la información se perdería sin persistirla
- **Media** (reportar si hay evidencia de recurrencia): mismo output pero ejecución más robusta
- **Baja** (solo si ya hay ítems de mayor prioridad): claridad o redacción sin impacto funcional

---

## Formato del reporte

Un bloque único al final de tu respuesta, separado visualmente. Primero listás lo que ya aplicaste, luego lo que necesita confirmación:

```
---
Retrospectiva

✅ APLICADO AUTOMÁTICAMENTE
  [Memory] feedback_X.md — creada/actualizada: [descripción breve]
  [Wiki] wiki/log.md — [tipo]: "[texto agregado]"
  [Wiki] wiki/X.md §Y — sección "[título]" agregada

⚠️ NECESITA CONFIRMACIÓN
  [Skill / Docs Sync / Knowledge / Conventions] — [título breve]
     Dónde:     [skill §sección, o ruta del .md a actualizar]
     Problema:  [qué pasó o qué falta — una oración]
     Propuesta: [texto exacto a agregar, o descripción precisa del cambio]

[...repite si hay más ítems en ⚠️]

¿Aplicamos los cambios pendientes?
```

Si no hay nada en AUTO-APLICADO: omitir esa sección.
Si no hay nada en NECESITA CONFIRMACIÓN: omitir esa sección y no preguntar.
Si ambas secciones están vacías: no mostrar el bloque (silencio total).

---

## Aplicación de cambios confirmados

Si el usuario confirma cambios del bloque ⚠️ (total o parcialmente):

1. Para cambios en skills: `.claude/skills/[nombre]/SKILL.md` — edición puntual, nunca reescritura completa
2. Para cambios en wiki: archivo correspondiente según `wiki/index.md` — edición puntual o sección nueva
3. Para cambios en referencias: `.claude/references/COMMANDS.md` u otra referencia — solo la entrada nueva
4. Confirmás qué se aplicó y qué se descartó

Si el usuario rechaza, descartás sin más. No guardás memoria sobre rechazos de retrospectiva.
