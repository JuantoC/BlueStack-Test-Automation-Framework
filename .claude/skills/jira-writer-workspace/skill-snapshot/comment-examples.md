# Ejemplos de comentarios reales — Proyecto NAA

> **⚠ FORMATO:** Los ejemplos se muestran en markdown para legibilidad, pero al postear
> en Jira SIEMPRE se deben convertir a ADF JSON. Ver `references/adf-format-guide.md`.

## Validación en Master — todos OK (NAA-4429, autor: Juanto)

```markdown
Se valida sobre **Master** los cambios aplicados:

* El error presentado sobre la creacion de notas IA deje de suceder ✔
* La generacion de una nota que no se habia solicitado se evite y siempre se traiga lo relacionado a la tarea y al contexto ✔

Se ve bien! Podemos pasar **a versionar** ! @Verónica Tarletta
```
→ Acción post-comentario: transición `42` (A Versionar)

---

## Validación en Master — todos OK (NAA-4396, autor: Juanto)

```markdown
Se valida sobre **Master** el fix aplicado:

* EL error que se presentaba cuando un usuario no tiene imagen de perfil deje de suceder ✔
* No se presente el modal para permisos de lectura del **clipboard** ✔

Se ve bien! Podemos pasar **a versionar** !
```
→ Acción post-comentario: transición `42` (A Versionar)

---

## Validación en Dev_SAAS — todos OK (NAA-3777, autor: Juanto)

```markdown
Se volvió a validar en ambiente Dev-SAAS Testing para la preliberación 8.6.13 y 8.6.14.x:
Se tuvo en cuenta:

* El enlace "Editar Noticia" funciona correctamente al copiar o transcribir una noticia. ✔
* El enlace mantiene su funcionamiento también cuando la noticia se copia a una publicación diferente a la actual. ✔
```
→ Acción post-comentario: transición `31` (Done)

---

## Validación en Master — con error (template basado en convenciones)

```markdown
Se valida sobre **Master** los cambios aplicados:

* El flujo de creación de nota IA finaliza sin error ✔
* El título se genera correctamente a partir del prompt ✔
* El cuerpo no incluye markdown residual (backticks) ✘
  > Al generar el cuerpo con formato complejo (listas + código), la IA devuelve
  > bloques ```json que rompen el parser. Se reproduce siempre con este tipo de prompts.
  > Versión: 8.7.1 — URL: https://master.d1c5iid93veq15.amplifyapp.com/new_post/...

Quedan observaciones. @Verónica Tarletta por favor revisar el ítem marcado con ✘
```
→ Acción post-comentario: transición `2` (FEEDBACK)

---

## Validación en Dev_SAAS — con error → comentario en ticket original

```markdown
Se detectó un error durante la validación en **Dev_SAAS** para la preliberación 8.6.16.1.5.
Se creó el ticket NAA-4460 para su corrección.

* El cuerpo no incluye markdown residual (backticks) ✘
  > En Dev_SAAS el error vuelve a aparecer bajo las mismas condiciones que en master.
  > Se reproduce en la preliberación 8.6.16.1.5 con prompts que incluyen código Python.
```
→ **No se transiciona** el ticket original. Se crea NAA-4460 nuevo y se linkea con "Relates".

---

## Observación / nuevo hallazgo dentro de un ticket (NAA-4396, autor: Juanto)

```markdown
Sumi un nuevo caso que podria ser de relevancia:

Hoy al ingresar por primera vez al admin de Master, el mismo ya se encontraba dentro de una
nota, y me encontre con un banner de error correspondiente a la pagina donde estaba:

Message: An error occurred in the service
Error: Server unavailable
Url: https://master.d1c5iid93veq15.amplifyapp.com/new_post/.../edit/1
Service: undefined
Version: 8.7.1

Este tipo de errores debe de solucionarse ya que para el usuario editor convencional que
trabaja con muchas pestañas abiertas en paralelo, la presencia de errores unicamente por
cerrar y abrir una pestaña representa un cms inestable y lleno de errores
```

---

## Reglas tipográficas del estilo Juanto

| Regla | Correcto | Incorrecto |
|-------|----------|------------|
| Ambiente en negrita | `**Master**` / `**Dev_SAAS**` | `Master` / `dev_saas` |
| ✔/✘ al final | `descripción ✔` | `✔ descripción` |
| Error en línea aparte | `> detalle del error` bajo el bullet | inline en el mismo bullet |
| Cierre master OK | `Se ve bien! Podemos pasar **a versionar** !` | cualquier variante |
| Cierre master error | `Quedan observaciones. @dev revisar...` | `Se ve bien!` con errores |
| Cierre Dev_SAAS | sin cierre — termina en el último bullet | agregar "Se ve bien!" |
| Versión del app | incluir cuando sea relevante: `Versión: 8.7.1` | omitir si es conocida |
