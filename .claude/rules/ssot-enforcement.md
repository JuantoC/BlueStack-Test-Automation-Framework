# RULE: SSOT-ENFORCEMENT

## Descripción
Institucionaliza el modelo de dos capas en todas las operaciones del agente.

## Reglas operativas

### Al LEER información sobre el sistema
1. Prioridad 1: JSDoc/TSDoc → leer inline del código
2. Prioridad 2: tests → revisar __tests__/ o *.test.ts
3. Prioridad 3 (contextual): docs/*.md → solo para contexto histórico

### Al ESCRIBIR documentación
1. Si el contenido define comportamiento → va al código (.ts)
2. Si el contenido describe contexto → va al .md
3. Nunca duplicar: si ya está en el código, el .md lo referencia

### Al DETECTAR inconsistencia
1. Siempre reportar con formato ⚠️ INCONSISTENCIA
2. Siempre usar el código como fuente de verdad
3. Siempre preguntar antes de actualizar .md

### Validación antes de completar cualquier tarea
Al finalizar cualquier modificación de código, verificar:
- [ ] ¿Los JSDoc reflejan la firma actual?
- [ ] ¿Los .md relacionados siguen siendo válidos como contexto?