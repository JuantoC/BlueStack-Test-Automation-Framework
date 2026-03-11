/**
 * Define la estructura de identidad para procesos de autenticación.
 */
export interface AuthCredentials {
  username: string;
  password: string;
  /** El MFA Token puede ser opcional dependiendo del ambiente */
  otpToken?: string;
}