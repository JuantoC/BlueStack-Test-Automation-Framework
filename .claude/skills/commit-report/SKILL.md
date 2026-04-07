---
name: commit-report
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

### Paso 2 — Ejecutar el comando Git

```bash
git log \
  --author="jtcaldera-bluestack" \
  --since="${DAYS} days ago" \
  --format="--- COMMIT ---%nDate: %ad%nTitle: %s%nBody:%n%b%n" \
  --date=format:"%d de %B de %Y"
```

> Si falla → ver MANEJO DE EXCEPCIONES.

### Paso 3 — Parsear commits

Extraer `Title` y `Body` de cada bloque `--- COMMIT ---`.

> Si vacío → ver MANEJO DE EXCEPCIONES.

### Paso 4 — Traducir a bullets

Por cada commit (o grupo de commits del mismo módulo), generar un bullet usando la tabla de traducción. Un commit = un bullet. Commits del mismo módulo con el mismo impacto se consolidan en uno.

#### TABLA DE TRADUCCIÓN

| Patrón en commit | Bullet orientado a negocio |
|---|---|
| `feat:` / new Page Object / session | Ampliación de cobertura automatizada hacia [sección del CMS] |
| `fix:` | Corrección de estabilidad en [flujo afectado] |
| `refactor:` / restructure / clean | Reducción de deuda técnica en [módulo]: [impacto concreto] |
| `Add [X] handler / class` | Implementación de [capacidad funcional]: [impacto] |
| `Add factory / faker / dynamic data` | Generación de datos dinámicos en [módulo], eliminando dependencias estáticas |
| `Add/update docs / JSDoc` | Actualización de documentación técnica en [módulo] |
| `Add skill / rules / CLAUDE.md` | Mejora de configuración del agente IA de desarrollo |
| `Docker / grid / CI` | Mejora de infraestructura de ejecución y CI/CD |
| `Add toast / banner / modal` | Implementación del sistema de validación de resultados en [flujo] |
| `chore:` / config / deps | Mantenimiento de entorno: [descripción breve] |

### Paso 5 — Mostrar en el chat

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
