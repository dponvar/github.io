// Variables globales del renderizador y escena
var renderizador, escena, camaraPrincipal, camaraCenital;
var controladorCamara, teclado;

// Variables del robot y sus componentes
var robotCompleto, brazoDelRobot, antebrazoDelRobot;
var pinzaCompleta1, pinzaCompleta2;

// Variables de iluminación
var iluminacionAmbiental, iluminacionDireccional, iluminacionFocal, iluminacionPuntual;
var helperDireccional, helperFocal, helperPuntual;

// Variables de texturas
var texturaPiso, texturaBase, texturaNervios, texturaMano, texturaRotula;
var texturaLado1, texturaLado2, texturaLado3, texturaLado4, texturaLado5, texturaLado6;

// Variables de animación
var tiempoInicial, tiempoActual;
var animacionEnCurso = false;
var primeraAnimacionRealizada = false;
var radioCirculo, velocidadAngular;

function inicializarEscena() {
    configurarRenderizador();
    crearEscena();
    configurarEventos();
    inicializarCamaras();
    configurarTeclado();
    establecerIluminacion();
    cargarTodasTexturas();
}

function configurarRenderizador() {
    renderizador = new THREE.WebGLRenderer();
    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.setClearColor(new THREE.Color(0x0000AA), 1.0);
    renderizador.shadowMap.enabled = true;
    document.body.appendChild(renderizador.domElement);
}

function crearEscena() {
    escena = new THREE.Scene();
}

function configurarEventos() {
    window.addEventListener("resize", ajustarRelacionAspecto);
}

function inicializarCamaras() {
    var relacionAspecto = window.innerWidth / window.innerHeight;
    
    // Configurar cámara perspectiva
    camaraPrincipal = new THREE.PerspectiveCamera(75, relacionAspecto, 0.1, 2000);
    camaraPrincipal.position.set(-100, 250, 125);
    
    controladorCamara = new THREE.OrbitControls(camaraPrincipal, renderizador.domElement);
    controladorCamara.target.set(0, 100, 0);
    controladorCamara.minDistance = 100;
    controladorCamara.maxDistance = 500;
    controladorCamara.update();
    
    escena.add(camaraPrincipal);
    
    // Configurar cámara ortográfica
    camaraCenital = new THREE.OrthographicCamera(-100, 100, 100, -100, 0, 2000);
    camaraCenital.position.set(0, 300, 0);
    camaraCenital.lookAt(0, 0, 0);
    escena.add(camaraCenital);
}

function configurarTeclado() {
    teclado = new THREEx.KeyboardState(renderizador.domElement);
    renderizador.domElement.setAttribute("tabIndex", "0");
    renderizador.domElement.focus();
    teclado.domElement.addEventListener('keydown', manejarEntradaTeclado);
}

function establecerIluminacion() {
    // Iluminación ambiental
    iluminacionAmbiental = new THREE.AmbientLight("grey");
    escena.add(iluminacionAmbiental);
    
    // Iluminación direccional
    iluminacionDireccional = new THREE.DirectionalLight("red", 0.3);
    iluminacionDireccional.position.set(100, 750, 0);
    iluminacionDireccional.castShadow = true;
    helperDireccional = new THREE.CameraHelper(iluminacionDireccional.shadow.camera);
    escena.add(iluminacionDireccional);
    
    // Iluminación focal
    iluminacionFocal = new THREE.SpotLight("white");
    iluminacionFocal.position.set(-300, 400, 0);
    iluminacionFocal.penumbra = 0.5;
    iluminacionFocal.distance = 1500;
    iluminacionFocal.castShadow = true;
    helperFocal = new THREE.CameraHelper(iluminacionFocal.shadow.camera);
    escena.add(iluminacionFocal);
    
    // Iluminación puntual
    iluminacionPuntual = new THREE.PointLight("white", 0.2);
    iluminacionPuntual.distance = 1500;
    iluminacionPuntual.position.set(0, 500, 500);
    iluminacionPuntual.castShadow = true;
    helperPuntual = new THREE.CameraHelper(iluminacionPuntual.shadow.camera);
    escena.add(iluminacionPuntual);
}

function manejarEntradaTeclado() {
    var desplazamiento = 5;
    
    if (teclado.pressed("up")) {
        robotCompleto.position.z -= desplazamiento;
    }
    if (teclado.pressed("down")) {
        robotCompleto.position.z += desplazamiento;
    }
    if (teclado.pressed("left")) {
        robotCompleto.position.x -= desplazamiento;
    }
    if (teclado.pressed("right")) {
        robotCompleto.position.x += desplazamiento;
    }
}

function gradosARadianes(gradosAngulo) {
    return gradosAngulo * (Math.PI / 180);
}

function crearInterfazControl() {
    const interfazGrafica = new lil.GUI();
    
    var parametrosControl = {
        rotacionBase: 0,
        rotacionBrazo: 0,
        rotacionAntebrazoY: 0,
        rotacionAntebrazoZ: 0,
        rotacionPinzaZ: 0,
        aperturaPinzas: 5,
        modoAlambrico: true,
        activarAnimacion: ejecutarAnimacion,
        mostrarHelpers: false,
    };
    
    const menuControl = interfazGrafica.addFolder('Control Robot');
    
    menuControl.add(parametrosControl, "rotacionBase", -180, 180)
        .name("Giro Base")
        .onChange(function(angulo) {
            robotCompleto.rotation.y = gradosARadianes(angulo);
        });
    
    menuControl.add(parametrosControl, "rotacionBrazo", -45, 45)
        .name("Giro Brazo")
        .onChange(function(angulo) {
            brazoDelRobot.rotation.z = gradosARadianes(angulo);
        });
    
    menuControl.add(parametrosControl, "rotacionAntebrazoY", -180, 180)
        .name("Giro Antebrazo Y")
        .onChange(function(angulo) {
            antebrazoDelRobot.rotation.y = gradosARadianes(angulo);
        });
    
    menuControl.add(parametrosControl, "rotacionAntebrazoZ", -90, 90)
        .name("Giro Antebrazo Z")
        .onChange(function(angulo) {
            antebrazoDelRobot.rotation.z = gradosARadianes(angulo);
        });
    
    menuControl.add(parametrosControl, "rotacionPinzaZ", -40, 220)
        .name("Giro Pinza")
        .onChange(function(angulo) {
            var anguloRad = -gradosARadianes(angulo);
            pinzaCompleta1.rotation.y = anguloRad;
            pinzaCompleta2.rotation.y = anguloRad;
        });
    
    menuControl.add(parametrosControl, "aperturaPinzas", 0, 15)
        .name("Separacion Pinza")
        .onChange(function(distancia) {
            pinzaCompleta1.position.y = -distancia + 5;
            pinzaCompleta2.position.y = distancia - 5;
        });
    
    menuControl.add(parametrosControl, "modoAlambrico")
        .name("alambres")
        .onChange(function(activado) {
            escena.traverse(function(objeto) {
                if (objeto instanceof THREE.Mesh) {
                    objeto.material.wireframe = activado;
                }
            });
        });
    
    menuControl.add(parametrosControl, "activarAnimacion").name("Anima");
    
    menuControl.add(parametrosControl, "mostrarHelpers")
        .name("Mostrar Luz Camera Helpers")
        .onChange(function(mostrar) {
            if (mostrar) {
                escena.add(helperPuntual);
                escena.add(helperFocal);
                escena.add(helperDireccional);
            } else {
                escena.remove(helperPuntual);
                escena.remove(helperFocal);
                escena.remove(helperDireccional);
            }
        });
}

function ejecutarAnimacion() {
    tiempoInicial = Date.now();
    tiempoActual = Date.now();
    velocidadAngular = 1;
    radioCirculo = 100;
    
    var duracionAnimacion = 5000;
    var tiempoTranscurrido = (tiempoActual - tiempoInicial) / 1000;
    var anguloMovimiento = velocidadAngular * tiempoTranscurrido;
    
    var posicionFinalX = radioCirculo * Math.cos(anguloMovimiento);
    var posicionFinalZ = radioCirculo * Math.sin(anguloMovimiento);
    
    var animacionRobot = new TWEEN.Tween(robotCompleto.position)
        .to({
            x: posicionFinalX,
            y: robotCompleto.position.y,
            z: posicionFinalZ
        }, duracionAnimacion)
        .onComplete(function() {
            animacionEnCurso = true;
            primeraAnimacionRealizada = true;
        });
    
    var animacionAntebrazo = new TWEEN.Tween(antebrazoDelRobot.rotation)
        .to({x: 0, y: gradosARadianes(80), z: 0}, duracionAnimacion)
        .easing(TWEEN.Easing.Elastic.InOut);
    
    var animacionBrazo1 = new TWEEN.Tween(brazoDelRobot.rotation)
        .to({x: 0, y: 0, z: gradosARadianes(45)}, duracionAnimacion)
        .easing(TWEEN.Easing.Bounce.InOut);
    
    var animacionBrazo2 = new TWEEN.Tween(brazoDelRobot.rotation)
        .to({x: 0, y: 0, z: 0}, duracionAnimacion)
        .easing(TWEEN.Easing.Exponential.In);
    
    animacionAntebrazo.chain(animacionBrazo1);
    animacionBrazo1.chain(animacionBrazo2);
    animacionBrazo2.chain(animacionRobot);
    
    animacionAntebrazo.start();
}

function cargarTodasTexturas() {
    var cargadorTexturas = new THREE.TextureLoader();
    
    texturaPiso = cargadorTexturas.load("../images/pisometalico_1024.jpg");
    texturaPiso.wrapS = THREE.RepeatWrapping;
    texturaPiso.wrapT = THREE.RepeatWrapping;
    
    texturaBase = cargadorTexturas.load("../images/metal_128.jpg");
    texturaBase.wrapS = THREE.RepeatWrapping;
    texturaBase.wrapT = THREE.RepeatWrapping;
    
    texturaNervios = cargadorTexturas.load("../images/wood512.jpg");
    texturaNervios.wrapS = THREE.RepeatWrapping;
    texturaNervios.wrapT = THREE.RepeatWrapping;
    
    texturaMano = cargadorTexturas.load("../images/burberry_256.jpg");
    texturaMano.wrapS = THREE.RepeatWrapping;
    texturaMano.wrapT = THREE.RepeatWrapping;
    
    var cargadorCubo = new THREE.CubeTextureLoader().setPath("../images/");
    texturaRotula = cargadorCubo.load([
        "posx.jpg", "negx.jpg",
        "posy.jpg", "negy.jpg",
        "posz.jpg", "negz.jpg"
    ]);
    
    texturaLado1 = cargadorTexturas.load('../images/posx.jpg');
    texturaLado2 = cargadorTexturas.load('../images/negx.jpg');
    texturaLado3 = cargadorTexturas.load('../images/posy.jpg');
    texturaLado4 = cargadorTexturas.load('../images/negy.jpg');
    texturaLado5 = cargadorTexturas.load('../images/posz.jpg');
    texturaLado6 = cargadorTexturas.load('../images/negz.jpg');
}

function construirEscenaCompleta() {
    crearMateriales();
    construirHabitacion();
    construirSuperficie();
    construirRobot();
}

function crearMateriales() {
    this.materialPiso = new THREE.MeshLambertMaterial({
        wireframe: true,
        color: "white",
        map: texturaPiso
    });
    
    this.materialGeneral = new THREE.MeshPhongMaterial({
        wireframe: true,
        color: "green",
        specular: "brown",
        shininess: 25
    });
    
    this.materialBaseRobot = new THREE.MeshPhongMaterial({
        wireframe: true,
        specular: "grey",
        shininess: 25,
        map: texturaBase
    });
    
    this.materialNerviosRobot = new THREE.MeshLambertMaterial({
        wireframe: true,
        color: "orange",
        map: texturaNervios
    });
    
    this.materialManoRobot = new THREE.MeshPhongMaterial({
        wireframe: true,
        specular: "green",
        shininess: 25,
        map: texturaMano
    });
    
    this.materialRotulaRobot = new THREE.MeshPhongMaterial({
        wireframe: true,
        specular: "brown",
        shininess: 25,
        envMap: texturaRotula
    });
}

function construirHabitacion() {
    var materialesParedes = [
        new THREE.MeshBasicMaterial({map: texturaLado1, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texturaLado2, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texturaLado3, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texturaLado4, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texturaLado5, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texturaLado6, side: THREE.BackSide}),
    ];
    
    var geometriaHabitacion = new THREE.BoxGeometry(1000, 1000, 1000);
    var habitacion = new THREE.Mesh(geometriaHabitacion, materialesParedes);
    escena.add(habitacion);
}

function construirSuperficie() {
    var geometriaPiso = new THREE.PlaneGeometry(1000, 1000, 15, 15);
    var meshPiso = new THREE.Mesh(geometriaPiso, this.materialPiso);
    meshPiso.rotation.x = -Math.PI / 2;
    meshPiso.castShadow = true;
    meshPiso.receiveShadow = true;
    escena.add(meshPiso);
}

function construirRobot() {
    robotCompleto = new THREE.Object3D();
    
    iluminacionFocal.target = robotCompleto;
    iluminacionPuntual.target = robotCompleto;
    
    crearBaseRobot();
    crearBrazoRobot();
    crearAntebrazoRobot();
    crearPinzasRobot();
    
    brazoDelRobot.add(antebrazoDelRobot);
    robotCompleto.add(brazoDelRobot);
    escena.add(robotCompleto);
}

function crearBaseRobot() {
    var geometriaBase = new THREE.CylinderGeometry(50, 50, 15, 30);
    var meshBase = new THREE.Mesh(geometriaBase, this.materialBaseRobot);
    meshBase.castShadow = true;
    meshBase.receiveShadow = true;
    robotCompleto.add(meshBase);
}

function crearBrazoRobot() {
    brazoDelRobot = new THREE.Object3D();
    
    var geometriaEje = new THREE.CylinderGeometry(20, 20, 18, 30);
    var meshEje = new THREE.Mesh(geometriaEje, this.materialBaseRobot);
    meshEje.rotation.x = -Math.PI / 2;
    meshEje.castShadow = true;
    meshEje.receiveShadow = true;
    brazoDelRobot.add(meshEje);
    
    var geometriaEsparrago = new THREE.BoxGeometry(18, 120, 12);
    var meshEsparrago = new THREE.Mesh(geometriaEsparrago, this.materialBaseRobot);
    meshEsparrago.position.set(0, 60, 0);
    meshEsparrago.castShadow = true;
    meshEsparrago.receiveShadow = true;
    brazoDelRobot.add(meshEsparrago);
    
    var geometriaRotula = new THREE.SphereGeometry(20, 10, 10);
    var meshRotula = new THREE.Mesh(geometriaRotula, this.materialRotulaRobot);
    meshRotula.position.set(0, 120, 0);
    meshRotula.castShadow = true;
    meshRotula.receiveShadow = true;
    brazoDelRobot.add(meshRotula);
    
    iluminacionDireccional.target = meshRotula;
}

function crearAntebrazoRobot() {
    antebrazoDelRobot = new THREE.Object3D();
    antebrazoDelRobot.position.set(0, 120, 0);
    antebrazoDelRobot.rotation.y = -Math.PI / 2;
    
    var geometriaDisco = new THREE.CylinderGeometry(15, 15, 6, 30);
    var meshDisco = new THREE.Mesh(geometriaDisco, this.materialNerviosRobot);
    meshDisco.castShadow = true;
    meshDisco.receiveShadow = true;
    antebrazoDelRobot.add(meshDisco);
    
    var geometriaNervio = new THREE.BoxGeometry(4, 80, 4);
    var posicionesNervios = [
        {x: 7, z: -7},
        {x: 7, z: 7},
        {x: -7, z: 7},
        {x: -7, z: -7}
    ];
    
    for (var i = 0; i < posicionesNervios.length; i++) {
        var meshNervio = new THREE.Mesh(geometriaNervio, this.materialNerviosRobot);
        meshNervio.position.set(posicionesNervios[i].x, 40, posicionesNervios[i].z);
        meshNervio.castShadow = true;
        meshNervio.receiveShadow = true;
        antebrazoDelRobot.add(meshNervio);
    }
    
    var geometriaCilindroAntebrazo = new THREE.CylinderGeometry(15, 15, 40, 30);
    this.cilindroAntebrazo = new THREE.Mesh(geometriaCilindroAntebrazo, this.materialManoRobot);
    this.cilindroAntebrazo.rotation.z = -Math.PI / 2;
    this.cilindroAntebrazo.position.set(0, 80, 0);
    this.cilindroAntebrazo.castShadow = true;
    this.cilindroAntebrazo.receiveShadow = true;
    antebrazoDelRobot.add(this.cilindroAntebrazo);
}

function crearPinzasRobot() {
    var pinzaBase = new THREE.Object3D();
    pinzaCompleta1 = new THREE.Object3D();
    
    var geometriaParalelepipedo = new THREE.BoxGeometry(19, 20, 4);
    var meshParalelepipedo = new THREE.Mesh(geometriaParalelepipedo, this.materialNerviosRobot);
    meshParalelepipedo.position.set(-9.5, 10, -2);
    meshParalelepipedo.castShadow = true;
    meshParalelepipedo.receiveShadow = true;
    pinzaBase.add(meshParalelepipedo);
    
    var geometriaDedos = construirGeometriaDedosPinza();
    var meshDedos = new THREE.Mesh(geometriaDedos, this.materialNerviosRobot);
    meshDedos.castShadow = true;
    meshDedos.receiveShadow = true;
    pinzaBase.add(meshDedos);
    
    pinzaBase.rotation.z = -Math.PI / 2;
    pinzaBase.rotation.x = -Math.PI / 2;
    pinzaBase.position.set(-10, -5, 25);
    pinzaCompleta1.add(pinzaBase);
    
    pinzaCompleta2 = pinzaCompleta1.clone();
    pinzaCompleta2.rotation.z = Math.PI;
    
    this.cilindroAntebrazo.add(pinzaCompleta2);
    this.cilindroAntebrazo.add(pinzaCompleta1);
}

function construirGeometriaDedosPinza() {
    var geometria = new THREE.BufferGeometry();
    
    var vertices = new Float32Array([
        0.0, 0.0, 0.0,      // v0
        0.0, 0.0, -4.0,     // v1
        0.0, 20.0, -4.0,    // v2
        0.0, 20.0, 0.0,     // v3
        19.0, 5.0, 0.0,     // v4
        19.0, 5.0, -2.0,    // v5
        19.0, 15.0, -2.0,   // v6
        19.0, 15.0, 0.0,    // v7
        0.0, 20.0, -2.0,    // v8
        0.0, 0.0, -2.0,     // v9
    ]);
    
    var indices = [
        0, 4, 3, 3, 4, 7,
        4, 5, 7, 5, 6, 7,
        2, 6, 1, 5, 1, 6,
        3, 6, 2, 3, 7, 2,
        0, 1, 4, 0, 1, 5,
        0, 3, 1, 1, 3, 2,
        7, 6, 8, 5, 4, 9,
    ];
    
    var coordenadasUV = new Float32Array([
        0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]);
    
    geometria.setIndex(indices);
    geometria.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometria.setAttribute("uv", new THREE.BufferAttribute(coordenadasUV, 2));
    geometria.computeVertexNormals();
    
    return geometria;
}

function actualizarEstado() {
    TWEEN.update();
    
    if (animacionEnCurso) {
        if (primeraAnimacionRealizada) {
            primeraAnimacionRealizada = false;
            tiempoInicial = Date.now();
            tiempoActual = Date.now();
        } else {
            tiempoActual = Date.now();
        }
        
        var deltaTiempo = (tiempoActual - tiempoInicial) / 1000;
        var anguloActual = velocidadAngular * deltaTiempo;
        
        robotCompleto.position.x = radioCirculo * Math.cos(anguloActual);
        robotCompleto.position.z = radioCirculo * Math.sin(anguloActual);
    }
}

function ajustarRelacionAspecto() {
    renderizador.setSize(window.innerWidth, window.innerHeight);
    camaraPrincipal.aspect = window.innerWidth / window.innerHeight;
    camaraPrincipal.updateProjectionMatrix();
}

function cicloRenderizado() {
    requestAnimationFrame(cicloRenderizado);
    actualizarEstado();
    
    renderizador.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderizador.render(escena, camaraPrincipal);
    
    renderizador.setScissorTest(true);
    
    var relacionAspecto = window.innerWidth / window.innerHeight;
    var tamanioMiniatura = relacionAspecto > 1.0 ? window.innerHeight / 4 : window.innerWidth / 4;
    var posicionY = window.innerHeight - tamanioMiniatura;
    
    if (relacionAspecto > 1.0) {
        renderizador.setScissor(0, posicionY, window.innerHeight / 4, window.innerHeight / 4);
        renderizador.setViewport(0, posicionY, window.innerHeight / 4, window.innerHeight / 4);
    } else {
        renderizador.setScissor(0, posicionY, window.innerWidth / 4, window.innerWidth / 4);
        renderizador.setViewport(0, posicionY, window.innerWidth / 4, window.innerWidth / 4);
    }
    
    renderizador.render(escena, camaraCenital);
    renderizador.setScissorTest(false);
}

function main() {
    inicializarEscena();
    construirEscenaCompleta();
    crearInterfazControl();
    cicloRenderizado();
}
