# Wiki Audit — TC1: Lookup Path para "Retry Boundary"

Ejecutado con: wiki-audit v2 (con R7 + B5/B6)

---

## 1. Archivos wiki que mencionan "Retry Boundary"

Se identificaron **3 ubicaciones** con contenido sobre retry boundary:

| Archivo | Secciones | Líneas dedicadas | Nivel de detalle |
|---------|-----------|-----------------|-----------------|
| `wiki/core/logging.md` | **Sección canónica:** "Concepto: Retry Boundary" + anti-patrones | ~40 líneas | **COMPLETO** — Definición autorizada, reglas 1a/1b/2/3, tabla contexto-comportamiento, cómo detectar si un catch está dentro del boundary, anti-patrones con correcciones |
| `wiki/patterns/conventions.md` | **Referencia delegada:** "Retry Boundary — distinción de tiers" (líneas 162-171) | ~10 líneas | **DELEGADO** — Tabla comparativa + link explícito a logging.md "para el detalle completo, reglas numeradas y anti-patrones" |
| `wiki/log.md` | Histórico de actualización | Menciones contextuales | **REFERENCIAS** — No define, solo documenta cambios |

---

## 2. Entry point en wiki/index.md § "Referencias rápidas"

**NO existe entry point directo para "retry boundary"** en la tabla de referencias rápidas.

Hay una entrada genérica:
```
| Cuándo usar cada nivel de log | [core/logging.md](core/logging.md) |
```

Pero NO hay una entrada específica:
```
| Entender retry boundary / manejo de errores en retry | [core/logging.md](core/logging.md) § Concepto: Retry Boundary |
```

---

## 3. Jerarquía de fuentes

**Jerarquía CLARA entre páginas:**

1. **Fuente canónica:** `wiki/core/logging.md` § "Concepto: Retry Boundary"
   - Definición autoritativa completa
   - 3 criterios para detectar si un catch está dentro del boundary
   - Tabla comportamiento dentro/fuera del lambda
   - Anti-patrones con soluciones

2. **Fuente secundaria/delegada:** `wiki/patterns/conventions.md` § "Retry Boundary — distinción de tiers"
   - Redirige explícitamente: "Ver wiki/core/logging.md — sección 'Concepto: Retry Boundary' para el detalle completo"
   - Agrega contexto POM específico
   - No duplica — referencia clara

3. **Histórico:** `wiki/log.md` — solo cambia documentados, no es fuente de consulta

---

## 4. Análisis R7 — B5 Lookup Path

```
[LOOKUP-AMBIGUO] retry boundary:
  - Páginas con detalle suficiente: 2 (logging.md canónica, conventions.md delegada)
  - Jerarquía entre páginas: CLARA (conventions.md apunta explícitamente a logging.md)
  - Entry point en wiki/index.md § "Referencias rápidas": AUSENTE
  - Navegación necesaria: 2 pasos (index → "nivel de log" → logging.md → buscar sección)
  - Problema: el agente sin conocimiento previo no sabe que "retry boundary" cae bajo "Cuándo usar cada nivel de log"
```

---

## 5. Clasificación final

**`[LOOKUP-AMBIGUO]` — Necesita acción**

**Justificación:**
1. ✅ El concepto está bien documentado (fuente canónica clara en logging.md)
2. ✅ La jerarquía entre páginas es explícita (conventions.md → logging.md)
3. ❌ Falta entry point directo en `wiki/index.md` § "Referencias rápidas"
4. ❌ Un agente sin conocimiento previo no sabe que "retry boundary" está bajo "nivel de log"
5. La consulta "¿cómo funciona retry boundary?" requiere 2 navegaciones mentales antes de acertar

**Acción recomendada:**
Agregar fila a la tabla de referencias rápidas en `wiki/index.md`:
```markdown
| Entender retry boundary / errores en retry | [core/logging.md](core/logging.md) § Concepto: Retry Boundary |
```

---

## Resumen cuantitativo

| Métrica | Valor |
|---------|-------|
| Páginas wiki con cobertura retry boundary | 3 (logging.md, conventions.md, log.md) |
| Fuentes con detalle suficiente | 2 (logging.md canónica, conventions.md delegada) |
| Fuente canónica identificada | SÍ — core/logging.md |
| Entry point en referencias rápidas | ❌ AUSENTE |
| Jerarquía clara entre páginas | ✅ SÍ |
| Análisis de lookup paths ejecutado (R7/B5) | ✅ SÍ |
| Clasificación | **[LOOKUP-AMBIGUO]** |