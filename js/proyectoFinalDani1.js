// Variables del sistema de renderizado
var renderizador, escenaJuego, camaraJugador, camaraAerea;
var controlesOrbitales, entradaTeclado;

// Modelos 3D del juego
var vehiculoBicicleta, vehiculoPoliciaBase, objetoMonedaBase;
var superficieCarretera, contenedorMundo;

// Listas de objetos en escena
var coleccionPolicias, coleccionMonedas;
var cajasColisionPolicias, cajasColisionMonedas;
var cajaColisionBicicleta;

// Sistema de iluminación
var luzAmbiente, luzDireccional, luzFocal, luzPuntual;
var asistenteLuzDireccional, asistenteLuzFocal, asistenteLuzPuntual;
var iluminacionBicicleta, hazLuzVisible;

// Variables de estado del juego
var estadoColisionado, estadoSaltando, estadoJuegoIniciado;
var cantidadPolicias, cantidadMonedasRecogidas;
var velocidadObstaculos, modoNocturno;

// Variables de tiempo
var marcaTiempoInicio, desplazamientoLateralBici;

// Elementos de interfaz
var elementoTextoTiempo, elementoTextoBoton, elementoContadorMonedas;

// Texturas
var texturaSuelo;

function configurarSistemaRenderizado() {
    renderizador = new THREE.WebGLRenderer({antialias: true});
    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.setClearColor(new THREE.Color(0x04B0C1), 1.0);
    renderizador.shadowMap.enabled = true;
    document.body.appendChild(renderizador.domElement);
}

function establecerEscenaBase() {
    escenaJuego = new THREE.Scene();
    var cargadorFondo = new THREE.TextureLoader();
    escenaJuego.background = cargadorFondo.load("../textures/sky.jpg");
    contenedorMundo = new THREE.Object3D();
}

function configurarSistemaEventos() {
    window.addEventListener("resize", ajustarProporcionPantalla);
}

function inicializarCamarasJuego() {
    var proporcionAspecto = window.innerWidth / window.innerHeight;
    
    // Configuración cámara principal del jugador
    camaraJugador = new THREE.PerspectiveCamera(75, proporcionAspecto, 0.1, 10000);
    camaraJugador.position.set(0, 20, 40);
    camaraJugador.layers.enable(1);
    
    controlesOrbitales = new THREE.OrbitControls(camaraJugador, renderizador.domElement);
    controlesOrbitales.target.set(0, 5, 0);
    controlesOrbitales.minDistance = 20;
    controlesOrbitales.maxDistance = 100;
    controlesOrbitales.update();
    
    escenaJuego.add(camaraJugador);
    
    // Configuración cámara aérea
    camaraAerea = new THREE.OrthographicCamera(-25, 25, 25, -25, 0, 2000);
    camaraAerea.position.set(0, 100, 0);
    camaraAerea.lookAt(0, 0, 0);
    camaraAerea.layers.enable(1);
    
    escenaJuego.add(camaraAerea);
}

function establecerSistemaEntrada() {
    entradaTeclado = new THREEx.KeyboardState(renderizador.domElement);
    renderizador.domElement.setAttribute("tabIndex", "0");
    renderizador.domElement.focus();
    entradaTeclado.domElement.addEventListener('keydown', procesarEntradaUsuario);
}

function configurarIluminacionEscena() {
    // Iluminación ambiente
    luzAmbiente = new THREE.AmbientLight("grey");
    escenaJuego.add(luzAmbiente);
    
    // Iluminación direccional
    luzDireccional = new THREE.DirectionalLight("brown");
    luzDireccional.position.set(0, 450, 0);
    luzDireccional.castShadow = true;
    asistenteLuzDireccional = new THREE.CameraHelper(luzDireccional.shadow.camera);
    escenaJuego.add(luzDireccional);
    
    // Iluminación focal
    luzFocal = new THREE.SpotLight("orange");
    luzFocal.position.set(-100, 500, 0);
    luzFocal.penumbra = 0.1;
    luzFocal.distance = 1500;
    luzFocal.castShadow = true;
    asistenteLuzFocal = new THREE.CameraHelper(luzFocal.shadow.camera);
    escenaJuego.add(luzFocal);
    
    // Iluminación puntual
    luzPuntual = new THREE.PointLight("red", 0.1);
    luzPuntual.distance = 1500;
    luzPuntual.position.set(0, 800, -400);
    luzPuntual.castShadow = true;
    asistenteLuzPuntual = new THREE.CameraHelper(luzPuntual.shadow.camera);
    escenaJuego.add(luzPuntual);
}

function inicializarVariablesJuego() {
    desplazamientoLateralBici = 0;
    velocidadObstaculos = 2.0;
    modoNocturno = false;
    
    cajaColisionBicicleta = new THREE.Box3();
    coleccionPolicias = [];
    cajasColisionPolicias = [];
    coleccionMonedas = [];
    cajasColisionMonedas = [];
    
    estadoSaltando = false;
    estadoColisionado = false;
    estadoJuegoIniciado = false;
    cantidadMonedasRecogidas = 0;
}

function construirInterfazUsuario() {
    crearDisplayTemporizador();
    crearBotonInstrucciones();
    crearContadorMonedas();
    construirPanelControles();
    inicializarConfiguracionGlobal();
}

function crearDisplayTemporizador() {
    elementoTextoTiempo = document.createElement('div');
    aplicarEstiloElemento(elementoTextoTiempo, {
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '15px 30px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '3px solid #00ff00',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0, 255, 0, 0.5)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        zIndex: '1000'
    });
    elementoTextoTiempo.innerHTML = "TIEMPO: 0.0s";
    document.body.appendChild(elementoTextoTiempo);
}

function crearBotonInstrucciones() {
    elementoTextoBoton = document.createElement('div');
    aplicarEstiloElemento(elementoTextoBoton, {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '15px 30px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: 'rgba(255, 165, 0, 0.85)',
        border: '3px solid #ffffff',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(255, 165, 0, 0.6)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        zIndex: '1000'
    });
    elementoTextoBoton.innerHTML = "Presiona 'Comenzar' para jugar";
    document.body.appendChild(elementoTextoBoton);
}

function crearContadorMonedas() {
    elementoContadorMonedas = document.createElement('div');
    aplicarEstiloElemento(elementoContadorMonedas, {
        position: 'absolute',
        top: 'calc(25vh + 30px)',
        right: '20px',
        padding: '12px 25px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: 'rgba(255, 215, 0, 0.85)',
        border: '3px solid #ff8c00',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.6)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        zIndex: '1000'
    });
    elementoContadorMonedas.innerHTML = "MONEDAS: 0";
    document.body.appendChild(elementoContadorMonedas);
}

function aplicarEstiloElemento(elemento, estilos) {
    for (var propiedad in estilos) {
        elemento.style[propiedad] = estilos[propiedad];
    }
}

function construirPanelControles() {
    var contenedorBotones = document.createElement('div');
    aplicarEstiloElemento(contenedorBotones, {
        position: 'absolute',
        left: '20px',
        top: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        zIndex: '1000'
    });
    
    var botonIniciar = crearBotonControl('Comenzar', 'rgba(50, 150, 50, 0.9)', activarJuego);
    var botonReiniciar = crearBotonControl('Reiniciar', 'rgba(200, 80, 80, 0.9)', reiniciarSistemaJuego);
    
    window.botonModoNocturno = crearBotonControl('Modo Noche', 'rgba(60, 100, 180, 0.9)', cambiarModoIluminacion);
    
    contenedorBotones.appendChild(botonIniciar);
    contenedorBotones.appendChild(botonReiniciar);
    contenedorBotones.appendChild(window.botonModoNocturno);
    
    document.body.appendChild(contenedorBotones);
}

function crearBotonControl(texto, colorFondo, funcionClick) {
    var boton = document.createElement('button');
    boton.textContent = texto;
    
    aplicarEstiloElemento(boton, {
        padding: '15px 30px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: colorFondo,
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
        minWidth: '150px',
        textAlign: 'center'
    });
    
    boton.onmouseenter = function() {
        boton.style.transform = 'translateY(-2px)';
        boton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
    };
    
    boton.onmouseleave = function() {
        boton.style.transform = 'translateY(0)';
        boton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    };
    
    boton.onclick = funcionClick;
    return boton;
}

function inicializarConfiguracionGlobal() {
    window.configuracionGUI = {
        monedasRecolectadasGUI: 0
    };
}

function cambiarModoIluminacion() {
    modoNocturno = !modoNocturno;
    
    var rutaFondo = modoNocturno ? "../textures/noche.jpg" : "../textures/sky.jpg";
    escenaJuego.background = new THREE.TextureLoader().load(rutaFondo);
    
    if (iluminacionBicicleta) {
        iluminacionBicicleta.visible = modoNocturno;
        iluminacionBicicleta.intensity = modoNocturno ? 15 : 0;
    }
    
    if (hazLuzVisible) {
        hazLuzVisible.visible = modoNocturno;
    }
    
    var mensajeConsola = modoNocturno ? 
        "Modo noche activado - Luz de la bicicleta encendida" : 
        "Modo día activado - Luz de la bicicleta apagada";
    console.log(mensajeConsola);
    
    actualizarTextoBotonNoche();
}

function actualizarTextoBotonNoche() {
    if (window.botonModoNocturno) {
        window.botonModoNocturno.textContent = modoNocturno ? "Modo Dia" : "Modo Noche";
    }
}

function ejecutarAnimacionRotacion() {
    var animacionRotacion = new TWEEN.Tween(vehiculoBicicleta.rotation).to(
        {y: vehiculoBicicleta.rotation.y - Math.PI},
        800,
        TWEEN.Easing.Back.In
    );
    animacionRotacion.start();
}

function realizarSaltoBicicleta() {
    if (estadoSaltando || estadoColisionado || !estadoJuegoIniciado) {
        return;
    }
    
    estadoSaltando = true;
    var nivelSuelo = 5;
    var alturaSalto = 10;
    var duracionFase = 650;
    
    var faseAscenso = new TWEEN.Tween(vehiculoBicicleta.position).to(
        {y: nivelSuelo + alturaSalto},
        duracionFase,
        TWEEN.Easing.Quadratic.Out
    );
    
    var faseDescenso = new TWEEN.Tween(vehiculoBicicleta.position).to(
        {y: nivelSuelo},
        duracionFase,
        TWEEN.Easing.Quadratic.In
    );
    
    faseDescenso.onComplete(function() {
        estadoSaltando = false;
        vehiculoBicicleta.position.y = nivelSuelo;
    });
    
    faseAscenso.chain(faseDescenso);
    faseAscenso.start();
}

function procesarEntradaUsuario() {
    if (entradaTeclado.pressed("space")) {
        realizarSaltoBicicleta();
    }
    
    if (!estadoColisionado) {
        var incrementoMovimiento = 1.0;
        var limiteIzquierdo = -45;
        var limiteDerecho = 45;
        
        if (entradaTeclado.pressed("left") && vehiculoBicicleta.position.x > limiteIzquierdo) {
            vehiculoBicicleta.position.x -= incrementoMovimiento;
        }
        
        if (entradaTeclado.pressed("right") && vehiculoBicicleta.position.x < limiteDerecho) {
            vehiculoBicicleta.position.x += incrementoMovimiento;
        }
    }
}

function cargarRecursosVisuales() {
    var cargadorTexturas = new THREE.TextureLoader();
    texturaSuelo = cargadorTexturas.load("../textures/arco.jpg");
    texturaSuelo.wrapS = THREE.RepeatWrapping;
    texturaSuelo.wrapT = THREE.RepeatWrapping;
    texturaSuelo.repeat.set(1, 1);
    
    var estadoCarga = {
        bicicleta: false,
        vehiculoPolicia: false,
        moneda: false
    };
    
    function verificarCargaCompleta() {
        var todoCargado = estadoCarga.bicicleta && 
                         estadoCarga.vehiculoPolicia && 
                         estadoCarga.moneda;
        
        if (todoCargado) {
            console.log("Todos los modelos cargados, dibujando escena");
            construirEscenaCompleta();
        }
    }
    
    var cargadorGLTF = new THREE.GLTFLoader();
    
    cargarModeloBicicleta(cargadorGLTF, estadoCarga, verificarCargaCompleta);
    cargarModeloPolicia(cargadorGLTF, estadoCarga, verificarCargaCompleta);
    cargarModeloMoneda(cargadorGLTF, estadoCarga, verificarCargaCompleta);
    
    console.log("Fin de cargar las texturae");
}

function cargarModeloBicicleta(cargador, estado, callback) {
    cargador.load(
        "../textures/old_bicycle/scene.gltf",
        function(modelo) {
            luzDireccional.target = modelo.scene;
            luzFocal.target = modelo.scene;
            
            modelo.scene.position.set(0, 5, 0);
            modelo.scene.receiveShadow = true;
            modelo.scene.scale.set(10, 10, 10);
            modelo.scene.rotation.y = 0;
            
            vehiculoBicicleta = modelo.scene;
            vehiculoBicicleta.layers.enable(1);
            
            escenaJuego.add(vehiculoBicicleta);
            
            crearSistemaIluminacionBicicleta();
            
            console.log("Bicicleta cargada completo");
            estado.bicicleta = true;
            callback();
        },
        function(progreso) {
            var porcentaje = (progreso.loaded / progreso.total * 100).toFixed(0);
            console.log("bicicleta " + porcentaje + "% cargada");
        },
        function(error) {
            console.log('Ocurrió un error cargando el modelo de la bicicleta: ', error);
        }
    );
}

function crearSistemaIluminacionBicicleta() {
    iluminacionBicicleta = new THREE.SpotLight(0xffffff, 10);
    iluminacionBicicleta.position.set(0, 9, -10);
    iluminacionBicicleta.target.position.set(0, 0, -150);
    iluminacionBicicleta.angle = Math.PI / 18;
    iluminacionBicicleta.penumbra = 0.02;
    iluminacionBicicleta.distance = 300;
    iluminacionBicicleta.decay = 1.5;
    iluminacionBicicleta.castShadow = true;
    iluminacionBicicleta.shadow.mapSize.width = 2048;
    iluminacionBicicleta.shadow.mapSize.height = 2048;
    iluminacionBicicleta.visible = false;
    iluminacionBicicleta.layers.set(1);
    
    escenaJuego.add(iluminacionBicicleta);
    escenaJuego.add(iluminacionBicicleta.target);
    
    crearHazLuzVisible();
}

function crearHazLuzVisible() {
    var geometriaHaz = new THREE.ConeGeometry(8, 60, 32, 1, true);
    var materialHaz = new THREE.MeshBasicMaterial({
        color: 0xffff99,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    
    hazLuzVisible = new THREE.Mesh(geometriaHaz, materialHaz);
    hazLuzVisible.position.set(0, 9, -35);
    hazLuzVisible.rotation.x = Math.PI / 2;
    hazLuzVisible.visible = false;
    hazLuzVisible.layers.enable(1);
    
    escenaJuego.add(hazLuzVisible);
}

function cargarModeloPolicia(cargador, estado, callback) {
    cargador.load(
        "../textures/police_car.glb",
        function(modelo) {
            modelo.scene.position.set(0, 0, -100);
            modelo.scene.receiveShadow = true;
            modelo.scene.castShadow = true;
            modelo.scene.scale.set(3, 3, 3);
            
            vehiculoPoliciaBase = modelo.scene;
            
            vehiculoPoliciaBase.traverse(function(nodo) {
                if (nodo.isMesh) {
                    nodo.castShadow = true;
                }
            });
            
            vehiculoPoliciaBase.castShadow = true;
            vehiculoPoliciaBase.receiveShadow = true;
            
            console.log("Coche de policia cargado completo");
            estado.vehiculoPolicia = true;
            callback();
        },
        function(progreso) {
            var porcentaje = (progreso.loaded / progreso.total * 100).toFixed(0);
            console.log("cochePoli " + porcentaje + "% cargado");
        },
        function(error) {
            console.log('Ocurrió un error cargando el modelo del coche de policía: ', error);
        }
    );
}

function cargarModeloMoneda(cargador, estado, callback) {
    cargador.load(
        "../textures/coin.glb",
        function(modelo) {
            modelo.scene.position.set(0, 5, -100);
            modelo.scene.receiveShadow = true;
            modelo.scene.castShadow = true;
            modelo.scene.scale.set(0.5, 0.5, 0.5);
            
            objetoMonedaBase = modelo.scene;
            
            objetoMonedaBase.traverse(function(nodo) {
                if (nodo.isMesh) {
                    nodo.castShadow = true;
                }
            });
            
            objetoMonedaBase.castShadow = true;
            objetoMonedaBase.receiveShadow = true;
            
            console.log("Moneda cargada completo");
            estado.moneda = true;
            callback();
        },
        function(progreso) {
            var porcentaje = (progreso.loaded / progreso.total * 100).toFixed(0);
            console.log("moneda " + porcentaje + "% cargada");
        },
        function(error) {
            console.log('Ocurrió un error cargando el modelo de la moneda: ', error);
        }
    );
}

function activarJuego() {
    if (!estadoColisionado) {
        estadoJuegoIniciado = true;
        marcaTiempoInicio = Date.now();
        elementoTextoBoton.innerHTML = "";
    }
}

function reiniciarSistemaJuego() {
    estadoJuegoIniciado = false;
    estadoColisionado = false;
    estadoSaltando = false;
    cantidadMonedasRecogidas = 0;
    
    escenaJuego = new THREE.Scene();
    
    var rutaFondo = modoNocturno ? "../textures/noche.jpg" : "../textures/sky.jpg";
    escenaJuego.background = new THREE.TextureLoader().load(rutaFondo);
    
    contenedorMundo = new THREE.Object3D();
    escenaJuego.add(camaraAerea);
    escenaJuego.add(camaraJugador);
    
    configurarIluminacionEscena();
    cargarRecursosVisuales();
    
    elementoTextoTiempo.innerHTML = "TIEMPO: 0.0s";
    elementoTextoBoton.innerHTML = "Presiona 'Comenzar' para jugar";
    elementoTextoBoton.style.backgroundColor = 'rgba(255, 165, 0, 0.85)';
    elementoTextoBoton.style.border = '3px solid #ffffff';
    elementoContadorMonedas.innerHTML = "MONEDAS: 0";
    
    if (window.configuracionGUI) {
        window.configuracionGUI.monedasRecolectadasGUI = 0;
    }
}

function generarObstaculosAleatorios() {
    coleccionPolicias = [];
    cajasColisionPolicias = [];
    coleccionMonedas = [];
    cajasColisionMonedas = [];
    
    cantidadPolicias = 15;
    var distanciaEntreObstaculos = 50;
    
    for (var indice = 0; indice < cantidadPolicias; indice++) {
        var posicionX = Math.floor(Math.random() * 90 - 45);
        var posicionZ = -50 - (indice * distanciaEntreObstaculos);
        
        var probabilidadMoneda = Math.random();
        
        if (probabilidadMoneda < 0.50) {
            crearMonedaEnPosicion(posicionX, posicionZ);
        } else {
            crearPoliciaEnPosicion(posicionX, posicionZ);
        }
    }
}

function crearMonedaEnPosicion(x, z) {
    var copiaMoneda = objetoMonedaBase.clone();
    copiaMoneda.position.set(x, 5, z);
    copiaMoneda.receiveShadow = true;
    copiaMoneda.castShadow = true;
    copiaMoneda.layers.enable(1);
    
    contenedorMundo.add(copiaMoneda);
    
    var cajaColision = new THREE.Box3();
    cajaColision.setFromObject(copiaMoneda);
    
    coleccionMonedas.push(copiaMoneda);
    cajasColisionMonedas.push(cajaColision);
}

function crearPoliciaEnPosicion(x, z) {
    var copiaPolicia = vehiculoPoliciaBase.clone();
    copiaPolicia.position.set(x, 0, z);
    copiaPolicia.receiveShadow = true;
    copiaPolicia.castShadow = true;
    copiaPolicia.layers.enable(1);
    
    contenedorMundo.add(copiaPolicia);
    
    var cajaColision = new THREE.Box3();
    cajaColision.setFromObject(copiaPolicia);
    
    coleccionPolicias.push(copiaPolicia);
    cajasColisionPolicias.push(cajaColision);
}

function construirEscenaCompleta() {
    var materialCarretera = new THREE.MeshLambertMaterial({
        wireframe: false,
        color: "white",
        map: texturaSuelo
    });
    
    var geometriaCarretera = new THREE.PlaneGeometry(100, 3000, 15, 15);
    superficieCarretera = new THREE.Mesh(geometriaCarretera, materialCarretera);
    superficieCarretera.rotation.x = -Math.PI / 2;
    superficieCarretera.position.set(0, 0, -1000);
    superficieCarretera.castShadow = true;
    superficieCarretera.receiveShadow = true;
    
    generarObstaculosAleatorios();
    
    contenedorMundo.add(superficieCarretera);
    contenedorMundo.castShadow = true;
    contenedorMundo.receiveShadow = true;
    
    escenaJuego.add(contenedorMundo);
    
    console.log("Añadido");
    console.log("Añadido.length: ", coleccionPolicias.length);
    
    cajaColisionBicicleta.setFromObject(vehiculoBicicleta);
    
    if (iluminacionBicicleta) {
        iluminacionBicicleta.visible = modoNocturno;
    }
    if (hazLuzVisible) {
        hazLuzVisible.visible = modoNocturno;
    }
}

function detectarColisionConPolicias(cajasObstaculos, cajaBicicleta) {
    for (var i = 0; i < cajasObstaculos.length; i++) {
        if (cajasObstaculos[i].intersectsBox(cajaBicicleta)) {
            return true;
        }
    }
    return false;
}

function actualizarTodasLasCajasColision() {
    cajaColisionBicicleta.setFromObject(vehiculoBicicleta);
    
    for (var i = 0; i < cajasColisionPolicias.length; i++) {
        cajasColisionPolicias[i].setFromObject(coleccionPolicias[i]);
    }
    
    for (var i = 0; i < cajasColisionMonedas.length; i++) {
        cajasColisionMonedas[i].setFromObject(coleccionMonedas[i]);
    }
}

function obtenerIndicesMonedasColisionadas(cajasMonedas, cajaBicicleta) {
    var indicesColisionados = [];
    
    for (var i = 0; i < cajasMonedas.length; i++) {
        if (cajasMonedas[i].intersectsBox(cajaBicicleta)) {
            indicesColisionados.push(i);
        }
    }
    
    return indicesColisionados;
}

function actualizarEstadoJuego() {
    TWEEN.update();
    
    aplicarAnimacionMonedas();
    actualizarPosicionIluminacion();
    
    if (!estadoColisionado && estadoJuegoIniciado) {
        procesarLogicaJuego();
    }
}

function aplicarAnimacionMonedas() {
    var factorPulso = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
    
    for (var i = 0; i < coleccionMonedas.length; i++) {
        coleccionMonedas[i].scale.set(factorPulso, factorPulso, factorPulso);
    }
}

function actualizarPosicionIluminacion() {
    if (iluminacionBicicleta && vehiculoBicicleta) {
        var offsetY = 4;
        var offsetZ = -10;
        var targetZ = -150;
        
        iluminacionBicicleta.position.set(
            vehiculoBicicleta.position.x,
            vehiculoBicicleta.position.y + offsetY,
            vehiculoBicicleta.position.z + offsetZ
        );
        
        iluminacionBicicleta.target.position.set(
            vehiculoBicicleta.position.x,
            0,
            vehiculoBicicleta.position.z + targetZ
        );
    }
    
    if (hazLuzVisible && vehiculoBicicleta) {
        hazLuzVisible.position.set(
            vehiculoBicicleta.position.x,
            vehiculoBicicleta.position.y + 4,
            vehiculoBicicleta.position.z - 33
        );
    }
}

function procesarLogicaJuego() {
    var momentoActual = Date.now();
    var tiempoTranscurrido = momentoActual - marcaTiempoInicio;
    var segundosTranscurridos = tiempoTranscurrido / 1000;
    
    elementoTextoTiempo.innerHTML = "TIEMPO: " + segundosTranscurridos.toFixed(1) + "s";
    
    ajustarVelocidadProgresiva(segundosTranscurridos);
    moverObstaculos();
    moverMonedas();
    
    actualizarTodasLasCajasColision();
    procesarColisionesMonedas();
    
    if (!estadoSaltando) {
        estadoColisionado = detectarColisionConPolicias(cajasColisionPolicias, cajaColisionBicicleta);
    }
    
    if (estadoColisionado) {
        finalizarJuego();
    }
}

function ajustarVelocidadProgresiva(tiempoSegundos) {
    var velocidadBase = 4.0;
    var incrementoPorDecena = 0.5;
    velocidadObstaculos = velocidadBase + (tiempoSegundos / 10) * incrementoPorDecena;
}

function moverObstaculos() {
    var limiteRespawn = 50;
    var posicionRespawn = -1000;
    var rangoX = 90;
    var offsetX = 45;
    
    for (var i = 0; i < coleccionPolicias.length; i++) {
        coleccionPolicias[i].position.z += velocidadObstaculos;
        
        if (coleccionPolicias[i].position.z > limiteRespawn) {
            coleccionPolicias[i].position.z = posicionRespawn;
            coleccionPolicias[i].position.x = Math.floor(Math.random() * rangoX - offsetX);
        }
    }
}

function moverMonedas() {
    var limiteRespawn = 50;
    var posicionRespawn = -1000;
    var rangoX = 90;
    var offsetX = 45;
    
    for (var i = 0; i < coleccionMonedas.length; i++) {
        coleccionMonedas[i].position.z += velocidadObstaculos;
        
        if (coleccionMonedas[i].position.z > limiteRespawn) {
            coleccionMonedas[i].position.z = posicionRespawn;
            coleccionMonedas[i].position.x = Math.floor(Math.random() * rangoX - offsetX);
        }
    }
}

function procesarColisionesMonedas() {
    var indicesColisionados = obtenerIndicesMonedasColisionadas(cajasColisionMonedas, cajaColisionBicicleta);
    
    for (var j = indicesColisionados.length - 1; j >= 0; j--) {
        var indiceMoneda = indicesColisionados[j];
        
        contenedorMundo.remove(coleccionMonedas[indiceMoneda]);
        coleccionMonedas.splice(indiceMoneda, 1);
        cajasColisionMonedas.splice(indiceMoneda, 1);
        
        cantidadMonedasRecogidas++;
        elementoContadorMonedas.innerHTML = "MONEDAS: " + cantidadMonedasRecogidas;
        
        if (window.configuracionGUI) {
            window.configuracionGUI.monedasRecolectadasGUI = cantidadMonedasRecogidas;
        }
        
        console.log("Moneda recolectada! Total: " + cantidadMonedasRecogidas);
    }
}

function finalizarJuego() {
    console.log("Colisión");
    estadoJuegoIniciado = false;
    elementoTextoBoton.innerHTML = "FIN! Presiona 'Reiniciar' para volver a jugar";
    elementoTextoBoton.style.backgroundColor = 'rgba(255, 0, 0, 0.85)';
    elementoTextoBoton.style.border = '3px solid #ffff00';
}

function ajustarProporcionPantalla() {
    renderizador.setSize(window.innerWidth, window.innerHeight);
    camaraJugador.aspect = window.innerWidth / window.innerHeight;
    camaraJugador.updateProjectionMatrix();
}

function ejecutarBucleRenderizado() {
    requestAnimationFrame(ejecutarBucleRenderizado);
    actualizarEstadoJuego();
    
    renderizador.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderizador.render(escenaJuego, camaraJugador);
    
    renderizarVistaAerea();
}

function renderizarVistaAerea() {
    renderizador.setScissorTest(true);
    
    var proporcion = window.innerWidth / window.innerHeight;
    var esPaisaje = proporcion > 1.0;
    
    var tamanioMiniatura = esPaisaje ? window.innerHeight / 4 : window.innerWidth / 4;
    var posicionX = window.innerWidth - tamanioMiniatura;
    var posicionY = window.innerHeight - tamanioMiniatura;
    
    if (esPaisaje) {
        renderizador.setScissor(posicionX, posicionY, window.innerHeight / 4, window.innerHeight / 4);
        renderizador.setViewport(posicionX, posicionY, window.innerHeight / 4, window.innerHeight / 4);
    } else {
        renderizador.setScissor(posicionX, posicionY, window.innerWidth / 4, window.innerWidth / 4);
        renderizador.setViewport(posicionX, posicionY, window.innerWidth / 4, window.innerWidth / 4);
    }
    
    renderizador.render(escenaJuego, camaraAerea);
    renderizador.setScissorTest(false);
}

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

function principal() {
    inicializar();
    ejecutarBucleRenderizado();
}
