/**
 * Credenciales de autenticación para el flujo de login del CMS.
 * otpToken es opcional según el ambiente (staging no requiere 2FA).
 */
export type AuthCredentials = {
  username: string;
  password: string;
  otpToken?: string;
};

/**
 * Resultado de un intento de login sin fallo rápido.
 * Devuelto por `LoginSection.attemptLogin()` para flujos de validación negativa.
 */
export interface LoginAttemptResult {
  success: boolean;
  errorMessage: string | null;
}
