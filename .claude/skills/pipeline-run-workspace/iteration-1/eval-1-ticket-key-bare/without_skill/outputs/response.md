# NAA-4467 — Creacion de nota lista IA: se perdió el campo obligatorio para tema

## Resumen del ticket

- **Tipo:** QA Bug - Front
- **Estado:** A Versionar
- **Asignado a:** Paula Valentina Rodriguez Roberto

## Descripción del bug

Cuando se intenta generar una nota lista IA y se presiona el botón de generar sin completar los campos requeridos, los campos obligatorios se marcan en rojo — pero el campo **TEMA** no se marca en rojo, perdiendo la indicación visual de que es obligatorio.

## Análisis para automatización

Este bug implica un flujo de validación del modal de creación de notas IA (`AIPostModal`). Para automatizarlo habría que:

1. Navegar al flujo de creación de nota lista IA.
2. Hacer click en el botón "Generar" sin completar ningún campo.
3. Verificar que el campo TEMA muestra el estado de error visual (borde/texto en rojo).

El POM relevante sería `src/pages/post_page/ai_note/AIPostModal.ts`. Habría que revisar si ya existe un locator para el campo TEMA y si hay alguna acción/aserción para detectar el estado de validación requerida.

## Preguntas antes de generar el test

1. ¿El campo TEMA tiene un `data-testid` definido? Si hay capturas de DevTools en el ticket, podría extraerlo directamente.
2. ¿Ya está fixeado en la rama actual o todavía está pendiente de verificar en Dev/Staging?
3. ¿Querés que genere el test directamente o primero revisamos el POM de `AIPostModal` para ver qué hay implementado?

Si querés arrancar, puedo correr el pipeline completo con `pipeline-run` o generar el test directamente con `create-session`.
