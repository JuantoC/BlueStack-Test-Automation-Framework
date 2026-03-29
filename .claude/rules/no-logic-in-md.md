# RULE: NO-LOGIC-IN-MD

## Descripción
Los archivos .md no deben contener lógica funcional, definiciones de tipos,
ni contratos de entrada/salida.

## Violaciones que detectar
- Bloques de código TypeScript/JavaScript que definan tipos, interfaces o funciones
- Expresiones condicionales en prosa que describan comportamiento programático
- Enumeraciones de valores que debería ser un `enum` o `const` en TypeScript

## Comportamiento del agente
Cuando estés a punto de escribir en un .md:
1. Evaluá si el contenido es lógica/contrato → debe ir al código
2. Evaluá si es contexto/guía → puede ir al .md
3. Si dudás, preguntá al desarrollador

## Excepción permitida
Los bloques de código en .md son válidos SOLO para ejemplos de uso
(ilustrativos), nunca como definición normativa de comportamiento.