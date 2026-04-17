# Wiki Audit — Análisis Old Skill: Lookup "Retry Boundary" (R6)

**Fecha del análisis:** 2026-04-17  
**Skill ejecutada:** wiki-audit (snapshot anterior, R6 + checklist-philosophy.md sin B5/B6)  
**Foco:** ¿Puede un agente encontrar la convención de "retry boundary" con una sola lectura, sin ambigüedad?

---

## Metodología (según R6 anterior)

La skill R6 ejecutaba dos partes:

- **Parte A:** Verificar que el rol de la wiki esté documentado (propósito, cómo usarla, qué va y no va)
- **Parte B:** Verificar eficiencia de la wiki como contexto para IA:
  - B1: Cobertura del índice (páginas huérfanas)
  - B2: Tabla de referencias rápidas (completitud)
  - B3: Densidad de páginas (>300 líneas sin resumen)
  - B4: Duplicaciones conceptuales

Para este análisis, se enfocó el agente en: **¿Dónde vive "retry boundary" en la wiki y cuál es el lookup path más eficiente?**

---

## Hallazgos

### H1 — "Retry Boundary" está disperso en 3 páginas (Duplicación conceptual)

| Página | Ubicación | Contenido |
|--------|-----------|----------|
| `wiki/patterns/conventions.md` | § "Retry Boundary — distinción de tiers" (línea 162) | Tabla de contexto/logger levels, puntero a logging.md para detalle |
| `wiki/core/logging.md` | § "Concepto: Retry Boundary" (línea 87) | Definición completa, reglas 1a/1b/2, cómo detectar (3 pasos) |
| `CLAUDE.md` | § "Reglas de Código" (línea 9-11) | Una línea + dos punteros a wiki/ |

**Clasificación R6:** `[DUPLICACION-FILOSOFIA]` (MEDIA)

---

### H2 — El índice (`wiki/index.md`) NO referencia "Retry Boundary" explícitamente

**Búsqueda realizada:**
- En `wiki/index.md`, sección "References rápidas": 0 coincidencias con "retry" / "boundary" / "error handling"
- En la lista de "Páginas disponibles": mención implícita en `[core/logging.md]` pero SIN mención a "Retry Boundary" en la descripción

**Impacto R6 B2:** `[REFS-RAPIDAS-GAP]` (MEDIA)
- La tabla de referencias rápidas no tiene entrada para "Entender manejo de errores y retry boundary"
- Un agente buscando cómo manejar excepciones debe leer el índice, interpretar que está en logging.md, abrir logging.md y buscar la sección

---

### H3 — El lookup path actual requiere decisiones intermedias (No es "una sola lectura")

**Escenario: agente necesita entender "retry boundary"**

Opción A (peor):
1. Leer `wiki/index.md` → buscar "retry" → 0 resultados
2. Leer `core/logging.md` description → ve "Convenciones Winston · niveles · anti-patrones · arquitectura de capas"
3. Abre `core/logging.md` → busca "retry" → encuentra § "Concepto: Retry Boundary" (línea 87)

Opción B (intermedia):
1. Leer `wiki/patterns/conventions.md` descripción en index → ve "Arquitectura 2 capas · constructores · locators · step() · imports .js · anti-patrones"
2. Abre `patterns/conventions.md` → busca "retry" → encuentra § "Retry Boundary" (línea 162)
3. Lee la tabla, luego DEBE seguir el puntero a logging.md para la "definición completa"

Opción C (basada en CLAUDE.md):
1. Leer `CLAUDE.md` § "Reglas de Código" (línea 9-11)
2. Ve puntero a `wiki/patterns/conventions.md` y `wiki/core/logging.md`
3. Abre ambas → duplicación de concepto

**Clasificación R6 B1:** Página de `logging.md` está referenciada en index pero SIN mención a su subsección crítica de retry boundary. No es huérfana pero es **opaca en el índice**.

---

### H4 — Contenido: tabla en conventions.md vs. definición en logging.md

**conventions.md (línea 162-171):**
```
### Retry Boundary — distinción de tiers

| Contexto | logger.error() | logger.debug() | Rethrow |
|----------|---|---|---|
| Dentro del lambda de retry() | Prohibido | Permitido | Obligatorio |
| Boundary externo | Obligatorio | Opcional | Obligatorio |

Ver wiki/core/logging.md — sección "Concepto: Retry Boundary" para el detalle completo...
```

**logging.md (línea 87-105):**
```
## Concepto: Retry Boundary

Un retry boundary es el punto donde retry() es la capa de manejo de errores más externa...

**Dentro del retry boundary** (dentro del lambda):
- [explicación detallada]

**Fuera / en el borde**:
- [explicación detallada]

**Cómo detectar si un catch está dentro**:
1. ¿El archivo está en src/core/actions/? → Siempre dentro
2. ¿El método en src/pages/ abre con return await retry()?
3. ¿El catch está FUERA?
```

**Análisis:**
- conventions.md ofrece una tabla compacta pero ambigua ("dentro" vs "fuera" requieren entender el contexto del lambda)
- logging.md ofrece definición precisa + heurística de detección
- Para un agente que necesita entender **cómo aplicar la regla**, logging.md es el documento canónico
- Para un agente que necesita un quick lookup de "cuándo usar logger.error", conventions.md es suficiente

**Clasificación R6 B4:** Duplicación conceptual pero con propósito diferenciado. La sección en conventions.md es un resumen; la de logging.md es el detalle. Esto es correcto SOLO SI:
1. El índice marca explícitamente que conventions.md es el "resumen de logging" (actualmente no lo hace)
2. La tabla en conventions.md tiene un puntero claro y no ambiguo (tiene, línea 171)

---

### H5 — Accesibilidad: ¿puede un agente encontrarlo con UNA lectura?

**Test de lectura única:**

| Punto de entrada | Lectura 1 | ¿Encuentra retry boundary? | Claridad |
|---|---|---|---|
| wiki/index.md | Índice completo | Implícito en logging.md pero no explícito | 🔴 No (requiere asumir que está en logging.md) |
| wiki/patterns/conventions.md | Abre directo | Sí, en § "Retry Boundary" (línea 162) | 🟢 Sí (claro) |
| wiki/core/logging.md | Abre directo | Sí, en § "Concepto: Retry Boundary" (línea 87) | 🟢 Sí (muy detallado) |
| "Buscar en wiki.md por 'retry'" | Grep sobre wiki/ | Encuentra 3 archivos (conventions, logging, log.md) | 🟡 Parcial (ambigüedad de cuál es canónico) |

**Hallazgo crítico:** Un agente que comienza por el índice (protocolo wiki-first) **NO encontrará explícitamente "retry boundary" en una sola lectura**.

---

## Conformidad con checklist-philosophy (R6 vieja)

### Parte A — ¿Rol de la wiki documentado?

**Criterios B1-B4 aplicados:**

| Criterio | Status | Detalle |
|----------|--------|---------|
| B1 — Existe sección "Filosofía de la wiki" en index.md | ❌ FAIL | No existe |
| B1a — Declara para qué sirve y para quién | ❌ FAIL | Protocolo wiki-first está en index.md pero no hay sección dedicada al propósito |
| B1b — Menciona que TypeScript sigue siendo SSOT | ❌ FAIL | Está en CLAUDE.md pero no en wiki/index.md |
| B1c — Explica qué va/no va en wiki/ | ⚠️ PARTIAL | Parcialmente en doc-organization.md (referenciado desde CLAUDE.md pero no desde wiki/index.md) |
| B1d — Referencia doc-organization.md | ⚠️ PARTIAL | CLAUDE.md la referencia; wiki/index.md no |

**Clasificación:** `[ROL-NO-DOCUMENTADO]` (ALTA) — No existe una sección explícita en `wiki/index.md` declarando la filosofía de la wiki

---

### Parte B — Eficiencia de lookup

#### B1 — Cobertura del índice

**Resultado:** Sin páginas huérfanas. Todas las páginas .md bajo wiki/ están referenciadas en wiki/index.md.

#### B2 — Tabla de referencias rápidas

**Resultado:** La tabla existe y cubre 11 flujos. **Gap detectado:**
- "Entender error handling y retry boundary" NO está en la tabla
- Debería haber una entrada como: `| Manejar excepciones / retry boundary | [wiki/core/logging.md § Concepto: Retry Boundary](../core/logging.md#concepto-retry-boundary) |`

**Clasificación:** `[REFS-RAPIDAS-GAP]` (MEDIA)

#### B3 — Densidad de páginas

**Páginas revisadas:**
- `wiki/core/logging.md`: 176 líneas (>300 umbral?) NO, pero densa conceptualmente
- `wiki/patterns/conventions.md`: 405 líneas — **DENSA** (sin resumen ejecutivo)
- `wiki/qa/pipeline-integration-schema.md`: similar densidad

**Para conventions.md:** secciones tienen encabezados pero el archivo no tiene un resumen ejecutivo arriba que diga "Esta página cubre: patrón POM de 2 capas, constructores, locators, error handling y retry boundary, step(), imports ESM, etc."

**Clasificación:** Parcial. conventions.md podría beneficiarse de un índice interno.

#### B4 — Duplicaciones conceptuales

**Encontradas:**
1. "Retry Boundary" → conventions.md línea 162 + logging.md línea 87 (tabla + detalle)
2. "Logger levels" → logging.md § "Cuándo usar cada nivel" (completo) (actualmente no está en index.md como entry point claro)
3. "Error handling" → conventions.md § "Manejo de errores obligatorio" (patrones) + logging.md (niveles)

**Clasificación:** `[DUPLICACION-FILOSOFIA]` (MEDIA) — Correcto pero requiere claridad en el índice sobre cuál es el punto de entrada principal

---

## Conclusión: Análisis Old Skill

### ¿Puede un agente encontrar "retry boundary" sin ambigüedad con una sola lectura?

**Respuesta: NO definitivamente, NO moderadamente.**

**Razones:**

1. **wiki/index.md no menciona "retry boundary" explícitamente** — el protocolo wiki-first dice "leer index.md primero", pero el índice no cubre este concepto en su tabla de referencias rápidas

2. **Retry boundary está distribuido en dos páginas sin jerarquía clara:**
   - conventions.md tiene la tabla (resumen)
   - logging.md tiene el detalle
   - El índice no declara cuál es el punto de entrada principal

3. **Lookup path requiere decisiones:**
   - Leer index → ver logging.md en la lista → asumir que contiene "retry boundary" → abrir logging.md → buscar "retry" → encontrar

4. **CLAUDE.md añade ambigüedad:**
   - Regla "Nunca silenciar errores" apunta a DOS lugares diferentes
   - No hay single source of truth declarado

5. **No hay sección "Filosofía de la wiki" en index.md:**
   - Según R6 anterior, esto es un `[ROL-NO-DOCUMENTADO]` ALTA
   - Sin esa sección, el agente no sabe por qué la wiki está organizada así

### Severidad para AI-Efficiency Audit

| Issue | Severidad | Impacto |
|-------|-----------|---------|
| ROL-NO-DOCUMENTADO | ALTA | Agente no entiende propósito de wiki → lee de forma ineficiente |
| PAGINA-DENSA (conventions.md) | MEDIA | Requiere múltiples lecturas para encontrar un concepto |
| REFS-RAPIDAS-GAP (retry boundary) | MEDIA | "Retry boundary" no tiene entrada en tabla → requiere deducción |
| DUPLICACION-FILOSOFIA (retry boundary) | MEDIA | Dos páginas sobre el mismo concepto, sin jerarquía clara en index |

### Resumen ejecutivo: Lo que hacía la skill anterior

La skill R6 **anterior** (snapshot):
1. ✅ Detectaba duplicaciones conceptuales comparando la redacción en múltiples archivos
2. ✅ Verificaba la completitud de wiki/index.md § "Referencias rápidas" con heurísticas de flujos frecuentes
3. ✅ Buscaba la sección "Filosofía de la wiki" y reportaba si no existía
4. ✅ Identificaba páginas densas (>300 líneas sin resumen ejecutivo)
5. ✅ Generaba reportes con formato `[TIPO-ISSUE]` clasificados por severidad

Lo que **NO hacía** (o hacía de forma limitada):
- ❌ Analizar lookup paths explícitamente (cuántas lecturas requiere encontrar un concepto)
- ❌ Evaluar "ambigüedad" de forma estructurada (solo reportaba duplicaciones)
- ❌ Medir eficiencia desde el perspectivo "un agente abre el archivo X, puede encontrar Y sin abrir otro archivo"
- ❌ Considerar el orden/jerarquía de referencias (qué archivo es canónico vs cuál es resumen)

### Recomendación para la skill nueva

Para que la wiki sea eficiente para lookups sin ambigüedad:

1. **Agregar § "Filosofía de la wiki" a wiki/index.md** (usar template de checklist-philosophy.md)
2. **Agregar entrada "Manejo de errores / retry boundary" a la tabla de referencias rápidas** apuntando a logging.md § Concepto
3. **Consolidar duplic ación:** conventions.md tabla + logging.md detalle es correcto, pero index.md debe declarar que logging.md es la fuente canónica
4. **Agregar resumen ejecutivo a conventions.md** (primeras 10 líneas: qué cubre esta página)

---

## Archivos analizados (lectura 1 cada uno)

- `/home/jutoc/proyectos/BlueStack-Test-Automation-Framework/wiki/index.md`
- `/home/jutoc/proyectos/BlueStack-Test-Automation-Framework/wiki/patterns/conventions.md`
- `/home/jutoc/proyectos/BlueStack-Test-Automation-Framework/wiki/core/logging.md`
- `/home/jutoc/proyectos/BlueStack-Test-Automation-Framework/.claude/CLAUDE.md`
- `/home/jutoc/proyectos/BlueStack-Test-Automation-Framework/.claude/skills/wiki-audit-workspace/skill-snapshot/references/checklist-philosophy.md`

---

**Reporte generado por:** Old Skill R6 Emulation  
**Timestamp:** 2026-04-17  
**Modo:** report (solo análisis, sin fixes)
