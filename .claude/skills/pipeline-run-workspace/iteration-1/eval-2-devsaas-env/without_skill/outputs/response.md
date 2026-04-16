# Respuesta natural a: "quiero probar el ticket NAA-4188 en dev_saas"

Para probar NAA-4188 en dev_saas necesito primero leer el ticket para entender qué cambios cubre y qué flujos hay que validar.

Voy a leer NAA-4188 ahora.

---

*[Aquí leería el ticket via MCP Jira y mostraría su contenido]*

---

Una vez leído el ticket, el flujo típico sería:

1. **Leer el ticket** — título, descripción, tipo de cambio, entorno de deploy
2. **Identificar el flujo a testear** — qué página/funcionalidad cubre
3. **Verificar que dev_saas tiene el deploy** — preguntar o confirmar con el equipo si el fix ya está en ese entorno
4. **Ejecutar el test correspondiente** — si existe una sesión de test para ese flujo, correrla contra dev_saas; si no existe, crear una nueva sesión con `create-session`
5. **Documentar el resultado** — escribir el comentario de validación en Jira con `jira-writer`

¿Querés que lea el ticket ahora y arranque con el proceso completo?
