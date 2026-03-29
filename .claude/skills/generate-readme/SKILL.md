---
name: generate-readme
description: Generar o actualizar un archivo `README.md` para una carpeta o módulo del proyecto,
siguiendo las convenciones documentadas en este repositorio.
---

# Cuándo usar esta skill
- Cuando se crea una carpeta nueva sin README.
- Cuando un README existente está incompleto o desactualizado.
- Cuando una IA necesita contexto de un módulo para ejecutar una tarea.

# Instrucciones para el agente

1. Lee el README raíz `./README.md` para entender el contexto general del proyecto.
2. Lee `src/pages/README.md` si la carpeta objetivo pertenece a la capa de páginas.
3. Lee todos los archivos `.ts` de la carpeta objetivo:
   - Exportaciones y tipos definidos
   - Firmas de constructores y métodos públicos
   - JSDoc/TSDoc inline existente
   - Dependencias importadas desde otros módulos internos
4. Si la carpeta tiene sub-carpetas, lista sus archivos para entender la jerarquía.
5. Genera el README usando la estructura canónica del proyecto:

```
<!--
@doc-type: readme
@scope: [project | module | feature | api | config]
@audience: [human | ai | both]
@related: [paths relativos a READMEs relacionados]
@last-reviewed: YYYY-MM-DD
@summary: Una oración que describe el propósito de este archivo.
-->

# `@<ruta>` — <Nombre del módulo>

> <Directiva de propósito en una oración. Si es spec autoritativa, indicarlo explícitamente.>

# Quick Reference (solo si hay 5+ conceptos clave)

| Concepto | Regla/Descripción |
|---|---|

# <Sección de arquitectura / propósito>

<Descripción de responsabilidades, quién usa qué, y por qué existe este módulo.>

# Directorio

```
<árbol de archivos con comentarios inline>
```

# <Contratos / API pública> (si aplica)

<Firmas de funciones o clases relevantes, extraídas del código.>

# Naming / Convenciones (si aplica)

| Artefacto | Patrón | Ejemplo |
|---|---|---|

# 🔗 Documentación relacionada

- [Archivo o módulo relacionado](ruta-relativa) — descripción breve
```

6. **Siempre incluir** el bloque de metadatos YAML al inicio.
7. **Siempre incluir** la sección `# 🔗 Documentación relacionada` al final.
8. El contenido debe ser útil para un humano que navega el repo Y para una IA que necesita
   contexto antes de ejecutar una tarea en ese módulo.
9. Mostrar el README generado al usuario antes de guardarlo — no guardar sin confirmación.

# Qué NO incluir
- Información ya documentada en el README raíz (linkear en su lugar).
- Información duplicada de READMEs hermanos.
- Secciones vacías o con placeholders sin completar.
- Lógica funcional, definiciones de tipos o contratos normativos (van al código `.ts`).
- Inferencias sobre comportamiento que no estén respaldadas por el código.

# Qué verificar antes de guardar
- [ ] El bloque YAML tiene todos los campos completos (ningún `[placeholder]` sin resolver)
- [ ] El árbol de directorio refleja el estado actual del filesystem
- [ ] Los paths en `@related` y en `🔗 Documentación relacionada` son relativos y correctos
- [ ] No hay duplicación con el README raíz ni con `src/pages/README.md`

# Ejemplo de invocación
> "Usando la skill generate-readme, documenta la carpeta `src/core/`"
> "Genera un README para `src/data_test/` siguiendo la skill generate-readme"
