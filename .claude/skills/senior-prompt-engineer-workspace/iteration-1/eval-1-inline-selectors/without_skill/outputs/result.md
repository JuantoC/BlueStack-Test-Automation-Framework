## Problema identificado

El prompt original instruye al agente a "importar los POMs necesarios" pero no prohíbe explícitamente el uso de selectores inline ni define qué responsabilidades pertenecen al archivo `.test.ts`. Sin esa restricción negativa explícita, el agente resuelve ambigüedades con lo que conoce por defecto: escribir selectores directamente.

Raíz del problema: el prompt dice qué hacer (importar POMs) pero no dice qué NO hacer (inline selectors) ni por qué importa la distinción.

---

## Prompt original

```
Generá un archivo .test.ts en sessions/ para el flujo que describe el ticket.
Usá faker para los datos.
Importá los POMs necesarios.
```

---

## Análisis

| Dimensión | Estado en el prompt original |
|---|---|
| Restricción negativa sobre inline selectors | Ausente |
| Definición del rol del archivo .test.ts | Ausente |
| Definición del rol del POM | Ausente |
| Contrato de qué pertenece a cada capa | Ausente |
| Ejemplo o contra-ejemplo | Ausente |

---

## Prompt mejorado

```
Generá un archivo .test.ts en sessions/ para el flujo que describe el ticket.

CONTRATO DE CAPAS — obligatorio:
El archivo .test.ts es SOLO orquestación de alto nivel. Su única responsabilidad
es encadenar llamadas a métodos del POM en el orden que describe el flujo.

PROHIBIDO en sessions/:
- By.css, By.id, By.xpath, By.name o cualquier otro selector
- driver.findElement, driver.findElements
- waitFind, waitClick o cualquier helper de espera de elemento
- Acciones DOM directas (sendKeys, click, getText sobre WebElement)
- Cualquier lógica de interacción con el browser que no sea una llamada a un método del POM

Si el flujo requiere una interacción que no existe como método en el POM disponible,
DETENER y escalar: indicar exactamente qué método falta y en qué clase del POM debería vivir.
No improvisar la interacción inline.

PERMITIDO en sessions/:
- Instanciar clases POM
- Llamar métodos del POM (ej: await newsPage.fillTitle(title))
- expect() de Jest sobre valores devueltos por métodos del POM
- faker para generar datos de prueba (definir variables antes del bloque de acciones)
- describe/it/beforeAll/afterAll de Jest

IMPORTS:
- Importar las clases POM con extensión .js (requisito ESM del proyecto)
- Importar faker si se usan datos generados
- No importar By, WebDriver, WebElement ni ningún tipo de Selenium directamente

ESTRUCTURA esperada del archivo:
1. imports (POM + faker si aplica)
2. describe block con el nombre del flujo
3. beforeAll: instanciar driver y páginas POM
4. it blocks: una acción lógica por bloque, expresada en lenguaje de negocio
5. afterAll: cerrar driver

Usá faker para todos los datos de prueba variables.
```

---

## Por qué funciona mejor

1. **Restricción negativa explícita**: listar los símbolos prohibidos elimina la ambigüedad.
2. **Contrato de capas en positivo y negativo**: definir qué SÍ y qué NO pertenece al archivo da un marco de decisión claro.
3. **Escalación en lugar de improvisación**: la instrucción "DETENER y escalar si falta el método POM" evita el patrón de completar con inline selectors.
4. **Estructura esperada**: al definir la estructura del archivo, el agente tiene un molde que naturalmente produce orquestación.
5. **Import de Selenium bloqueado**: prohibir importar `By`, `WebDriver` y `WebElement` en sessions/ cierra el vector más común de escape.
