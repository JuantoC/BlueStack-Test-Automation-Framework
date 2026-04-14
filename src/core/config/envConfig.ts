import 'dotenv/config';

export type EnvName = 'testing' | 'master' | 'cliente';
export type RoleName = 'admin' | 'editor' | 'basic';

interface EnvCredentials { user: string; pass: string; }
interface EnvAuth { basic: EnvCredentials; admin: EnvCredentials; editor: EnvCredentials; }
interface EnvEntry { baseUrl: string; auth: EnvAuth; }

function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`[envConfig] Missing required env var: ${name}`);
  return value;
}

const VALID_ENVS: readonly EnvName[] = ['testing', 'master', 'cliente'];

function resolveTargetEnv(): EnvName {
  const raw = (process.env.TARGET_ENV || 'testing').toLowerCase();
  if (!VALID_ENVS.includes(raw as EnvName))
    throw new Error(`[envConfig] TARGET_ENV="${raw}" inválido. Valores válidos: ${VALID_ENVS.join(', ')}`);
  return raw as EnvName;
}

function loadEnvEntry(prefix: string): EnvEntry {
  // Migration bridge: TESTING_BASE_URL preferred, TESTING_URL accepted (backward compat)
  const baseUrl = prefix === 'TESTING'
    ? (process.env.TESTING_BASE_URL || requireEnvVar('TESTING_URL'))
    : requireEnvVar(`${prefix}_BASE_URL`);
  return {
    baseUrl,
    auth: {
      basic:  { user: requireEnvVar(`${prefix}_BASIC_USER`),  pass: requireEnvVar(`${prefix}_BASIC_PASS`) },
      admin:  { user: requireEnvVar(`${prefix}_ADMIN_USER`),  pass: requireEnvVar(`${prefix}_ADMIN_PASS`) },
      editor: { user: requireEnvVar(`${prefix}_EDITOR_USER`), pass: requireEnvVar(`${prefix}_EDITOR_PASS`) },
    },
  };
}

const targetEnv: EnvName = resolveTargetEnv();
const activeEntry: EnvEntry = loadEnvEntry(targetEnv.toUpperCase());

/**
 * Configuración centralizada del framework. Lee variables de entorno y las expone de forma tipada.
 *
 * El entorno activo se selecciona con la variable `TARGET_ENV` (default: `testing`).
 * Cada entorno tiene su propio bloque de credenciales y URL base en el `.env`.
 *
 * Para override de rol en pipelines, usar `TEST_ROLE=admin` como env var.
 * El rol declarado en cada test actúa como valor por defecto.
 */
export const ENV_CONFIG = {
  // --- INFRAESTRUCTURA ---
  grid: {
    url: process.env.GRID_URL || 'http://localhost:4444',
    useGrid: process.env.USE_GRID === 'true',
    maxInstances: parseInt(process.env.MAX_INSTANCES || '1', 10),
  },

  // --- NAVEGADOR ---
  browser: {
    isHeadless: (process.env.IS_HEADLESS ?? 'true') !== 'false',
  },

  // --- ENTORNO ACTIVO ---
  /** Nombre del entorno seleccionado por TARGET_ENV */
  targetEnv,

  /** URL base del entorno activo */
  get baseUrl(): string { return activeEntry.baseUrl; },

  /** Credenciales del entorno activo (basic, admin, editor) */
  get auth(): EnvAuth { return activeEntry.auth; },

  /**
   * Retorna las credenciales del rol solicitado para el entorno activo.
   * Si `TEST_ROLE` está definido como env var, tiene precedencia sobre el rol del test
   * (útil para pipelines que necesitan correr un test con un usuario diferente al declarado).
   */
  getCredentials(role: RoleName): EnvCredentials {
    const effectiveRole = (process.env.TEST_ROLE as RoleName | undefined) || role;
    return activeEntry.auth[effectiveRole];
  },
};

export default ENV_CONFIG;
