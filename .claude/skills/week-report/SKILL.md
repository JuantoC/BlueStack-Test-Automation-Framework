---
name: week-report
description: Generar automáticamente el correo semanal de reporte de avance QA, transformando commits técnicos de Git en lenguaje de impacto orientado a negocio. **Agente destino:** Claude Code (Pro empresarial, integrado en VS Code)  **Autor Git filtrado:** `jtcaldera-bluestack` **Output:** `/reports/Mail_Week_Report.txt`

---

# ROL DEL AGENTE AL EJECUTAR ESTA SKILL

Actuás como un **Consultor de Comunicación Técnica Senior**. Tu trabajo es traducir datos técnicos de control de versiones en un reporte ejecutivo claro, profesional y orientado al impacto de negocio. No sos un asistente genérico: sos el redactor del reporte semanal de Juan Caldera para el PM Fernando.

---

# RESTRICCIONES EXPLÍCITAS (LO QUE NO DEBES HACER)

- **NO incluir** nombres de clases TypeScript crudos en el cuerpo del correo (`MainPostPage`, `PostTable`, `Banners`, etc.).
- **NO incluir** hashes de commits, nombres de ramas, ni ninguna terminología Git (`merge`, `branch`, `push`, `refactor` como término técnico visible).
- **NO usar** frases de relleno: "espero que estés bien", "me complace informarte", "a continuación", "en el día de la fecha".
- **NO inventar** impactos de negocio si el commit es ambiguo. Marcar con `[REVISAR]` y continuar.
- **NO generar** el correo si el README.md no se pudo leer — ver sección de excepciones.
- **NO escribir** el archivo si no confirmaste primero el output al usuario en pantalla.

---

# PASOS DE EJECUCIÓN

### Paso 1 — Obtener el parámetro de días

Verificar si el usuario proporcionó un número de días al invocar la skill.  
- Si lo proporcionó: usar ese valor como `DAYS`.  
- Si no: usar `DAYS=7` por defecto.  
- Informar al usuario: `"Analizando commits de los últimos {DAYS} días."`

---

### Paso 2 — Ejecutar el comando Git

Ejecutar en terminal WSL2/Bash:

```bash
DAYS=<DAYS>
AUTHOR="jtcaldera-bluestack"

git log \
  --author="$AUTHOR" \
  --since="${DAYS} days ago" \
  --format="--- COMMIT ---%nDate: %ad%nTitle: %s%nBody:%n%b%n" \
  --date=format:"%d de %B de %Y"
```

Capturar el output completo como texto crudo.

> **Si el comando falla:** ver sección MANEJO DE EXCEPCIONES → *Error Git*.

---

### Paso 3 — Leer el output de commits

Parsear el texto capturado. Cada bloque delimitado por `--- COMMIT ---` es un commit individual. Extraer:
- `Date`: fecha del commit
- `Title`: primera línea (título)
- `Body`: resto del mensaje (puede estar vacío)

Determinar el rango de fechas del período: fecha del commit más antiguo y más reciente del output.

> **Si el output está vacío:** ver sección MANEJO DE EXCEPCIONES → *Sin commits*.

---

### Paso 4 — Leer README.md del root

Leer el archivo `README.md` en la raíz del repositorio para obtener contexto de negocio: propósito del framework, módulos cubiertos, flujos críticos documentados.

Usar este contexto para enriquecer las traducciones del Paso 5 con vocabulario específico del proyecto.

> **Si el README.md no existe:** ver sección MANEJO DE EXCEPCIONES → *README ausente*.

---

### Paso 5 — Traducir commits a lenguaje de negocio

Para cada commit, aplicar la siguiente tabla de traducción. Combinar commits relacionados en un único logro cuando sea apropiado (máximo 6-7 logros en el correo final).

#### TABLA DE TRADUCCIÓN TÉCNICO → NEGOCIO

| Patrón técnico en commit | Traducción orientada a negocio |
|---|---|
| `Add [X] handler / class` | Implementación de [capacidad funcional] que [impacto concreto en el sistema o los flujos] |
| `Refactor / restructure / clean` | Reducción de deuda técnica, mejora de mantenibilidad y escalabilidad del framework |
| `feat: new Page Object / session` | Ampliación de la cobertura automatizada hacia [sección del CMS afectada, inferida del contexto] |
| `fix:` | Corrección de estabilidad en flujos de prueba existentes |
| `Add factory / dynamic data / faker` | Implementación de generación de datos dinámicos, eliminando dependencias estáticas y ampliando la variabilidad de escenarios de prueba |
| `Add/update docs / JSDoc / comments` | Extensión de la documentación técnica interna, mejorando la incorporación de nuevos colaboradores y el mantenimiento futuro |
| `Add skill / rules / agent config / CLAUDE.md` | Incorporación de configuración para el Agente IA de desarrollo, avanzando en la automatización asistida del ciclo de desarrollo QA |
| `Docker / grid / CI / pipeline config` | Mejora de la infraestructura de ejecución paralela y la integración continua del framework |
| `Add test / spec / suite` | Extensión de la cobertura de pruebas hacia [flujo o módulo específico inferido del título] |
| `Add toast / banner / modal` | Implementación del sistema de validación de resultados de operación, garantizando trazabilidad ante errores en flujos críticos |
| `mass publish / bulk` | Extensión de la cobertura hacia flujos de publicación masiva, reduciendo el riesgo de regresión en operaciones editoriales de alto volumen |

**Regla de ambigüedad:** Si un commit no encaja en ningún patrón y el cuerpo no aporta suficiente contexto para inferir el impacto, escribir el logro como `[REVISAR]: {título original del commit}` y continuar.

**Regla de consolidación:** Commits del mismo módulo o flujo en el mismo período pueden agruparse en un único logro si el impacto es el mismo.

---

### Paso 6 — Redactar el correo

Usar el template de abajo. Completar todos los placeholders. Respetar las reglas de voz y tono definidas en esta skill.

**TEMPLATE DEL CORREO:**

```
Asunto: Reporte Semanal — [Titulo ejecutivo y sintactico de lo trabajado]

Buen día Fer,

[RESUMEN_EJECUTIVO — párrafo de 3 a 4 oraciones. Describir el estado general 
del framework en términos de madurez, cobertura y valor para el negocio. 
Mencionar el volumen de trabajo del período sin nombrar métricas de Git. 
Sin tecnicismos crudos. Sin viñetas.]

Logros de la Semana

• **[LOGRO_1_TITULO]**: [descripción de impacto orientada a negocio — 1 oración]
• **[LOGRO_2_TITULO]**: [descripción de impacto orientada a negocio — 1 oración]
• **[LOGRO_N...]**: [...]

Próximos Pasos

• [PROXIMO_PASO_1 — inferido del estado actual del framework y los logros recientes]
• [PROXIMO_PASO_2]
• [PROXIMO_PASO_N...]

Saludos,
Juan Caldera
QA — Bluestack
```

**Reglas de redacción:**
- El resumen ejecutivo es párrafo corrido, nunca viñetas.
- Los títulos de logros van en **negrita**.
- Los próximos pasos son entregables concretos e inferibles del contexto, no frases genéricas como "continuar con el trabajo".
- El período en el asunto se calcula desde la fecha del commit más antiguo hasta el más reciente del output.

---

### Paso 7 — Escribir el archivo

1. Verificar si existe la carpeta `/reports/` en la raíz del repositorio.
   - Si no existe: crearla con `mkdir -p reports`.
2. Escribir el correo redactado en `/reports/Mail_Week_Report.txt`.
   - Sobrescribir si ya existe.

---

### Paso 8 — Confirmar al usuario

Mostrar en pantalla:

```
✅ Reporte generado exitosamente.

Período cubierto: {FECHA_INICIO} al {FECHA_FIN}
Commits procesados: {N}
Logros identificados: {M}
Archivo guardado en: /reports/Mail_Week_Report.txt

--- PREVIEW ---
{primeras 20 líneas del archivo generado}
...
```

---

## MANEJO DE EXCEPCIONES

### Sin commits en el período
```
⚠️  No se encontraron commits del autor 'jtcaldera-bluestack' en los últimos {DAYS} días.
Acciones posibles:
  1. Reinvocar la skill con un rango mayor: "generar reporte de los últimos 14 días"
  2. Verificar que el repositorio tenga historial (git log --oneline)
No se genera ningún archivo.
```

### Error Git (no es repo, permisos, comando no encontrado)
```
❌ Error al ejecutar el comando Git.
Detalle: {stderr capturado}
Verificar:
  - Que el directorio actual es la raíz del repositorio (debe existir .git/)
  - Que Git está instalado en WSL2 (git --version)
  - Que hay permisos de lectura sobre el repositorio
No se genera ningún archivo.
```

### README.md ausente
```
⚠️  No se encontró README.md en la raíz del repositorio.
El correo se generará con contexto de negocio reducido.
Las traducciones pueden ser menos específicas — revisar el output antes de enviar.
Continuar con la generación: [S/N]
```
Esperar confirmación del usuario antes de continuar.

### Carpeta /reports/ sin permisos de escritura
```
❌ No se puede escribir en /reports/. Verificar permisos del directorio.
Detalle: {error del sistema operativo}
```

---

# NOTAS DE MANTENIMIENTO

- Para actualizar la tabla de traducción, editar directamente la sección **TABLA DE TRADUCCIÓN** del Paso 5.
- Para cambiar el destinatario del correo, actualizar el saludo en el template del Paso 6.
- Versionar este archivo en el repositorio junto con el código fuente. Es parte del tooling del equipo.