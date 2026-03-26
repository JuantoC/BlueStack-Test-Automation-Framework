runSession('Login Fallido Reiterado y Exitoso', async ({ driver, opts, log }) => {

  description(`
### Test: Login Fallido Reiterado
---
**Objetivo:** Verificar que el CMS identifique correctamente intentos fallidos de login tras reiteradas ocasiones (2veces), para identificar que el CMS muestra correctamente los errores. En el tercer intento debe tener éxito normal a la página de login.

**Detalles del flujo:**
* **Acción 1:** Intentar login con credenciales inválidas (intento 1). Validar error.
* **Acción 2:** Intentar login con credenciales inválidas (intento 2). Validar error.
* **Acción 3:** Login exitoso con credenciales válidas (intento 3).

**Criterio de Aceptación:** Los intentos fallidos lanzan errores en UI y el acceso válido en el 3er intento pasará correctamente.
`);

  const { user, pass } = ENV_CONFIG.getCredentials('editor');
  const authUrl = getAuthUrl(ENV_CONFIG.baseUrl, ENV_CONFIG.auth.basic.user, ENV_CONFIG.auth.basic.pass);

  await driver.get(authUrl);

  const login = new MainLoginPage(driver, opts);

  const invalidAttempts = [
    { username: user, password: "wrongpassword1" },
    { username: user, password: "wrongpassword2" }
  ];
  const validCredentials = { username: user, password: pass };

  await login.failLogin(invalidAttempts, validCredentials);

  log.info("✅ Login exitoso luego de 2 intentos fallidos verificado correctamente.");
},
  {
    epic: "Login",
    feature: "Failed Login",
    severity: "normal",
  });

import { runSession } from "../src/core/wrappers/testWrapper.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { ENV_CONFIG } from "../src/core/config/envConfig.js";
import { description } from "allure-js-commons";
import { MainLoginPage } from "../src/pages/login_page/MainLoginPage.js";
