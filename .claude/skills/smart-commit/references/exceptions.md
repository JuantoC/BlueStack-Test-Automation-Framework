# Manejo de Excepciones — smart-commit

## Sin cambios en el repositorio

```
✅ No hay cambios pendientes. Working tree limpio.
No se genera ningún commit.
```

## Error Git (no es repo, permisos, comando no encontrado)

```
❌ Error al ejecutar comando Git.
Detalle: {stderr capturado}
Verificar:
  - Que el directorio actual es la raíz del repositorio (debe existir .git/)
  - Que Git está instalado y accesible
  - Que hay permisos de lectura/escritura sobre el repositorio
```

## Error en commit individual

```
⚠️  Falló el commit {N}: {stderr}
Los commits anteriores ya fueron ejecutados.
Commits exitosos: {lista de hashes}
Acción requerida: revisar el error y reinvocar la skill para el grupo restante.
```

## Error en push

```
⚠️  Los commits se ejecutaron correctamente pero el push falló.
Detalle: {stderr}
Verificar:
  - Que existe conexión con el remoto
  - Que tenés permisos de escritura en origin/<rama>
  - Que la rama remota existe: git push --set-upstream origin <rama>
Los commits locales están intactos. Podés hacer push manualmente.
```

## Archivos en conflicto o merge en curso

```
❌ El repositorio tiene un merge o rebase en curso.
No se puede generar commits en este estado.
Resolvé el conflicto primero:
  - git merge --abort  (para cancelar el merge)
  - git rebase --abort (para cancelar el rebase)
  - O resolvé los conflictos y completá la operación
```