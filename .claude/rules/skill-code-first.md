# RULE: SKILL-CODE-FIRST

## Aplicación
Esta regla aplica a **todas** las invocaciones de skills en `.claude/skills/`.

---

## Obligaciones del agente al ejecutar cualquier skill

### 1. Input primario — siempre desde el código
Antes de leer cualquier `.md` externo, el agente DEBE:
- Leer los archivos `.ts` relevantes al dominio de la skill
- Leer el JSDoc/TSDoc de las funciones o clases involucradas
- Para skills que operan sobre Page Objects: leer el archivo en `src/pages/` correspondiente
- Para skills que operan sobre el core: leer el archivo en `src/core/` correspondiente

### 2. Input contextual — desde `.md`, solo después del código
El agente PUEDE leer `.md` asociado para:
- Entender el propósito o convenciones del módulo
- Obtener ejemplos de uso documentados
- Leer las instrucciones de invocación de la skill en sí

### 3. Resolución de conflictos
Si el código y un `.md` son inconsistentes:
- El **código prevalece siempre**
- Generar advertencia con formato `⚠️ INCONSISTENCIA DETECTADA`
- Preguntar al desarrollador si debe actualizarse el `.md`
- **Nunca** ejecutar lógica inferida solo desde un `.md` sin verificar en el código

---

## Prohibición explícita
- NUNCA tomar decisiones sobre el comportamiento de una clase o función basándose únicamente en lo que dice un `.md`
- NUNCA modificar código TypeScript basándose en instrucciones de un `.md` sin validar que ese `.md` refleja el estado actual del código

---

## Violación de esta regla
Si el agente detecta que está a punto de usar un `.md` como fuente primaria de lógica, debe pausar y declarar:

> ⛔ **RULE-SKILL-CODE-FIRST**: Detecté que estoy priorizando `.md` sobre código.  
> [descripción de la situación]  
> ¿Confirmás que debo proceder igualmente?