# Documentación Técnica - Juego Endless Runner con Three.js

## 📋 Descripción General del Proyecto

Este proyecto es un **juego endless runner en 3D** desarrollado con **Three.js**, donde el jugador controla una bicicleta que debe esquivar coches de policía y recolectar monedas. El juego incluye un modo nocturno con iluminación dinámica, mecánicas de salto, sistema de colisiones, y dificultad progresiva.

---

## 🏗️ Arquitectura del Proyecto

### Estructura Modular

El código está organizado en módulos funcionales específicos:

1. **Sistema de Renderizado**: Configuración de WebGL y motor gráfico
2. **Sistema de Cámaras**: Vista principal y vista aérea
3. **Sistema de Iluminación**: Luces ambientales, direccionales, focales y dinámicas
4. **Sistema de Entrada**: Manejo de teclado para controles
5. **Sistema de Colisiones**: Detección mediante bounding boxes (THREE.Box3)
6. **Sistema de UI**: Interfaz HTML/CSS integrada
7. **Sistema de Recursos**: Carga asíncrona de modelos GLTF
8. **Sistema de Gameplay**: Lógica del juego y mecánicas

---

## 🔧 Tecnologías Utilizadas

- **Three.js r140**: Motor de renderizado 3D basado en WebGL
- **TWEEN.js**: Motor de animaciones suaves (easings)
- **GLTFLoader**: Carga de modelos 3D en formato GLTF/GLB
- **OrbitControls**: Controles de cámara orbital
- **THREEx.KeyboardState**: Manejo de entrada de teclado
- **HTML5/CSS3**: Interfaz de usuario
- **JavaScript ES5**: Lógica del juego

---

## 📦 Variables Globales

### Sistema de Renderizado
```javascript
renderizador          // THREE.WebGLRenderer - Motor de renderizado WebGL
escenaJuego          // THREE.Scene - Contenedor principal de la escena 3D
camaraJugador        // THREE.PerspectiveCamera - Cámara principal del jugador
camaraAerea          // THREE.OrthographicCamera - Mini-mapa vista cenital
controlesOrbitales   // THREE.OrbitControls - Controles de cámara
entradaTeclado       // THREEx.KeyboardState - Manejo de inputs
```

### Modelos 3D
```javascript
vehiculoBicicleta     // Modelo GLTF de la bicicleta del jugador
vehiculoPoliciaBase   // Modelo base del coche de policía (se clona)
objetoMonedaBase      // Modelo base de moneda (se clona)
superficieCarretera   // Plano 3D que representa la carretera
contenedorMundo       // Object3D contenedor de todos los objetos
```

### Colecciones y Colisiones
```javascript
coleccionPolicias         // Array de coches de policía activos
coleccionMonedas          // Array de monedas activas
cajasColisionPolicias     // Array de THREE.Box3 para detectar colisiones
cajasColisionMonedas      // Array de THREE.Box3 para recolección
cajaColisionBicicleta     // THREE.Box3 de la bicicleta
```

### Sistema de Iluminación
```javascript
luzAmbiente              // THREE.AmbientLight - Iluminación general
luzDireccional           // THREE.DirectionalLight - Luz del sol
luzFocal                 // THREE.SpotLight - Foco naranja
luzPuntual               // THREE.PointLight - Luz roja puntual
iluminacionBicicleta     // THREE.SpotLight - Faro delantero de la bicicleta
hazLuzVisible            // THREE.Mesh (cono) - Visualización del haz de luz
```

### Estado del Juego
```javascript
estadoColisionado        // Boolean - ¿Ha chocado con un coche?
estadoSaltando           // Boolean - ¿Está ejecutando un salto?
estadoJuegoIniciado      // Boolean - ¿El juego está activo?
cantidadMonedasRecogidas // Number - Contador de monedas
velocidadObstaculos      // Number - Velocidad actual del juego
modoNocturno             // Boolean - ¿Modo noche activado?
marcaTiempoInicio        // Timestamp - Momento de inicio del juego
```

---

## 🎯 Funciones Principales

### 1. Inicialización del Sistema

#### `inicializar()`
**Propósito**: Función principal que orquesta toda la inicialización del juego.

**Implementación**:
```javascript
function inicializar() {
    configurarSistemaRenderizado();
    establecerEscenaBase();
    configurarSistemaEventos();
    inicializarCamarasJuego();
    establecerSistemaEntrada();
    configurarIluminacionEscena();
    inicializarVariablesJuego();
    construirInterfazUsuario();
    cargarRecursosVisuales();
}
```

**Proceso**:
1. Crea el renderizador WebGL con antialiasing
2. Configura la escena y fondo inicial
3. Registra event listeners (resize)
4. Configura cámaras principal y aérea
5. Inicializa sistema de input
6. Añade luces a la escena
7. Inicializa variables de estado
8. Construye interfaz HTML
9. Carga modelos 3D de forma asíncrona

---

#### `configurarSistemaRenderizado()`
**Propósito**: Configurar el motor de renderizado WebGL.

**Características implementadas**:
- **Antialiasing**: Activado para suavizar bordes
- **Shadow Mapping**: Habilitado para proyección de sombras
- **Color de fondo**: Azul cian (#04B0C1)
- **Tamaño**: Fullscreen (window.innerWidth/Height)

**Código**:
```javascript
renderizador = new THREE.WebGLRenderer({antialias: true});
renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.shadowMap.enabled = true;
document.body.appendChild(renderizador.domElement);
```

---

#### `establecerEscenaBase()`
**Propósito**: Crear la escena 3D y cargar el fondo inicial.

**Implementación**:
- Crea una nueva THREE.Scene
- Carga textura de fondo (sky.jpg) usando TextureLoader
- Inicializa el contenedor mundo (Object3D) para agrupar objetos

**Detalle técnico**: El fondo se aplica como `scene.background`, no como skybox, para optimización.

---

### 2. Sistema de Cámaras

#### `inicializarCamarasJuego()`
**Propósito**: Configurar dos cámaras: principal (3ª persona) y aérea (mini-mapa).

**Cámara Principal (Perspectiva)**:
- **Tipo**: PerspectiveCamera
- **FOV**: 75 grados
- **Posición**: (0, 20, 40) - Detrás y encima de la bicicleta
- **Target**: (0, 5, 0) - Mirando a la bicicleta
- **Layers**: 0 y 1 (para ver objetos normales + iluminados por faro)

**OrbitControls**:
- **Min/Max Distance**: 20-100 unidades (evita zoom extremo)
- **Función**: Permite al jugador rotar la cámara con el mouse

**Cámara Aérea (Ortográfica)**:
- **Tipo**: OrthographicCamera
- **Frustum**: (-25, 25, 25, -25)
- **Posición**: (0, 100, 0) - Directamente arriba
- **Función**: Mini-mapa en esquina superior derecha

**Layers en Three.js**:
- **Layer 0**: Objetos normales (carretera)
- **Layer 1**: Objetos afectados por iluminación de la bicicleta
- Ambas cámaras ven ambos layers con `camera.layers.enable(1)`

---

### 3. Sistema de Iluminación

#### `configurarIluminacionEscena()`
**Propósito**: Crear un sistema de iluminación multi-fuente.

**Luces implementadas**:

1. **Luz Ambiente (AmbientLight)**:
   - Color: gris
   - Propósito: Iluminación base uniforme
   - Sin sombras

2. **Luz Direccional (DirectionalLight)**:
   - Color: marrón
   - Posición: (0, 450, 0)
   - Proyecta sombras
   - Simula el sol

3. **Luz Focal (SpotLight)**:
   - Color: naranja
   - Posición: (-100, 500, 0)
   - Penumbra: 0.1 (borde suave)
   - Distancia: 1500 unidades
   - Proyecta sombras

4. **Luz Puntual (PointLight)**:
   - Color: rojo
   - Intensidad: 0.1
   - Posición: (0, 800, -400)
   - Atenuación por distancia

**CameraHelpers**: Se crean helpers de debug (aunque no se visualizan) para cada luz con sombras.

---

#### `crearSistemaIluminacionBicicleta()`
**Propósito**: Crear el faro delantero de la bicicleta para modo nocturno.

**Características avanzadas**:

**SpotLight (Foco)**:
```javascript
iluminacionBicicleta = new THREE.SpotLight(0xffffff, 10);
iluminacionBicicleta.angle = Math.PI / 18;  // Ángulo estrecho (10°)
iluminacionBicicleta.penumbra = 0.02;       // Borde muy definido
iluminacionBicicleta.distance = 300;        // Alcance de 300 unidades
iluminacionBicicleta.decay = 1.5;           // Atenuación física realista
```

**Sistema de Layers (Técnica Avanzada)**:
```javascript
iluminacionBicicleta.layers.set(1);  // Solo afecta layer 1
```
- **Problema resuelto**: La luz no ilumina el suelo (layer 0)
- **Objetos iluminados**: Bicicleta, coches, monedas (layer 0 + 1)
- **Objetos NO iluminados**: Carretera (solo layer 0)

**Haz de Luz Visible**:
```javascript
var geometriaHaz = new THREE.ConeGeometry(8, 60, 32, 1, true);
var materialHaz = new THREE.MeshBasicMaterial({
    color: 0xffff99,      // Amarillo claro
    transparent: true,     // Permite opacidad
    opacity: 0.3,         // Semi-transparente
    side: THREE.DoubleSide // Visible desde dentro/fuera
});
```
- **Radio base**: 8 unidades
- **Altura**: 60 unidades
- **Rotación**: 90° en X para apuntar hacia adelante
- **Efecto**: Visualiza el cono de luz como en juegos AAA

---

### 4. Sistema de Entrada

#### `establecerSistemaEntrada()`
**Propósito**: Configurar el sistema de input de teclado.

**Implementación**:
```javascript
entradaTeclado = new THREEx.KeyboardState(renderizador.domElement);
renderizador.domElement.setAttribute("tabIndex", "0");
renderizador.domElement.focus();
entradaTeclado.domElement.addEventListener('keydown', procesarEntradaUsuario);
```

**Detalles técnicos**:
- `tabIndex="0"`: Hace el canvas focusable
- `.focus()`: Asegura que recibe eventos de teclado
- Event listener en 'keydown' para respuesta instantánea

---

#### `procesarEntradaUsuario()`
**Propósito**: Manejar las teclas presionadas durante el juego.

**Controles implementados**:

1. **Barra Espaciadora (Space)**:
   ```javascript
   if (entradaTeclado.pressed("space")) {
       realizarSaltoBicicleta();
   }
   ```
   - Ejecuta la mecánica de salto

2. **Flecha Izquierda**:
   ```javascript
   if (entradaTeclado.pressed("left") && vehiculoBicicleta.position.x > -45) {
       vehiculoBicicleta.position.x -= 1.0;
   }
   ```
   - Mueve la bicicleta hacia la izquierda
   - Límite: -45 unidades (borde de la carretera)
   - Velocidad: 1 unidad por frame

3. **Flecha Derecha**:
   - Similar a izquierda, límite: +45 unidades
   - Utiliza todo el ancho de la carretera (100 unidades)

**Prevención de movimiento durante colisión**:
```javascript
if (!estadoColisionado) {
    // ... movimiento lateral
}
```

---

### 5. Carga de Recursos 3D

#### `cargarRecursosVisuales()`
**Propósito**: Cargar todos los modelos GLTF de forma asíncrona.

**Sistema de carga inteligente**:
```javascript
var estadoCarga = {
    bicicleta: false,
    vehiculoPolicia: false,
    moneda: false
};

function verificarCargaCompleta() {
    if (estadoCarga.bicicleta && estadoCarga.vehiculoPolicia && estadoCarga.moneda) {
        construirEscenaCompleta();  // Solo cuando TODOS están listos
    }
}
```

**Problema resuelto**: 
- Antes: La escena se dibujaba antes de cargar todos los modelos
- Ahora: Espera a que todos los recursos estén disponibles
- Evita errores de referencias undefined

**Textura del suelo**:
```javascript
texturaSuelo.wrapS = THREE.RepeatWrapping;
texturaSuelo.wrapT = THREE.RepeatWrapping;
texturaSuelo.repeat.set(1, 1);
```
- Permite que la textura se repita en superficies grandes

---

#### `cargarModeloBicicleta(cargador, estado, callback)`
**Propósito**: Cargar el modelo GLTF de la bicicleta del jugador.

**Configuración del modelo**:
```javascript
modelo.scene.position.set(0, 5, 0);      // Y=5 (encima del suelo)
modelo.scene.scale.set(10, 10, 10);       // Escala 10x (modelo pequeño)
modelo.scene.rotation.y = 0;              // Mirando hacia -Z (adelante)
modelo.scene.receiveShadow = true;        // Recibe sombras
```

**Layers para iluminación selectiva**:
```javascript
vehiculoBicicleta.layers.enable(1);  // Layer 0 (default) + 1
```
- Permite que el faro de la bicicleta la ilumine
- También visible para ambas cámaras

**Targets de luces**:
```javascript
luzDireccional.target = modelo.scene;
luzFocal.target = modelo.scene;
```
- Las luces siguen automáticamente a la bicicleta

**Callback de progreso**:
```javascript
function(progreso) {
    var porcentaje = (progreso.loaded / progreso.total * 100).toFixed(0);
    console.log("bicicleta " + porcentaje + "% cargada");
}
```
- Útil para mostrar barra de carga (no implementada en UI)

**Después de cargar**:
- Llama a `crearSistemaIluminacionBicicleta()`
- Marca `estado.bicicleta = true`
- Ejecuta `callback()` que verifica si todo está listo

---

#### `cargarModeloPolicia()`
**Propósito**: Cargar el modelo base del coche de policía.

**Configuración**:
```javascript
modelo.scene.position.set(0, 0, -100);  // Fuera de vista inicial
modelo.scene.scale.set(3, 3, 3);        // Más pequeño que la bicicleta
```

**Habilitación de sombras en todos los meshes**:
```javascript
vehiculoPoliciaBase.traverse(function(nodo) {
    if (nodo.isMesh) {
        nodo.castShadow = true;
    }
});
```
- `.traverse()` recorre todo el árbol de objetos
- Asegura que todas las partes proyecten sombras

---

#### `cargarModeloMoneda()`
**Propósito**: Cargar el modelo base de la moneda coleccionable.

**Configuración**:
```javascript
modelo.scene.position.set(0, 5, -100);  // A la altura de la bicicleta
modelo.scene.scale.set(0.5, 0.5, 0.5);  // Pequeña (50% del tamaño base)
```

**Nota**: Este modelo se clona múltiples veces para crear las monedas en la carretera.

---

### 6. Construcción de la Escena

#### `construirEscenaCompleta()`
**Propósito**: Ensamblar todos los elementos 3D de la escena.

**Creación de la carretera**:
```javascript
var geometriaCarretera = new THREE.PlaneGeometry(100, 3000, 15, 15);
superficieCarretera = new THREE.Mesh(geometriaCarretera, materialCarretera);
superficieCarretera.rotation.x = -Math.PI / 2;  // Horizontal
superficieCarretera.position.set(0, 0, -1000);  // Centrada adelante
```

**Dimensiones**:
- **Ancho**: 100 unidades (X: -50 a +50)
- **Largo**: 3000 unidades (Z: -1000 a +2000)
- **Subdivisiones**: 15x15 (permite deformaciones si fuera necesario)

**Material**:
```javascript
var materialCarretera = new THREE.MeshLambertMaterial({
    wireframe: false,
    color: "white",
    map: texturaSuelo
});
```
- `MeshLambertMaterial`: Material simple con respuesta a luces
- Color blanco para que la textura se vea sin tintes

**Generación de obstáculos**:
```javascript
generarObstaculosAleatorios();
```
- Crea 15 elementos (mezcla de coches y monedas)

**Configuración de sombras**:
```javascript
superficieCarretera.castShadow = true;      // Proyecta sombras
superficieCarretera.receiveShadow = true;   // Recibe sombras
```

**Inicialización de bounding box**:
```javascript
cajaColisionBicicleta.setFromObject(vehiculoBicicleta);
```
- Crea la caja de colisión inicial de la bicicleta

**Visibilidad de luces según modo**:
```javascript
if (iluminacionBicicleta) {
    iluminacionBicicleta.visible = modoNocturno;
}
```
- Si está en modo día, el faro está apagado

---

#### `generarObstaculosAleatorios()`
**Propósito**: Crear la distribución inicial de obstáculos y monedas.

**Parámetros**:
```javascript
cantidadPolicias = 15;              // Total de elementos a generar
var distanciaEntreObstaculos = 50;  // Espaciado entre elementos
```

**Algoritmo de generación**:
```javascript
for (var indice = 0; indice < cantidadPolicias; indice++) {
    var posicionX = Math.floor(Math.random() * 90 - 45);  // Ancho carretera
    var posicionZ = -50 - (indice * distanciaEntreObstaculos); // Profundidad
    
    if (Math.random() < 0.50) {  // 50% probabilidad
        crearMonedaEnPosicion(posicionX, posicionZ);
    } else {
        crearPoliciaEnPosicion(posicionX, posicionZ);
    }
}
```

**Distribución espacial**:
- **Eje X**: Aleatorio entre -45 y +45 (usa todo el ancho)
- **Eje Z**: Comienza en -50 y va hacia atrás cada 50 unidades
- **Total de distancia**: 15 × 50 = 750 unidades de carretera inicial

**Balance 50/50**:
- `Math.random() < 0.50`: 50% de probabilidad de moneda
- Resto: coches de policía
- Garantiza variedad en el gameplay

---

#### `crearMonedaEnPosicion(x, z)`
**Propósito**: Instanciar una moneda en una posición específica.

**Proceso**:
1. **Clonación del modelo base**:
   ```javascript
   var copiaMoneda = objetoMonedaBase.clone();
   ```
   - `.clone()` crea una copia independiente del modelo

2. **Posicionamiento**:
   ```javascript
   copiaMoneda.position.set(x, 5, z);  // Y=5 (altura de la bicicleta)
   ```

3. **Configuración de sombras**:
   ```javascript
   copiaMoneda.receiveShadow = true;
   copiaMoneda.castShadow = true;
   ```

4. **Layer para iluminación**:
   ```javascript
   copiaMoneda.layers.enable(1);  // Puede ser iluminada por el faro
   ```

5. **Bounding Box**:
   ```javascript
   var cajaColision = new THREE.Box3();
   cajaColision.setFromObject(copiaMoneda);
   ```
   - `THREE.Box3`: Caja alineada con ejes (AABB)
   - `.setFromObject()`: Calcula automáticamente los límites

6. **Almacenamiento**:
   ```javascript
   coleccionMonedas.push(copiaMoneda);
   cajasColisionMonedas.push(cajaColision);
   ```
   - Arrays paralelos: mismo índice para objeto y su bounding box

7. **Añadir a escena**:
   ```javascript
   contenedorMundo.add(copiaMoneda);
   ```

---

#### `crearPoliciaEnPosicion(x, z)`
**Propósito**: Instanciar un coche de policía en una posición específica.

**Diferencias con monedas**:
```javascript
copiaPolicia.position.set(x, 0, z);  // Y=0 (sobre el suelo)
```
- Los coches están en el suelo, las monedas levitadas

**Proceso idéntico**:
- Clonación, sombras, layers, bounding box, almacenamiento
- Se añade a `coleccionPolicias` y `cajasColisionPolicias`

---

### 7. Sistema de Animaciones

#### `realizarSaltoBicicleta()`
**Propósito**: Ejecutar la mecánica de salto con animación suave.

**Validaciones previas**:
```javascript
if (estadoSaltando || estadoColisionado || !estadoJuegoIniciado) {
    return;  // No permitir salto
}
```
- No saltar mientras ya está saltando (doble salto)
- No saltar si ha colisionado (juego terminado)
- No saltar si el juego no ha empezado

**Parámetros del salto**:
```javascript
var nivelSuelo = 5;        // Posición Y del suelo
var alturaSalto = 10;      // Incremento de altura
var duracionFase = 400;    // Milisegundos por fase
```
- **Altura máxima**: 5 + 10 = 15 unidades
- **Duración total**: 400ms (subida) + 400ms (bajada) = 800ms

**Animación con TWEEN.js**:

**Fase de Ascenso**:
```javascript
var faseAscenso = new TWEEN.Tween(vehiculoBicicleta.position).to(
    {y: nivelSuelo + alturaSalto},
    duracionFase,
    TWEEN.Easing.Quadratic.Out  // Desaceleración al final
);
```
- `Quadratic.Out`: Comienza rápido, desacelera al llegar
- Simula física realista (gravedad al subir)

**Fase de Descenso**:
```javascript
var faseDescenso = new TWEEN.Tween(vehiculoBicicleta.position).to(
    {y: nivelSuelo},
    duracionFase,
    TWEEN.Easing.Quadratic.In   // Aceleración
);
```
- `Quadratic.In`: Comienza lento, acelera al bajar
- Simula caída con gravedad

**Callback de finalización**:
```javascript
faseDescenso.onComplete(function() {
    estadoSaltando = false;
    vehiculoBicicleta.position.y = nivelSuelo;  // Asegurar posición exacta
});
```
- Resetea el flag de estado
- Corrige cualquier error de float acumulado

**Encadenamiento**:
```javascript
faseAscenso.chain(faseDescenso);  // Automáticamente inicia descenso
faseAscenso.start();
```
- `.chain()`: Cuando termina faseAscenso, inicia faseDescenso
- `.start()`: Comienza la animación

**Marcador de estado**:
```javascript
estadoSaltando = true;  // Al inicio del método
```
- Previene saltos múltiples simultáneos

---

#### `aplicarAnimacionMonedas()`
**Propósito**: Crear efecto de "respiración" en las monedas.

**Algoritmo**:
```javascript
var factorPulso = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
```

**Análisis matemático**:
- `Date.now()`: Timestamp en milisegundos
- `* 0.005`: Convierte ms a radianes (frecuencia de oscilación)
- `Math.sin()`: Función senoidal [-1, 1]
- `* 0.1`: Amplitud de la oscilación
- `0.5 +`: Escala base

**Resultado**:
- Escala oscila entre 0.4 y 0.6 (±20% del tamaño base)
- Frecuencia: `2π / (1000/0.005) ≈ 0.031 Hz` (un ciclo cada ~32 segundos)
- Aplicación uniforme en X, Y, Z:
  ```javascript
  coleccionMonedas[i].scale.set(factorPulso, factorPulso, factorPulso);
  ```

**Efecto visual**:
- Monedas "respiran" suavemente
- Hace que destaquen visualmente
- Indica que son coleccionables

---

### 8. Sistema de Colisiones

#### `detectarColisionConPolicias(cajasObstaculos, cajaBicicleta)`
**Propósito**: Verificar si la bicicleta ha chocado con algún coche.

**Algoritmo de detección AABB**:
```javascript
for (var i = 0; i < cajasObstaculos.length; i++) {
    if (cajasObstaculos[i].intersectsBox(cajaBicicleta)) {
        return true;  // Colisión detectada
    }
}
return false;  // Sin colisiones
```

**THREE.Box3.intersectsBox()**:
- Algoritmo: Separating Axis Theorem (SAT) simplificado
- Compara las 6 caras de ambas cajas
- **Complejidad**: O(n) donde n = número de obstáculos
- **Ventajas**: Muy rápido, ideal para juegos en tiempo real
- **Limitaciones**: Cajas alineadas a ejes (no rotadas)

**Retorno temprano**:
- En cuanto detecta UNA colisión, retorna `true`
- No necesita verificar el resto
- Optimización importante cuando hay muchos obstáculos

---

#### `actualizarTodasLasCajasColision()`
**Propósito**: Recalcular los bounding boxes en cada frame.

**¿Por qué es necesario?**:
- Los objetos se mueven cada frame
- Los bounding boxes son estáticos hasta que se recalculan
- `setFromObject()` recalcula basándose en la posición actual

**Proceso**:
```javascript
cajaColisionBicicleta.setFromObject(vehiculoBicicleta);

for (var i = 0; i < cajasColisionPolicias.length; i++) {
    cajasColisionPolicias[i].setFromObject(coleccionPolicias[i]);
}

for (var i = 0; i < cajasColisionMonedas.length; i++) {
    cajasColisionMonedas[i].setFromObject(coleccionMonedas[i]);
}
```

**Coste computacional**:
- Se ejecuta CADA FRAME (60 veces por segundo)
- `setFromObject()` recorre todos los vértices del mesh
- Optimizable con bounding spheres, pero menos preciso

---

#### `obtenerIndicesMonedasColisionadas(cajasMonedas, cajaBicicleta)`
**Propósito**: Encontrar todas las monedas tocadas en este frame.

**Retorna un array de índices**:
```javascript
var indicesColisionados = [];

for (var i = 0; i < cajasMonedas.length; i++) {
    if (cajasMonedas[i].intersectsBox(cajaBicicleta)) {
        indicesColisionados.push(i);
    }
}

return indicesColisionados;
```

**Diferencia con detección de coches**:
- No retorna al primer match
- Recoge TODOS los índices de monedas colisionadas
- Permite recolectar múltiples monedas en un frame (raro pero posible)

---

#### `procesarColisionesMonedas()`
**Propósito**: Recolectar monedas y actualizar el juego.

**Iteración inversa (Técnica importante)**:
```javascript
for (var j = indicesColisionados.length - 1; j >= 0; j--) {
    var indiceMoneda = indicesColisionados[j];
    // ...
}
```

**¿Por qué iterar hacia atrás?**:
- Vamos a eliminar elementos con `.splice()`
- Eliminar de adelante hacia atrás altera los índices siguientes
- Eliminar de atrás hacia adelante mantiene los índices válidos

**Proceso de recolección**:
1. **Eliminar de la escena**:
   ```javascript
   contenedorMundo.remove(coleccionMonedas[indiceMoneda]);
   ```

2. **Eliminar de los arrays**:
   ```javascript
   coleccionMonedas.splice(indiceMoneda, 1);
   cajasColisionMonedas.splice(indiceMoneda, 1);
   ```
   - `.splice(index, 1)`: Elimina 1 elemento en `index`
   - Mantiene sincronizados ambos arrays

3. **Actualizar contador**:
   ```javascript
   cantidadMonedasRecogidas++;
   elementoContadorMonedas.innerHTML = "MONEDAS: " + cantidadMonedasRecogidas;
   ```

4. **Actualizar GUI global**:
   ```javascript
   if (window.configuracionGUI) {
       window.configuracionGUI.monedasRecolectadasGUI = cantidadMonedasRecogidas;
   }
   ```
   - Variable global para posibles futuras estadísticas

5. **Log de debug**:
   ```javascript
   console.log("Moneda recolectada! Total: " + cantidadMonedasRecogidas);
   ```

---

### 9. Lógica del Juego

#### `procesarLogicaJuego()`
**Propósito**: Bucle principal del gameplay que se ejecuta cada frame.

**Cálculo del tiempo transcurrido**:
```javascript
var momentoActual = Date.now();
var tiempoTranscurrido = momentoActual - marcaTiempoInicio;
var segundosTranscurridos = tiempoTranscurrido / 1000;
```
- `Date.now()`: Timestamp actual en ms
- Resta con timestamp de inicio = tiempo de partida
- División entre 1000 = conversión a segundos

**Actualización del temporizador UI**:
```javascript
elementoTextoTiempo.innerHTML = "TIEMPO: " + segundosTranscurridos.toFixed(1) + "s";
```
- `.toFixed(1)`: Redondea a 1 decimal (ej: 12.3s)

**Secuencia de operaciones**:
1. `ajustarVelocidadProgresiva(segundosTranscurridos)` - Aumenta dificultad
2. `moverObstaculos()` - Mueve coches hacia adelante
3. `moverMonedas()` - Mueve monedas hacia adelante
4. `actualizarTodasLasCajasColision()` - Recalcula bounding boxes
5. `procesarColisionesMonedas()` - Detecta recolecciones
6. Verificación de colisión con coches (solo si no está saltando)
7. `finalizarJuego()` si hay colisión

**Condición de salto**:
```javascript
if (!estadoSaltando) {
    estadoColisionado = detectarColisionConPolicias(cajasColisionPolicias, cajaColisionBicicleta);
}
```
- **Mecánica clave**: Mientras saltas, eres invulnerable
- Permite esquivar obstáculos con timing

---

#### `ajustarVelocidadProgresiva(tiempoSegundos)`
**Propósito**: Incrementar la dificultad con el tiempo.

**Fórmula de progresión**:
```javascript
var velocidadBase = 2.0;
var incrementoPorDecena = 0.5;
velocidadObstaculos = velocidadBase + (tiempoSegundos / 10) * incrementoPorDecena;
```

**Ejemplos de velocidad**:
- Tiempo 0s: `2.0 + (0/10) * 0.5 = 2.0 unidades/frame`
- Tiempo 10s: `2.0 + (10/10) * 0.5 = 2.5 unidades/frame`
- Tiempo 30s: `2.0 + (30/10) * 0.5 = 3.5 unidades/frame`
- Tiempo 60s: `2.0 + (60/10) * 0.5 = 5.0 unidades/frame`

**Incremento**:
- +0.5 unidades cada 10 segundos
- Progresión lineal
- Sin límite máximo (hardcore mode!)

**A 60 FPS**:
- 2.0 u/f = 120 unidades/segundo
- 5.0 u/f = 300 unidades/segundo

---

#### `moverObstaculos()`
**Propósito**: Simular movimiento de los coches hacia la bicicleta.

**Movimiento hacia adelante**:
```javascript
coleccionPolicias[i].position.z += velocidadObstaculos;
```
- Incrementa Z positivo (hacia la cámara)
- Simula que el mundo se mueve hacia el jugador
- En realidad, la bicicleta está estática

**Sistema de respawn (endless)**:
```javascript
if (coleccionPolicias[i].position.z > 50) {  // Pasó la bicicleta
    coleccionPolicias[i].position.z = -1000;  // Volver atrás
    coleccionPolicias[i].position.x = Math.floor(Math.random() * 90 - 45);
}
```

**Parámetros del respawn**:
- **Límite**: Z > 50 (detrás del jugador)
- **Nueva posición Z**: -1000 (muy adelante)
- **Nueva posición X**: Aleatoria en [-45, 45]

**Ciclo infinito**:
- Los coches se reciclan constantemente
- No se crean ni destruyen objetos (optimización de memoria)
- Carretera "infinita" con solo 15 obstáculos

---

#### `moverMonedas()`
**Propósito**: Mover las monedas con el mismo sistema que los obstáculos.

**Código idéntico a obstáculos**:
```javascript
coleccionMonedas[i].position.z += velocidadObstaculos;

if (coleccionMonedas[i].position.z > 50) {
    coleccionMonedas[i].position.z = -1000;
    coleccionMonedas[i].position.x = Math.floor(Math.random() * 90 - 45);
}
```

**Sincronización**:
- Misma velocidad que los coches
- Mismo sistema de respawn
- Crea sensación de mundo cohesivo

---

#### `activarJuego()`
**Propósito**: Iniciar el gameplay cuando el usuario presiona "Comenzar".

**Validación**:
```javascript
if (!estadoColisionado) {
    // Solo iniciar si no hay game over activo
}
```

**Acciones**:
1. `estadoJuegoIniciado = true` - Activa el update loop
2. `marcaTiempoInicio = Date.now()` - Guarda timestamp de inicio
3. `elementoTextoBoton.innerHTML = ""` - Oculta el mensaje de instrucciones

**Nota**: El temporizador empieza desde este momento.

---

#### `finalizarJuego()`
**Propósito**: Terminar la partida cuando hay una colisión.

**Acciones**:
1. `console.log("Colisión")` - Debug log
2. `estadoJuegoIniciado = false` - Detiene el update loop
3. **Actualizar UI**:
   ```javascript
   elementoTextoBoton.innerHTML = "FIN! Presiona 'Reiniciar' para volver a jugar";
   elementoTextoBoton.style.backgroundColor = 'rgba(255, 0, 0, 0.85)';  // Rojo
   elementoTextoBoton.style.border = '3px solid #ffff00';  // Borde amarillo
   ```

**Efectos visuales de Game Over**:
- Mensaje de fin de partida
- Cambio de color a rojo (alerta)
- Borde amarillo para contraste

**Estado del juego**:
- Todo sigue visible (no se oculta nada)
- El temporizador se congela
- Controles desactivados (por `estadoJuegoIniciado = false`)

---

#### `reiniciarSistemaJuego()`
**Propósito**: Resetear completamente el juego a estado inicial.

**Reseteo de variables**:
```javascript
estadoJuegoIniciado = false;
estadoColisionado = false;
estadoSaltando = false;
cantidadMonedasRecogidas = 0;
```

**Recreación de la escena**:
```javascript
escenaJuego = new THREE.Scene();
```
- **Importante**: Crea una NUEVA escena
- Elimina todos los objetos anteriores de memoria
- Evita bugs de estado residual

**Mantener el modo actual**:
```javascript
var rutaFondo = modoNocturno ? "../textures/noche.jpg" : "../textures/sky.jpg";
escenaJuego.background = new THREE.TextureLoader().load(rutaFondo);
```
- Si estabas en modo noche, permanece en modo noche
- Persistencia de preferencias del usuario

**Re-añadir cámaras**:
```javascript
escenaJuego.add(camaraAerea);
escenaJuego.add(camaraJugador);
```
- Las cámaras persisten (no se recrean)
- Solo se re-añaden a la nueva escena

**Reconfiguración completa**:
1. `configurarIluminacionEscena()` - Nuevas luces
2. `cargarRecursosVisuales()` - Recarga modelos
3. Reseteo de UI (temporizador, botón, contador)
4. Reseteo de GUI global

---

### 10. Interfaz de Usuario

#### `construirInterfazUsuario()`
**Propósito**: Crear todos los elementos HTML de la interfaz.

**Componentes creados**:
1. Display del temporizador (centro superior)
2. Botón de instrucciones (centro inferior)
3. Contador de monedas (derecha, bajo mini-mapa)
4. Panel de controles (izquierda superior)
5. Configuración global

**Orden de creación**: Importante para z-index y sobreposiciones.

---

#### `crearDisplayTemporizador()`
**Propósito**: Crear el elemento HTML del cronómetro.

**Estilo aplicado (Glassmorphism)**:
```javascript
backgroundColor: 'rgba(0, 0, 0, 0.7)',     // Fondo semi-transparente negro
border: '3px solid #00ff00',                // Borde verde neón
borderRadius: '15px',                       // Esquinas redondeadas
boxShadow: '0 4px 15px rgba(0, 255, 0, 0.5)', // Sombra verde brillante
backdropFilter: 'blur(10px)',               // Efecto de vidrio esmerilado
```

**Diseño moderno**:
- **Glassmorphism**: Fondo difuminado semi-transparente
- **Neón**: Borde y sombra verde brillante
- **Tipografía**: Arial, 24px, negrita, blanco
- **Posición**: Centrado horizontalmente, top 20px

**Transform para centrar**:
```javascript
left: '50%',
transform: 'translateX(-50%)'
```
- `left: 50%` coloca el borde izquierdo al centro
- `translateX(-50%)` mueve el elemento hacia la izquierda la mitad de su ancho
- Resultado: elemento perfectamente centrado

---

#### `crearBotonInstrucciones()`
**Propósito**: Crear el elemento de instrucciones en el centro inferior.

**Diferencias con temporizador**:
```javascript
backgroundColor: 'rgba(255, 165, 0, 0.85)',  // Naranja
border: '3px solid #ffffff',                  // Borde blanco
boxShadow: '0 4px 15px rgba(255, 165, 0, 0.6)', // Sombra naranja
cursor: 'pointer',                            // Indica clickable
transition: 'all 0.3s ease'                   // Transiciones suaves
```

**Posicionamiento**:
```javascript
bottom: '20px',  // 20px desde abajo (no desde arriba)
left: '50%',
transform: 'translateX(-50%)'
```

**Interactividad**:
- Cambia de aspecto on hover (implementado en otros botones)
- `cursor: pointer` indica que es clickable

---

#### `crearContadorMonedas()`
**Propósito**: Mostrar el contador de monedas recolectadas.

**Posicionamiento calculado**:
```javascript
top: 'calc(25vh + 30px)',  // Debajo del mini-mapa
right: '20px'               // Alineado a la derecha
```

**Cálculo explicado**:
- Mini-mapa: 25% de viewport height
- `+ 30px`: Margen de separación
- Resultado: Justo debajo de la cámara aérea

**Estilo temático (oro)**:
```javascript
backgroundColor: 'rgba(255, 215, 0, 0.85)',  // Dorado
border: '3px solid #ff8c00',                  // Borde naranja oscuro
boxShadow: '0 4px 15px rgba(255, 215, 0, 0.6)', // Sombra dorada
```
- Refleja visualmente que son monedas de oro

---

#### `aplicarEstiloElemento(elemento, estilos)`
**Propósito**: Función helper para aplicar múltiples estilos CSS.

**Implementación**:
```javascript
function aplicarEstiloElemento(elemento, estilos) {
    for (var propiedad in estilos) {
        elemento.style[propiedad] = estilos[propiedad];
    }
}
```

**Ventajas**:
- Código más limpio y legible
- Evita repetir `elemento.style.` múltiples veces
- Permite pasar objetos de estilo como configuración

**Uso**:
```javascript
aplicarEstiloElemento(miElemento, {
    color: 'red',
    fontSize: '20px',
    padding: '10px'
});
```

---

#### `construirPanelControles()`
**Propósito**: Crear el panel de 3 botones en la esquina superior izquierda.

**Contenedor con Flexbox**:
```javascript
var contenedorBotones = document.createElement('div');
aplicarEstiloElemento(contenedorBotones, {
    display: 'flex',
    flexDirection: 'column',  // Botones en columna vertical
    gap: '15px'               // Espacio entre botones
});
```

**Botones creados**:
1. **Comenzar**: Verde `rgba(50, 150, 50, 0.9)`
2. **Reiniciar**: Rojo `rgba(200, 80, 80, 0.9)`
3. **Modo Noche/Día**: Azul `rgba(60, 100, 180, 0.9)`

**Variable global para botón de modo**:
```javascript
window.botonModoNocturno = crearBotonControl(...);
```
- Accesible desde cualquier función
- Necesario para actualizar su texto dinámicamente

---

#### `crearBotonControl(texto, colorFondo, funcionClick)`
**Propósito**: Factory function para crear botones con estilo consistente.

**Parámetros**:
- `texto`: Texto a mostrar en el botón
- `colorFondo`: Color de fondo del botón
- `funcionClick`: Función a ejecutar al hacer clic

**Estilos base**:
```javascript
padding: '15px 30px',
fontSize: '16px',
fontWeight: 'bold',
color: '#ffffff',
backgroundColor: colorFondo,
border: 'none',
borderRadius: '8px',
cursor: 'pointer',
boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
transition: 'all 0.2s ease',
minWidth: '150px'
```

**Efectos hover**:
```javascript
boton.onmouseenter = function() {
    boton.style.transform = 'translateY(-2px)';  // Levantamiento
    boton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';  // Sombra más grande
};
```
- Simula elevación 3D
- Feedback visual inmediato

**Restauración hover**:
```javascript
boton.onmouseleave = function() {
    boton.style.transform = 'translateY(0)';
    boton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
};
```

**Asignación de función**:
```javascript
boton.onclick = funcionClick;
```
- Conecta el botón con su funcionalidad

**Retorno**:
```javascript
return boton;
```
- Permite encadenamiento y añadir al DOM

---

### 11. Sistema de Modo Nocturno

#### `cambiarModoIluminacion()`
**Propósito**: Alternar entre modo día y modo noche.

**Toggle del estado**:
```javascript
modoNocturno = !modoNocturno;  // Invertir boolean
```

**Cambio de fondo**:
```javascript
var rutaFondo = modoNocturno ? "../textures/noche.jpg" : "../textures/sky.jpg";
escenaJuego.background = new THREE.TextureLoader().load(rutaFondo);
```
- **Modo noche**: Imagen de cielo nocturno
- **Modo día**: Imagen de cielo diurno
- Operador ternario para selección condicional

**Control de la luz de la bicicleta**:
```javascript
if (iluminacionBicicleta) {
    iluminacionBicicleta.visible = modoNocturno;        // On/Off
    iluminacionBicicleta.intensity = modoNocturno ? 15 : 0;  // Intensidad
}
```
- Solo visible en modo noche
- Intensidad 15 (muy brillante) o 0

**Control del haz visible**:
```javascript
if (hazLuzVisible) {
    hazLuzVisible.visible = modoNocturno;
}
```
- Cono de luz solo visible de noche

**Actualización del botón**:
```javascript
actualizarTextoBotonNoche();
```
- Cambia el texto del botón para reflejar la acción opuesta

**Logs de debug**:
```javascript
var mensajeConsola = modoNocturno ? 
    "Modo noche activado - Luz de la bicicleta encendida" : 
    "Modo día activado - Luz de la bicicleta apagada";
console.log(mensajeConsola);
```

---

#### `actualizarTextoBotonNoche()`
**Propósito**: Cambiar el texto del botón según el modo actual.

**Lógica de alternancia**:
```javascript
if (window.botonModoNocturno) {
    window.botonModoNocturno.textContent = modoNocturno ? "Modo Dia" : "Modo Noche";
}
```

**UX Design**:
- **En modo día**: Botón dice "Modo Noche" (acción a realizar)
- **En modo noche**: Botón dice "Modo Dia" (acción a realizar)
- El botón siempre indica la acción SIGUIENTE, no el estado actual

---

#### `actualizarPosicionIluminacion()`
**Propósito**: Hacer que el faro siga a la bicicleta en cada frame.

**Actualización del SpotLight**:
```javascript
if (iluminacionBicicleta && vehiculoBicicleta) {
    var offsetY = 4;    // 4 unidades arriba de la bicicleta
    var offsetZ = -10;  // 10 unidades adelante
    var targetZ = -150; // Apunta muy adelante
    
    iluminacionBicicleta.position.set(
        vehiculoBicicleta.position.x,
        vehiculoBicicleta.position.y + offsetY,
        vehiculoBicicleta.position.z + offsetZ
    );
    
    iluminacionBicicleta.target.position.set(
        vehiculoBicicleta.position.x,  // Mismo X (no se desvía)
        0,                              // Apunta al suelo
        vehiculoBicicleta.position.z + targetZ  // Muy adelante
    );
}
```

**Posicionamiento del haz visible**:
```javascript
if (hazLuzVisible && vehiculoBicicleta) {
    hazLuzVisible.position.set(
        vehiculoBicicleta.position.x,
        vehiculoBicicleta.position.y + 4,
        vehiculoBicicleta.position.z - 33  // Posición del cono
    );
}
```

**Sincronización perfecta**:
- Se ejecuta cada frame
- La luz siempre está en la posición correcta
- Target se actualiza dinámicamente

---

### 12. Bucle de Renderizado

#### `ejecutarBucleRenderizado()`
**Propósito**: Loop principal del juego a 60 FPS.

**Recursión con requestAnimationFrame**:
```javascript
requestAnimationFrame(ejecutarBucleRenderizado);
```
- **No es recursión infinita**: El navegador controla la ejecución
- Se ejecuta antes del siguiente repaint del navegador
- Normalmente 60 veces por segundo (60 FPS)
- Se pausa automáticamente cuando la pestaña está en background

**Actualización del estado**:
```javascript
actualizarEstadoJuego();
```
- Ejecuta toda la lógica del juego
- TWEEN updates, movimientos, colisiones, etc.

**Renderizado de vista principal**:
```javascript
renderizador.setViewport(0, 0, window.innerWidth, window.innerHeight);
renderizador.render(escenaJuego, camaraJugador);
```
- `setViewport()`: Define el área de renderizado (fullscreen)
- `render()`: Dibuja la escena desde la perspectiva de la cámara

**Renderizado del mini-mapa**:
```javascript
renderizarVistaAerea();
```
- Se renderiza sobre la vista principal
- Usa scissor test para limitar el área

---

#### `renderizarVistaAerea()`
**Propósito**: Renderizar el mini-mapa en la esquina superior derecha.

**Activar scissor test**:
```javascript
renderizador.setScissorTest(true);
```
- Limita el renderizado a un rectángulo específico
- Evita que la segunda cámara sobrescriba toda la pantalla

**Cálculo de tamaño responsivo**:
```javascript
var proporcion = window.innerWidth / window.innerHeight;
var esPaisaje = proporcion > 1.0;

var tamanioMiniatura = esPaisaje ? window.innerHeight / 4 : window.innerWidth / 4;
```
- **Landscape**: Mini-mapa es 25% de la altura
- **Portrait**: Mini-mapa es 25% del ancho
- Mantiene tamaño consistente en diferentes dispositivos

**Posicionamiento en esquina superior derecha**:
```javascript
var posicionX = window.innerWidth - tamanioMiniatura;
var posicionY = window.innerHeight - tamanioMiniatura;
```
- Resta el tamaño para alinear a la derecha/arriba

**Configuración de viewport y scissor**:
```javascript
if (esPaisaje) {
    renderizador.setScissor(posicionX, posicionY, window.innerHeight / 4, window.innerHeight / 4);
    renderizador.setViewport(posicionX, posicionY, window.innerHeight / 4, window.innerHeight / 4);
} else {
    // Versión portrait
}
```
- `setScissor()`: Define el área de recorte
- `setViewport()`: Define el área de renderizado
- Ambos deben coincidir para el mini-mapa

**Renderizado de la cámara aérea**:
```javascript
renderizador.render(escenaJuego, camaraAerea);
```
- Renderiza la misma escena desde la cámara ortográfica

**Desactivar scissor test**:
```javascript
renderizador.setScissorTest(false);
```
- Importante: Resetear para el siguiente frame
- Si no se desactiva, el siguiente frame estará recortado

---

#### `ajustarProporcionPantalla()`
**Propósito**: Responder al evento de resize de la ventana.

**Event listener**:
```javascript
window.addEventListener("resize", ajustarProporcionPantalla);
```

**Ajustes al redimensionar**:
```javascript
renderizador.setSize(window.innerWidth, window.innerHeight);
```
- Ajusta el canvas al nuevo tamaño

```javascript
camaraJugador.aspect = window.innerWidth / window.innerHeight;
```
- Actualiza la relación de aspecto de la cámara

```javascript
camaraJugador.updateProjectionMatrix();
```
- **Crucial**: Recalcula la matriz de proyección
- Si no se llama, la imagen se verá distorsionada

**Nota**: La cámara ortográfica (aérea) no necesita actualización de aspect ratio.

---

### 13. Función Principal

#### `principal()`
**Propósito**: Entry point del juego.

**Ejecución**:
```javascript
function principal() {
    inicializar();
    ejecutarBucleRenderizado();
}
```

**Orden de ejecución**:
1. `inicializar()`: Configuración completa (síncrona excepto modelos GLTF)
2. `ejecutarBucleRenderizado()`: Inicia el loop infinito

**Llamada desde HTML**:
```html
<body onload="principal()">
```
- Se ejecuta cuando el DOM está completamente cargado
- Garantiza que `document.body` existe

---

## 🎨 Características Implementadas

### 1. Sistema de Cámaras Dual
- **Cámara principal**: 3ª persona con OrbitControls
- **Mini-mapa**: Vista aérea en esquina superior derecha
- Renderizado simultáneo con scissor test

### 2. Mecánica de Salto
- Animación suave con TWEEN.js
- Easings físicamente realistas (Quadratic.Out/In)
- Invulnerabilidad durante el salto

### 3. Sistema de Colisiones AABB
- Detección eficiente con THREE.Box3
- Actualización dinámica de bounding boxes
- Detección de múltiples monedas por frame

### 4. Modo Nocturno
- Toggle entre día/noche
- Fondo dinámico (sky.jpg / noche.jpg)
- Faro delantero de la bicicleta
- Haz de luz visible (geometría cónica)
- Sistema de layers para iluminación selectiva

### 5. Dificultad Progresiva
- Velocidad aumenta linealmente con el tiempo
- Fórmula: `2.0 + (t/10) * 0.5`
- Sin límite máximo

### 6. Sistema de Respawn Infinito
- Obstáculos se reciclan al pasar
- Posición X aleatoria en cada respawn
- Carretera "infinita" con recursos limitados

### 7. Interfaz Moderna
- Glassmorphism con backdrop-filter
- Neón effects con box-shadow
- Botones con hover effects
- Diseño responsivo

### 8. Animaciones Visuales
- Monedas con efecto de "respiración"
- TWEEN.js para animaciones suaves
- Interpolaciones con easings

### 9. Carga Asíncrona Inteligente
- Sistema de tracking de carga de modelos
- Callback solo cuando TODOS están listos
- Evita errores de referencias undefined

### 10. Optimizaciones
- Clonación de modelos base (no recarga)
- Reciclaje de obstáculos (no creación/destrucción)
- Bounding boxes en lugar de collision meshes complejos

---

## 🔬 Técnicas Avanzadas Utilizadas

### 1. Three.js Layers
```javascript
iluminacionBicicleta.layers.set(1);  // Solo layer 1
vehiculoBicicleta.layers.enable(1);  // Layers 0 y 1
```
- Permite iluminación selectiva
- El suelo (layer 0) no se ilumina por el faro (layer 1)

### 2. TWEEN.js Chaining
```javascript
faseAscenso.chain(faseDescenso);
```
- Encadenamiento automático de animaciones
- Sin callbacks anidados (cleaner code)

### 3. Scissor Test para Multi-viewport
```javascript
renderizador.setScissorTest(true);
renderizador.setScissor(x, y, w, h);
renderizador.render(escena, cameraAerea);
```
- Múltiples cámaras en un solo canvas
- Más eficiente que múltiples canvas

### 4. Factory Pattern para UI
```javascript
function crearBotonControl(texto, color, funcion) {
    // ...
    return boton;
}
```
- Reutilización de código
- Consistencia visual

### 5. Gestión de Estado con Flags Booleanos
```javascript
estadoSaltando, estadoColisionado, estadoJuegoIniciado
```
- Control preciso del flujo del juego
- Prevención de estados inválidos

### 6. Iteración Inversa para Eliminación
```javascript
for (var j = array.length - 1; j >= 0; j--) {
    array.splice(j, 1);
}
```
- Evita bugs de índices al eliminar elementos

### 7. Callback Pattern para Carga Asíncrona
```javascript
function verificarCargaCompleta() {
    if (todoCargado) {
        construirEscenaCompleta();
    }
}
```
- Sincronización de múltiples recursos asíncronos

---

## 🚀 Flujo de Ejecución Completo

1. **HTML carga** → `<body onload="principal()">`
2. **principal()** → Llama `inicializar()`
3. **inicializar()** → 
   - Configura renderizador, escena, cámaras, luces, input, UI
   - Inicia carga asíncrona de modelos GLTF
4. **Modelos se cargan** → Cada uno marca `estado[modelo] = true`
5. **Último modelo carga** → `verificarCargaCompleta()` llama `construirEscenaCompleta()`
6. **construirEscenaCompleta()** → Crea carretera y genera obstáculos
7. **principal()** → Llama `ejecutarBucleRenderizado()`
8. **Loop infinito**:
   - `actualizarEstadoJuego()`
     - TWEEN.update()
     - Animaciones de monedas
     - Actualización de iluminación
     - Si juegoIniciado:
       - Actualizar timer
       - Incrementar velocidad
       - Mover obstáculos/monedas
       - Actualizar bounding boxes
       - Detectar colisiones con monedas → Recolectar
       - Si no saltando: Detectar colisión con coches → Game Over
   - Renderizar vista principal
   - Renderizar mini-mapa
9. **Usuario hace clic "Comenzar"** → `activarJuego()`
   - `estadoJuegoIniciado = true`
   - Comienza el gameplay real
10. **Usuario hace clic "Reiniciar"** → `reiniciarSistemaJuego()`
    - Resetea todo y vuelve al paso 3

---

## 📊 Estructura de Datos

### Arrays Paralelos
```javascript
coleccionPolicias[i]         ←→ cajasColisionPolicias[i]
coleccionMonedas[i]          ←→ cajasColisionMonedas[i]
```
- Mismo índice para objeto y su bounding box
- Sincronización al eliminar/añadir

### Jerarquía de Objetos 3D
```
escenaJuego
├── camaraJugador
├── camaraAerea
├── luzAmbiente
├── luzDireccional
├── luzFocal
├── luzPuntual
├── vehiculoBicicleta
│   ├── iluminacionBicicleta
│   │   └── iluminacionBicicleta.target
│   └── hazLuzVisible
└── contenedorMundo
    ├── superficieCarretera
    ├── coleccionPolicias[0...14]
    └── coleccionMonedas[0...n]
```

---

## 🎓 Conclusión

Este proyecto demuestra un dominio avanzado de:
- **Three.js**: Renderizado 3D, cámaras, luces, sombras, layers
- **WebGL**: Optimización de rendimiento, multi-viewport
- **JavaScript**: Programación orientada a eventos, callbacks, async
- **TWEEN.js**: Animaciones suaves y easings
- **Game Development**: Loops de juego, física simple, detección de colisiones
- **UI/UX**: Diseño moderno, feedback visual, responsive design
- **Arquitectura**: Código modular, separación de responsabilidades

Total de funciones implementadas: **45**  
Total de líneas de código: **~895**  
Tecnologías integradas: **7+**

---

**Autor**: Daniel  
**Curso**: Máster GPC - Proyecto Final  
**Tecnología Principal**: Three.js r140 + WebGL

