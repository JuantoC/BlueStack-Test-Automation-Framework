# Pipeline Run — Guía de errores por error_type

Usar esta tabla cuando `outcome: "error"` para guiar al usuario con pasos de resolución específicos.

| `error_type` | Causa probable | Guía al usuario |
|---|---|---|
| `DockerNotAvailable` | Docker Grid no levantado | Ejecutar `docker compose up -d --wait` desde el directorio del proyecto. Verificar con `docker ps` que los contenedores están corriendo. |
| `JiraConnectionError` | MCP Atlassian no responde | Verificar conexión MCP con `mcp__claude_ai_Atlassian__atlassianUserInfo`. Si falla, reiniciar la sesión de Claude. |
| `TestTimeout` | Docker Grid sobrecargado o test colgado | Esperar 2-3 minutos y reintentar. Si persiste, revisar logs del contenedor con `docker logs selenium-hub`. |
| `SessionFileError` | Archivo `.test.ts` con error de sintaxis o import | Leer el archivo de la sesión que falló y verificar imports con extensión `.js` (requisito ESM). |
| `GridNodeUnavailable` | No hay nodos disponibles en el Grid | Escalar nodos: `docker compose scale chrome=3`. |
| Cualquier otro | Error inesperado en el pipeline | Mostrar el `error_log` completo al usuario y preguntar si quiere investigar. Registrar en `wiki/log.md` como `[gap] error-type: <nombre>` si es nuevo. |
