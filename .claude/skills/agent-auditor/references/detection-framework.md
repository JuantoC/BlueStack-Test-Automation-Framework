# Framework de Detección — Arquitectura de Agentes

Patrones de violación arquitectural a buscar en cualquier agente de `.claude/agents/`.
Este framework es reutilizable: no asume conocimiento de auditorías anteriores.

---

## Patrones de detección

### [MONOLITO-DATOS]
Tabla, lista o bloque de datos con >5 entradas que contiene:
- IDs numéricos (transiciones, customfields, IDs de Jira)
- Nombres propios de personas, componentes o equipos que pueden cambiar
- URLs o paths hardcodeados

→ Proponer extracción a `references/<nombre-descriptivo>.md` o `.json`

### [MONOLITO-NEGOCIO]
Bloque de >15 líneas que describe reglas de negocio específicas del CMS
(no el comportamiento del agente) y que quedaría desactualizado si el CMS cambia.

→ Proponer extracción a `wiki/` o `references/`

### [DOCS-HUMANOS]
Sección con instrucciones para personas, no para el agente.
Señales: "Este proceso requiere...", "Para el equipo...", "Paso manual:", procedimientos de revisión.

→ Proponer extracción a `wiki/` con nota de deprecación en el agente

### [ROL-AUSENTE]
Las primeras 20 líneas del archivo no contienen una declaración de ≤3 líneas que responda:
qué hace este agente / cuándo se activa / qué produce.

→ Proponer agregar sección `## Rol` al inicio del archivo

### [POINTER-AUSENTE]
El agente no tiene instrucción explícita de consultar:
- `wiki/index.md` antes de operar (wiki-first protocol)
- Sus propios `references/` cuando existen

→ Proponer agregar las instrucciones de lectura correspondientes

### [REFERENCIAS-ROTAS]
Cualquier path referenciado en el agente que no existe en disco (verificar con Glob).

→ CRÍTICO — reportar con path exacto, proponer fix o eliminación del puntero

---

## Cómo aplicar

Para cada agente auditado:
1. Leer el archivo completo
2. Buscar activamente cada uno de los 6 patrones
3. Para cada hallazgo: registrar evidencia de línea + proponer edit concreto
4. Si un patrón no aplica: registrar "no aplica" explícitamente (no omitir)