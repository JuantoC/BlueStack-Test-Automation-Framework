# RULE: DOC-CHANGE-PROTOCOL

## Cuándo aplica
Antes de modificar CUALQUIER archivo de documentación (.md, JSDoc, TSDoc)

## Protocolo obligatorio

### Para modificar JSDoc/TSDoc
1. Verificar que la modificación refleja el código ACTUAL
2. Si el código necesita cambiar, cambiar código primero
3. Actualizar JSDoc en el mismo commit que el código (nunca separado)

### Para modificar .md
1. Verificar que no se está reemplazando contenido que debería estar en código
2. Verificar que el .md no quedará inconsistente con código existente
3. Si el cambio en .md implica un cambio en comportamiento, 
   cambiar el código PRIMERO

### Para eliminar .md
1. Verificar que ninguna skill lo usa como input primario
2. Verificar que no hay links desde otros .md o README
3. Mover contenido valioso al código o a docs/archive/

## El agente nunca puede
- Modificar un .md para que "quede consistente con código antiguo"
  cuando el código fue actualizado correctamente
- Crear un .md que contradiga el código actual
- Usar un .md modificado externamente sin verificar que sigue
  siendo consistente con el código