---
name: validate-ssot
type: pipeline
invocation: explicit-only
called-by:
  - sync-docs (Paso 8)
  - smart-commit (Paso 10)
  - usuario directo vía instrucción explícita
description: Valida que el modelo SSoT se respete en todo el repositorio BlueStack. Detecta tres tipos de violaciones: lógica funcional embebida en `.md`, JSDoc/TSDoc desincronizado con firmas reales, y skills que referencian `.md` como input lógico primario.
---

# Cuándo invocar
- Cuando el desarrollador lo indique explícitamente
- Antes de un PR o un release importante
- Como paso de verificación después de ejecutar `sync-docs`
- Cuando el pre-commit hook reporte violaciones en `docs/generated/ssot-violations.json`
- Automáticamente desde el Paso 8 de la pipeline `sync-docs`
- Automáticamente desde el Paso 10 de la skill `smart-commit`

---

# Instrucción de ejecución

## Paso 1 — Correr el script de validación
```bash
./node_modules/.bin/tsx scripts/validate-ssot.ts
```

El script imprime en stdout un resumen de la forma:
```
📋 SSoT Validation Report
   Errors: N | Warnings: M
```

## Paso 2 — Leer el reporte generado (condicional)

**Si el stdout reporta `Errors: 0` y `Warnings: 0`:** no leer el JSON — reportar directamente:
```
✅ Modelo SSoT íntegro. No se detectaron violaciones.
```

**Si hay errores o warnings:** leer `docs/generated/ssot-violations.json` para obtener el detalle completo.

## Paso 3 — Clasificar violaciones

Agrupar por severidad:

**ERRORES (bloquean el modelo SSoT):**
- `NO-LOGIC-IN-MD`: archivos `.md` con lógica funcional o definiciones de tipos
- `SKILL-MD-PRIMARY-INPUT`: skills en `.claude/skills/` que usan `.md` como fuente lógica primaria

**WARNINGS (degradan la calidad documental):**
- `JSDOC-PARAM-MISMATCH`: parámetros documentados en JSDoc que no existen en la firma real

## Paso 4 — Verificar falsos positivos

Antes de corregir cualquier violación, verificar si es un **falso positivo**.

**Cómo verificar:**

Para `NO-LOGIC-IN-MD`:
- Leer el archivo `.md` y localizar la línea exacta que disparó el match (abrir el archivo, no inferir)
- Verificar si el patrón detectado está dentro de un inline code span (`` `...` ``), una tabla, o texto descriptivo que menciona código sin definirlo
- **Es falso positivo si:** el patrón aparece en prosa que describe o referencia código, no en una definición funcional real

Para `JSDOC-PARAM-MISMATCH`:
- Leer la firma actual del método en el `.ts`
- Comparar contra el JSDoc reportado
- **Es falso positivo si:** el parámetro existe en la firma pero el scanner no lo detectó por un edge case de parseo

Para `SKILL-MD-PRIMARY-INPUT`:
- Leer la skill y localizar la referencia al `.md` externo
- **Es falso positivo si:** la referencia es a un archivo dentro del directorio de la propia skill (`references/`, `agents/`, `assets/`) o a un README/CLAUDE.md

**Si todas las violaciones son falsos positivos:**
1. Corregir el patrón de detección en `scripts/validate-ssot.ts` para que no los detecte
2. Reportar: `⚠️ Falso positivo corregido en el script de detección. No hay violaciones reales.`
3. **Terminar el flujo aquí.**

**Si hay al menos una violación real:** continuar al Paso 5.

## Paso 5 — Aplicar correcciones automáticamente

Aplicar todas las correcciones sin pedir confirmación, con estas reglas:

**Correcciones automáticas (sin confirmación):**
- `JSDOC-PARAM-MISMATCH` → editar el JSDoc en el `.ts` para alinear con la firma real
- `NO-LOGIC-IN-MD` (contenido en `.md`) → mover o encerrar el contenido problemático en un bloque de código
- `SKILL-MD-PRIMARY-INPUT` → reescribir la referencia en la skill para no depender del `.md` externo

**Requiere confirmación explícita del usuario (único caso donde se pausa el flujo):**
- Cualquier corrección que implique modificar **lógica funcional** en un archivo `.ts` (no solo JSDoc/TSDoc)
- En ese caso: reportar el problema con el formato `[TIPO] archivo → Problema → Corrección propuesta` y preguntar `¿Aplicamos este cambio?`

---

# Contexto específico de BlueStack

Al analizar violaciones en este proyecto, tener en cuenta:

- **`src/pages/`**: las clases de Page Object son la fuente de verdad de la interacción con el CMS. Si hay JSDoc desincronizado acá, es prioridad alta.
- **`src/interfaces/data.ts` y `auth.ts`**: son contratos críticos. Cualquier desincronización con `.md` es error, no warning.
- **`sessions/`**: los archivos `.test.ts` documentan el comportamiento esperado de los flujos. No se validan contra JSDoc — son fuente de verdad por sí mismos.
- **`.claude/skills/`**: las skills usan `.md` para describir su invocación, lo cual es válido. La violación es cuando una skill lee un `.md` externo como input lógico para decidir qué hacer.

# Restricciones
- Aplicar correcciones automáticamente para JSDoc/TSDoc y `.md` — no pedir confirmación
- Pausar y preguntar **solo** si la corrección requiere modificar lógica funcional en un `.ts`
- Si `validate-ssot.ts` no existe todavía, informar que debe crearse primero
- No reportar como violación el uso de `.md` para instrucciones de invocación dentro de `.claude/` — eso es uso válido

# Output esperado
- `docs/generated/ssot-violations.json` — reporte completo de violaciones
- Correcciones aplicadas automáticamente en el repositorio (JSDoc y `.md`)
- Reporte final: violaciones encontradas, falsos positivos descartados, correcciones aplicadas