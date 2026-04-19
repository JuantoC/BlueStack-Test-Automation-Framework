---
name: commit-report
model: haiku
effort: low
description: Lista los puntos trabajados del día (u otro rango) en bullets concisos orientados a negocio, sin resúmenes ni próximos pasos. Output directo en el chat. Autor Git filtrado: `jtcaldera-bluestack`.
---

# ROL

Traducir commits técnicos en bullets claros orientados a negocio. Sin introducciones, sin resúmenes, sin próximos pasos — solo la lista.

---

# RESTRICCIONES

- **NO incluir** nombres de clases TypeScript crudos (`MainPostPage`, `Banners`, etc.).
- **NO incluir** hashes, nombres de ramas ni terminología Git cruda.
- **NO usar** frases de relleno ni introducciones.
- **NO agregar** resumen ejecutivo, logros titulados ni próximos pasos.
- **NO inventar** impacto si el commit es ambiguo — marcar `[REVISAR]: {título}` y seguir.
- **NO escribir** ningún archivo. Todo el output va al chat.

---

# PASOS DE EJECUCIÓN

### Paso 1 — Obtener el parámetro de días

- `"hoy"` / `"del día"` → `DAYS=1`
- `"últimos N días"` → `DAYS=N`
- Sin parámetro → `DAYS=7`

### Paso 2 — Ejecutar commit-parser

```bash
./node_modules/.bin/tsx scripts/skills/commit-parser.ts --author jtcaldera-bluestack --days ${DAYS}
```

El JSON resultante incluye un array de objetos con `hash`, `date`, `type`, `module`, `title`, `body` y `businessBullet` ya generado. Si el array está vacío → ver MANEJO DE EXCEPCIONES.

> Si el comando falla (git no disponible, no es un repo) → ver MANEJO DE EXCEPCIONES.

### Paso 3 — Revisar y ajustar bullets

Recorrer el array del parser. Para cada commit:

- Si `businessBullet` empieza con `[REVISAR]:` → el parser no pudo clasificarlo. Generar el bullet manualmente usando el `title` y `module` disponibles en el objeto.
- Commits del mismo `module` con el mismo `type` e impacto idéntico → consolidar en un solo bullet.
- Ajustar el idioma si el usuario pidió un tono específico (formal, conversacional).

### Paso 4 — Mostrar en el chat

Agrupar los bullets por `date` (campo ISO del JSON, convertir a formato español: `2026-04-07` → `07 de abril de 2026`).

Formato exacto:

```
**{FECHA}** — {N} cambios

- [bullet 1]
- [bullet 2]
- [bullet N...]
```

Sin encabezados adicionales. Sin secciones. Solo el encabezado de fecha y los bullets.

---

## MANEJO DE EXCEPCIONES

**Sin commits:**
```
⚠️ Sin commits de 'jtcaldera-bluestack' en el período indicado.
```

**Error Git:**
```
❌ Error al ejecutar Git. Verificar que el directorio es la raíz del repo y que Git está disponible.
```
