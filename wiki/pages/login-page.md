---
source: src/pages/login_page/MainLoginPage.ts · LoginSection.ts · TwoFASection.ts · login.types.ts
last-updated: 2026-04-13
---

# Pages: Login Page

## Propósito

Maneja el flujo de autenticación del CMS. Orquesta login con credenciales + verificación 2FA. También soporta flujo de login fallido para tests negativos.

---

## API pública / Métodos principales

### `MainLoginPage` (Maestro)

| Método | Parámetros | Qué hace |
|--------|------------|----------|
| `passLoginAndTwoFA(credentials)` | `credentials: AuthCredentials` | Flujo completo: ingresa credenciales + completa 2FA |
| `failLogin(invalidAttempts, validCredentials)` | `invalidAttempts: AuthCredentials[], validCredentials: AuthCredentials` | Ejecuta N intentos fallidos y luego recupera con credenciales válidas |

---

## Tipos / Interfaces exportadas

### `AuthCredentials` (en `login.types.ts`)

```typescript
type AuthCredentials = {
  username: string;
  password: string;
  otpToken?: string;   // opcional — staging puede no requerir 2FA
}
```

### `LoginAttemptResult` (en `login.types.ts`)

```typescript
interface LoginAttemptResult {
  success: boolean;
  errorMessage: string | null;
}
```

Retornado por `LoginSection.attemptLogin()` para flujos de validación negativa.

---

## Sub-componentes

| Sub-componente | Qué posee |
|---------------|-----------|
| `LoginSection` | Formulario de credenciales (usuario + contraseña), botón de login, detección de error |
| `TwoFASection` | Campo OTP, botón de confirmación 2FA |

---

## Dependencias internas

- `LoginSection` — entrada de credenciales y detección de error post-submit
- `TwoFASection` — verificación del token OTP

---

## Notas de uso

```typescript
// En un test — flujo de login exitoso
const loginPage = new MainLoginPage(driver, opts);
await loginPage.passLoginAndTwoFA({
  username: ENV_CONFIG.auth.admin.user,
  password: ENV_CONFIG.auth.admin.pass,
  otpToken: '123456'  // si el ambiente requiere 2FA
});

// Flujo de login fallido (test negativo)
await loginPage.failLogin(
  [{ username: 'wrong', password: 'wrong' }],
  { username: ENV_CONFIG.auth.admin.user, password: ENV_CONFIG.auth.admin.pass }
);
```

El login siempre usa `getAuthUrl()` internamente para navegar con HTTP Basic Auth antes de presentar el formulario de credenciales CMS.
