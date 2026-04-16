# Respuesta natural a "ejecutar pipeline"

Para ejecutar el pipeline QA necesito un poco más de contexto. ¿Qué ticket de Jira querés correr?

La forma habitual es:

```
ejecutar pipeline NAA-XXXX
```

Si ya tenés el número de ticket, indicámelo y arranco con el flujo completo:
1. `ticket-analyst` — leer y clasificar el ticket
2. `test-engine` — ejecutar los tests correspondientes
3. `test-reporter` — escribir el comentario de validación en Jira

¿Con qué ticket trabajamos?
