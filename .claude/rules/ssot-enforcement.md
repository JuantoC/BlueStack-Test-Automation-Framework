# RULE: SSOT-ENFORCEMENT

## Prioridad al LEER información del sistema
1. JSDoc/TSDoc inline en el código
2. Tests (`__tests__/` o `*.test.ts`)
3. `.md` — solo para contexto histórico

## Regla al ESCRIBIR documentación
- Si el contenido **define comportamiento** → va al código (`.ts`)
- Si el contenido **describe contexto** → va al `.md`
- Nunca duplicar: si ya está en el código, el `.md` lo referencia