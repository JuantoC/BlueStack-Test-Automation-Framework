---
name: validate-ssot
description: Valida que el modelo SSoT se respete en todo el repositorio BlueStack. Detecta tres tipos de violaciones: lógica funcional embebida en `.md`, JSDoc/TSDoc desincronizado con firmas reales, y skills que referencian `.md` como input lógico primario.
---

# Cuándo invocar
- Cuando el desarrollador diga "validá el SSoT", "chequeá inconsistencias", "hay algo roto en la documentación"
- Antes de un PR o un release importante
- Como paso de verificación después de ejecutar `sync-docs`
- Cuando el pre-commit hook reporte violaciones en `docs/audit/ssot-violations.json`

---

# Instrucción de ejecución

## Paso 1 — Correr el script de validación
```bash
npx ts-node scripts/validate-ssot.ts
```

## Paso 2 — Leer el reporte generado
Leer `docs/audit/ssot-violations.json`.

## Paso 3 — Clasificar y presentar violaciones

Presentar los resultados agrupados por severidad:

**ERRORES (bloquean el modelo SSoT):**
- `NO-LOGIC-IN-MD`: archivos `.md` con lógica funcional o definiciones de tipos
- `SKILL-MD-PRIMARY-INPUT`: skills en `.claude/skills/` que usan `.md` como fuente lógica primaria

**WARNINGS (degradan la calidad documental):**
- `JSDOC-PARAM-MISMATCH`: parámetros documentados en JSDoc que no existen en la firma real

Para cada violación, mostrar:
```
[TIPO] archivo/path
→ Problema: descripción
→ Acción recomendada: qué hacer para resolverlo
```

## Paso 4 — Proponer correcciones
Para cada violación encontrada, proponer la corrección concreta:

- **`NO-LOGIC-IN-MD`**: identificar qué contenido debe migrarse al código y a qué archivo `.ts`
- **`JSDOC-PARAM-MISMATCH`**: mostrar el JSDoc actual vs. la firma real, proponer el JSDoc corregido
- **`SKILL-MD-PRIMARY-INPUT`**: identificar qué línea de la skill hace referencia al `.md` como input lógico y proponer la reescritura

## Paso 5 — Preguntar antes de actuar
Mostrar todas las correcciones propuestas y preguntar: *"¿Corregimos alguna de estas violaciones?"*

Aplicar **solo lo que el desarrollador confirme**, en el orden que indique.

---

# Contexto específico de BlueStack

Al analizar violaciones en este proyecto, tener en cuenta:

- **`src/pages/`**: las clases de Page Object son la fuente de verdad de la interacción con el CMS. Si hay JSDoc desincronizado acá, es prioridad alta.
- **`src/interfaces/data.ts` y `auth.ts`**: son contratos críticos. Cualquier desincronización con `.md` es error, no warning.
- **`sessions/`**: los archivos `.test.ts` documentan el comportamiento esperado de los flujos. No se validan contra JSDoc — son fuente de verdad por sí mismos.
- **`.claude/skills/`**: las skills usan `.md` para describir su invocación, lo cual es válido. La violación es cuando una skill lee un `.md` externo como input lógico para decidir qué hacer.

# Restricciones
- No modificar ningún archivo sin confirmación explícita del desarrollador
- Si `validate-ssot.ts` no existe todavía, informar que debe crearse primero (Fase 6 del plan SSoT)
- No reportar como violación el uso de `.md` para instrucciones de invocación dentro de `.claude/` — eso es uso válido

# Output esperado
- `docs/audit/ssot-violations.json` — reporte completo de violaciones
- Resumen presentado al desarrollador con correcciones propuestas