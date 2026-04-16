# pom-generator — Tipos de Input Aceptados

Tabla de referencia para el agente ejecutando la skill `pom-generator`.

## Tabla de tipos

| Input | Qué extraer | Confianza en locators |
|---|---|---|
| **Descripción textual** | Estructura de la página, secciones, acciones posibles, flujos | Baja — usar placeholders TODO |
| **Screenshot / imagen de UI** | Layout visual, secciones, botones, elementos interactivos, jerarquía visual | Baja — usar placeholders TODO |
| **Fragmento de DOM HTML** | Estructura real del DOM, clases CSS, data-testid, atributos, jerarquía | Alta — extraer selectores reales cuando existan atributos identificables |
| **DOM HTML completo de la página** | Todo lo anterior + contexto completo de la página | Alta — extraer selectores reales, identificar secciones naturales del DOM |

## Reglas por tipo

### DOM HTML (fragmento o completo)
- Priorizá atributos `data-testid`, `data-test`, `id`, `name` y `aria-label` como selectores.
- Si no existen atributos identificables, usá selectores CSS semánticos basados en la estructura del DOM pero marcalos como `// FRAGILE: selector sin identificador estable`.
- Identificá las secciones naturales del DOM para proponer la división en subcomponentes.

### Imagen / Screenshot
- Describí qué ves en la imagen antes de generar código.
- Listá las secciones, elementos interactivos y flujos que identificás.
- Pedí confirmación al usuario si la interpretación es ambigua.

### Descripción textual
- Extraé la lista de secciones, elementos y acciones.
- Si la descripción es vaga, hacé preguntas concretas antes de generar (ver Paso 1).

## Prioridad en caso de conflicto

Combinaciones válidas: texto + imagen, texto + DOM, o las tres. En caso de conflicto entre tipos:

```
DOM > imagen > texto
```