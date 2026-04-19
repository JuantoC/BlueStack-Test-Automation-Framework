---
name: generate-readme
model: haiku
effort: low
description: Generar o actualizar un archivo README.md para una carpeta o módulo del proyecto, siguiendo las convenciones del repositorio BlueStack. Activar cuando el usuario diga: "generá el README de X", "documentá la carpeta X", "creá el README para X", "actualizá el README de X", "la carpeta X no tiene README", "agregá documentación a X", "genera readme", "necesito el readme de".
---

# Filosofía — README como capa de orientación

El README de una carpeta tiene un solo objetivo: darle **contexto de navegación** a quien interactúa con esa carpeta — humano o IA. No es documentación técnica ni una copia de lo que ya vive en el código.

**Un README bien escrito responde:**
- ¿Qué hace esta carpeta y por qué existe?
- ¿Qué archivos hay y qué hace cada uno?
- ¿Qué convenciones aplican aquí?
- ¿Dónde busco los detalles técnicos?

**Incluye:**
- Nomenclatura del componente/módulo
- Árbol `tree` del directorio con comentarios inline
- Convenciones de naming y patterns propios de la carpeta
- Punteros hacia archivos donde viven los detalles técnicos

**No incluye (usar punteros en su lugar):**
- Firmas TypeScript o interfaces copiadas del código → apuntar al wiki o al `.ts` fuente
- Ejemplos de código incrustados → apuntar al archivo de ejemplo existente
- Comandos bash → apuntar a `.claude/references/COMMANDS.md`
- Tablas de API o catálogos que ya existen en `wiki/` → apuntar a la wiki

Cuando algo puede derivarse leyendo un archivo ya existente, el README apunta — no copia.

---

# Instrucciones

## Paso 1 — Discovery (antes de leer código)

1. Leer `wiki/index.md` — identificar si existe una página wiki que cubra esta carpeta.
   - Si existe: anotar su path relativo como puntero para `🔗 Referencias`.
   - Si no existe: registrar el gap en `wiki/log.md` al finalizar.

2. Listar los archivos de la carpeta objetivo para entender la estructura.

3. Buscar archivos de ejemplo candidatos a puntero:
   - Archivos `*.test.ts` → son la estructura canónica de uso en `sessions/`
   - Archivos `example*.ts`, `*.example.ts`, o similares en otras carpetas
   - Anotar el más representativo para la sección `🔗 Referencias`

4. Revisar `.claude/references/COMMANDS.md`:
   - Si hay comandos relacionados con esta carpeta: **no embedarlos en el README**, solo referenciar el archivo.

## Paso 2 — Leer los archivos fuente

Leer los `.ts` de la carpeta objetivo para entender:
- Qué clase/función/tipo exporta cada archivo (descripción inline para el árbol)
- Qué naming conventions se usan (para sección Convenciones)
- Qué módulos importa cada archivo (para entender dependencias y construir `🔗 Referencias`)

Si la carpeta tiene sub-carpetas, listar su contenido para reflejar la jerarquía en el árbol.

**No copiar** firmas completas, interfaces ni ejemplos de uso al README.

## Paso 3 — Generar el README con la estructura canónica

```markdown
<!--
@doc-type: readme
@scope: [project | module | feature | api | config]
@audience: [human | ai | both]
@related: [paths relativos a READMEs o wiki relacionados]
@last-reviewed: YYYY-MM-DD
@summary: Una oración que describe el propósito de este módulo.
-->

# `@<ruta>` — <Nombre del módulo>

> <Propósito en una oración. Si es spec autoritativa para agentes IA, indicarlo.>

---

## Quick Reference *(solo si hay 5+ convenciones o conceptos clave que listar)*

| Concepto | Regla/Descripción |
|---|---|

---

## Directorio

```
<carpeta>/
├── archivo.ts          # Clase o función principal que exporta
├── otro.ts             # Descripción de una línea
└── sub-carpeta/
    └── ...
```

---

## Arquitectura / Propósito *(si aplica; omitir si el directorio se explica solo)*

<Descripción de responsabilidades y relaciones entre componentes.
Solo prosa — sin código, sin firmas.>

---

## Convenciones *(si aplica)*

| Artefacto | Patrón | Ejemplo |
|---|---|---|

---

## 🔗 Referencias

- [wiki/xxx.md](../wiki/xxx.md) — API completa, firmas y ejemplos de uso
- [ejemplo.ts](ruta/ejemplo.ts) — estructura canónica de implementación
- [.claude/references/COMMANDS.md](../.claude/references/COMMANDS.md) — comandos de ejecución
- [archivo-fuente.ts](ruta) — implementación de `ClasePrincipal`
```

---

## Paso 4 — Reglas de aplicación

- Siempre incluir el bloque `<!-- ... -->` de metadatos al inicio.
- Siempre incluir la sección `🔗 Referencias` al final.
- El árbol refleja el **estado actual** del filesystem — no agregar archivos inexistentes.
- Los paths en `@related` y en `🔗 Referencias` son **relativos** al README generado.
- Omitir secciones vacías — no dejar placeholders sin completar.
- Si existe una página wiki para esta carpeta: no duplicar su contenido; solo referenciarla.
- Si existen archivos `.test.ts` como ejemplos canónicos: referenciar el más representativo, no copiar su contenido.
- Si hay comandos relevantes para esta carpeta: apuntar a `COMMANDS.md`, no embedarlos.

**Excepción controlada:** se permite hasta 3 líneas de código TypeScript inline si ilustran una convención de naming o un pattern que no existe en ningún otro archivo de referencia, y solo si agregan orientación que un puntero solo no puede dar. Siempre acompañar con un comentario que explique por qué no alcanza el puntero.

## Paso 5 — Confirmar antes de guardar

Mostrar el README al usuario. No guardar sin confirmación explícita.

Checklist antes de presentar:
- [ ] Bloque YAML completo (ningún placeholder sin resolver)
- [ ] Árbol refleja el filesystem actual
- [ ] Paths en `@related` y `🔗 Referencias` son relativos y correctos
- [ ] No hay firmas TypeScript ni interfaces incrustadas (usar puntero a wiki o `.ts`)
- [ ] No hay comandos bash incrustados (usar puntero a `COMMANDS.md`)
- [ ] No hay ejemplos de uso incrustados (usar puntero a archivo ejemplo)
- [ ] No hay duplicación con el README raíz ni con otros READMEs del proyecto

---

# Qué NO incluir

- Información ya en el README raíz → linkear.
- Información duplicada de READMEs hermanos.
- Secciones vacías o con placeholders sin completar.
- Lógica funcional, definiciones de tipos o contratos normativos → van al código `.ts`.
- Inferencias sobre comportamiento que no estén respaldadas por el código.
- Firmas de API completas → puntero a wiki o al archivo fuente.
- Comandos bash → puntero a `.claude/references/COMMANDS.md`.
- Ejemplos de uso incrustados → puntero al archivo de ejemplo.