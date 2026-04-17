# Patrón: URL de validación provista por dev

## Qué es

Algunos tickets de backend incluyen una URL de prueba específica que el desarrollador prepara para que QA pueda validar el comportamiento sin tener que navegar el flujo completo del CMS. Estas páginas suelen ser JSP desplegadas en `dev.cms-medios.com/ISSUES/`.

## Cómo identificarla

El ticket-analyst la detecta en:
- Campo `description` del ticket: buscar URLs del patrón `https://dev.cms-medios.com/ISSUES/...`
- Comentarios de dev: frases como "pueden validar en:", "URL de prueba:", "la validación se hace en"
- Campo custom de validación (si existe)

Se registra en `jira_metadata.validation_url_from_dev` del `ticket_analyst_output`.

## Acceso

Estas páginas suelen tener Basic Auth de Apache. Las credenciales se proveen en el prompt del usuario al invocar `/pipeline-run`:

```
USER: tfsadmin
PASS: <password>
```

El pipeline-run las captura en PR-1 y las pasa al qa-orchestrator → ticket-analyst (TA-3c).

**Construcción del header:**
```bash
curl -u "user:pass" "https://dev.cms-medios.com/ISSUES/..."
```

## Qué extraer de la página

Una vez accedida, la página suele contener:

1. **Instrucciones de validación** — qué escenarios probar (video CON/SIN la propiedad, fallback, formato descriptivo)
2. **Tabs por componente** — cada tab corresponde a un criterio de aceptación diferente
3. **Formularios con parámetros** — qué inputs ingresar para cada caso de prueba
4. **Resultados esperados** — qué columnas verificar y qué diferencias observar

El ticket-analyst (TA-3c) extrae este contenido y lo mapea a `manual_test_guide[]` del `escalation_report`.

## Qué NO hacer

- No reportar en Jira errores de acceso propios del pipeline (curl throttling, timeout) como si fueran errores del servidor
- No asumir que el servidor está caído si el acceso falla desde el pipeline — verificar primero si el acceso funciona manualmente
- No reemplazar los criterios del ticket con el contenido de la URL — enriquecer los criterios existentes

## Ejemplo real: NAA-4464

**URL:** `https://dev.cms-medios.com/ISSUES/videos/newstagsVideos.jsp`  
**Ticket:** Modificaciones de News-Tags — `ultimaModificacion` en Videos  
**Contenido de la página:** Dos tabs — `nt:video` (video individual con todos sus campos, incluido el nuevo tag) y `nt:video-list` (lista con nuevo ordenamiento `user-modification-date`)  
**Aprendizaje:** La página ya tenía los 5 casos de prueba organizados con instrucciones, precondiciones y resultados esperados — el pipeline los extrajo y los usó para construir la guía de testing manual del comentario Jira.

## Pipeline de procesamiento

```
PR-1: capturar credenciales del usuario
  ↓
ORC-2: pasar credenciales al ticket-analyst
  ↓
TA-3c: detectar URL → acceder con Basic Auth → extraer casos de prueba
  ↓
TA-4: enriquecer acceptance_criteria[] y manual_test_guide[]
  ↓
TR-E: comentario Jira con guía completa derivada de la página del dev
```
