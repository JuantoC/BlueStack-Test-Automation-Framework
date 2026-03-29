# Rule: Page Object Layer — `src/pages/`

## Cuándo aplica esta rule
Antes de **crear o modificar cualquier archivo** dentro de `src/pages/`.  
Si solo estás leyendo o navegando `src/pages/`, no es necesario cargar este contexto.

---

## Acción requerida antes de proceder

Leer `src/pages/README.md` en su totalidad antes de tocar cualquier archivo de esta capa.

Ese documento es la especificación autoritativa de toda la capa. Cada regla definida ahí tiene precedencia sobre cualquier convención general de TypeScript o Selenium que el agente conozca por entrenamiento.

---

## Por qué es obligatorio

El README de `src/pages/` define:

- Arquitectura de dos capas: **Maestros** (Page Objects principales) + **sub-componentes** enfocados
- Reglas de ownership de locators
- Contratos de constructores
- Convenciones de naming
- Anti-patrones explícitos

Violar cualquiera de estas reglas rompe el framework.

---

## Restricción explícita

No inferir convenciones para esta capa desde conocimiento general.  
La única fuente válida es `src/pages/README.md`.