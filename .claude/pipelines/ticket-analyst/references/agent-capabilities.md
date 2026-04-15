# Agent Capabilities Model — QA Orchestration

## Propósito

Este documento define el modelo de capacidades del agente QA. El agente `ticket-analyst` lo usa para razonar si cada criterio de prueba es automatizable o requiere validación humana.

**Principio fundamental:** El agente NO busca keywords para decidir si algo es automatizable. El agente se pregunta:

> "¿Puedo escribir una assertion en Selenium que falle si este criterio NO se cumple y pase si SÍ se cumple?"

Si la respuesta es NO — porque requiere percepción humana, entorno físico específico, o no hay propiedad DOM observable — entonces `automatable: false`.

---

## Lo que el agente PUEDE probar

| Capacidad | Ejemplos |
|---|---|
| Estados de DOM | Clase CSS presente/ausente, atributos `aria-*`, `data-*`, `disabled`, `required` |
| Validaciones de formulario | Campo marcado como error (clase visible en DOM), mensaje de validación, campo requerido disparado |
| Interacciones de usuario | Click, tipo, submit, selección de dropdown, checkbox, toggle |
| Contenido textual | Texto de elementos, placeholder, labels, mensajes de error/éxito |
| Visibilidad de elementos | `isDisplayed()`, `isEnabled()`, presencia en DOM |
| Transiciones de estado | Estado antes/después de una acción (ej: botón deshabilitado → habilitado tras input) |
| Toasts y notificaciones | Aparición de toast en DOM, texto del toast, duración |
| Network via CDP | Requests interceptados, status codes, payloads de API |
| Navegación | URL actual, título de página, rutas SPA |
| Modales y dialogs | Apertura/cierre, contenido, botones disponibles |

---

## Lo que el agente NO PUEDE probar

Estas limitaciones son **fundamentales** — no son workarounds faltantes sino restricciones inherentes del entorno.

### 1. Resolución y tamaño de monitor físico

**Por qué no:** Selenium headless puede setear viewport via código, pero no puede reproducir el entorno físico del usuario: DPI nativo, zoom del sistema operativo, monitor externo conectado, escala de fuentes del SO. Cuando un ticket reporta "no se puede llegar al checkbox con el scroll en monitores grandes", el problema puede ser una combinación de resolución + escala + comportamiento de scroll del SO que headless no replica con fidelidad.

**Señal en el ticket:** "monitores grandes", "pantalla grande", "resolución alta", "en mi monitor de 27 pulgadas", "4K", "pantalla pequeña", "en mobile"

**Acción:** `automatable: false`, `reason_if_not: "Requiere validación en entorno físico específico — no reproducible con garantía en headless"`

---

### 2. Renderizado visual pixel-perfect

**Por qué no:** Headless Chrome renderiza diferente al browser real. Colores, antialiasing, tipografías y espaciados exactos no están garantizados. Sin un sistema de visual regression testing con baseline definido, no hay assertion válida.

**Señal en el ticket:** "el color está mal", "se ve mal el espaciado", "el texto se corta visualmente", "la imagen no se ve bien", "el icono está desalineado"

**Acción:** `automatable: false` a menos que el criterio sea verificable vía propiedad DOM/CSS (ej: clase aplicada, width en px via JS), en cuyo caso sí es automatizable.

---

### 3. Percepciones subjetivas

**Por qué no:** "Se ve bien", "queda prolijo", "está centrado visualmente" no tienen una propiedad DOM observable. No hay assertion que codifique estas percepciones sin un baseline visual externo.

**Señal en el ticket:** "se ve mejor", "queda más prolijo", "la UI mejoró", "el diseño está mal"

**Acción:** `automatable: false`, `reason_if_not: "Juicio subjetivo sin propiedad DOM observable"`

---

### 4. Performance perceptual

**Por qué no:** Selenium no mide frames por segundo, fluidez de animaciones, ni percepción de velocidad. `performance.now()` da tiempos de carga pero no captura la experiencia de usuario.

**Señal en el ticket:** "carga lento", "la animación no es fluida", "el scroll lagguea", "hay jank"

**Acción:** `automatable: false`, `reason_if_not: "Performance perceptual no medible con Selenium"`

---

### 5. Comportamiento táctil/móvil real

**Por qué no:** Los touch events simulados por Selenium no son equivalentes a touch real en un dispositivo físico. Gestos, pinch-to-zoom, swipe con inercia, y haptics no se replican.

**Señal en el ticket:** "en mobile", "touch", "gesto de swipe", "no funciona en celular"

**Acción:** `automatable: false`, `reason_if_not: "Requiere dispositivo físico con touch real"`

---

## Zona gris — razonar antes de decidir

Estos casos requieren análisis antes de asignar `automatable`:

| Situación | Preguntar |
|---|---|
| "El scroll no llega al elemento X" | ¿El elemento X es visible/accesible vía `isDisplayed()`? Si sí → automatable. Si el problema es el scroll behavior del SO → no automatable. |
| "El componente no se muestra en pantalla pequeña" | ¿Hay una clase CSS diferente aplicada en mobile? Si sí → automatable via clase. Si solo es renderizado visual → no automatable. |
| "El botón está deshabilitado" | ¿El `disabled` attribute está en el DOM? → automatable. ¿Solo se "ve gris"? → revisar atributo antes de decidir no automatable. |
| "El modal se cierra solo" | ¿Hay un evento DOM observable? → automatable. ¿Depende de timeout físico? → evaluar. |

---

## Cómo aplicar este modelo en ticket-analyst

Para cada criterio de prueba extraído del ticket:

1. Formular el `test_approach`: precondition + action + assertion
2. Aplicar la pregunta fundamental: "¿Puedo escribir esta assertion en Selenium?"
3. Si hay duda → revisar la tabla de zona gris
4. Si no se puede formular una assertion DOM-observable → `automatable: false`
5. Documentar `reason_if_not` con la razón fundamental (no keywords)

**Ejemplo correcto:**
```json
{
  "criterion_type": "responsive",
  "automatable": false,
  "reason_if_not": "El criterio requiere validar scroll behavior en resolución física de monitor grande — no reproducible con fidelidad en headless Chrome con viewport simulado"
}
```

**Ejemplo incorrecto (NO hacer):**
```json
{
  "criterion_type": "responsive",
  "automatable": false,
  "reason_if_not": "contiene la palabra 'monitores grandes'"
}
```