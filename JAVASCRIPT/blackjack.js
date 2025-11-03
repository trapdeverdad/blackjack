let dealerSuma = 0;
let jugadorSuma = 0;

let dealerConteoAs = 0;
let jugadorConteoAs = 0;

let oculta; // Representa la carta oculta
let mazo;

let saldo = 500; // Monto inicial del jugador
let apuesta = 0; // Monto apostado en cada mano

let puedePedir = true; // Permite al jugador pedir mientras jugadorSuma <= 21
let plantarseActivado = false; // Evita la ejecución repetida de la función plantarse

let audioBaraja = new Audio('../audios/barajaCarta.mp3');
let audioWin = new Audio('../audios/juegoGanado.mp3');
let audioLose = new Audio('../audios/juegoPerdido.mp3');

        // Inicializar el estado del sonido
        let sonidoActivado = true;
        let musicaFondo = new Audio('../audios/musicaCasino.mp3');
        musicaFondo.loop = true;

        const btnSonido = document.getElementById('btn-sound');

        // Función para activar o desactivar el sonido
        function toggleSound() {
            if (sonidoActivado) {
                musicaFondo.pause();  // Pausar el sonido
                btnSonido.innerHTML = '<i class="fas fa-volume-mute"></i>'; // Cambiar ícono a "silenciado"
            } else {
                musicaFondo.play().catch((error) => { // Intentar reproducir el sonido
                    console.log("No se pudo reproducir el sonido:", error);
                });
                btnSonido.innerHTML = '<i class="fas fa-volume-up"></i>'; // Cambiar ícono a "sonido"
            }
            
            sonidoActivado = !sonidoActivado; // Alternar el estado de sonido
        }

        // Evento para activar/desactivar el sonido al hacer clic en el botón
        btnSonido.addEventListener('click', toggleSound);

window.onload = function () {
    musicaFondo.play();
    construirMazo();
    barajarMazo();

    document.getElementById("saldo").innerText = `Saldo: $${saldo}`;
    document.getElementById("apuesta").value = "";

    // Asegurar que el área del dealer esté limpia antes de iniciar
    document.getElementById("cartas-dealer").innerHTML = "";
    iniciarJuego();

    document.getElementById("reiniciar").addEventListener("click", reiniciarJuego);
    document.getElementById("apostar").addEventListener("click", realizarApuesta);
};

function construirMazo() {
    let valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let tipos = ["C", "D", "H", "S"];
    mazo = [];

    for (let i = 0; i < tipos.length; i++) {
        for (let j = 0; j < valores.length; j++) {
            mazo.push(valores[j] + "-" + tipos[i]);
        }
    }
}

function barajarMazo() {
    for (let i = 0; i < mazo.length; i++) {
        let j = Math.floor(Math.random() * mazo.length);
        let temp = mazo[i];
        mazo[i] = mazo[j];
        mazo[j] = temp;
    }
}

function realizarApuesta() {
    const apuestaInput = document.getElementById("apuesta").value;
    apuesta = parseInt(apuestaInput);
    
    // Verificar si la apuesta es válida
    if (isNaN(apuesta) || apuesta <= 0 || apuesta > saldo) {
        alert("Por favor, ingrese una apuesta válida.");
        return;
    }
    
    // Restar la apuesta del saldo del jugador

    // Mostrar mensaje de confirmación
    document.getElementById("mensaje-apuesta").innerText = `Apuesta de $${apuesta} realizada.`;
    setTimeout(() => {
        document.getElementById("mensaje-apuesta").innerText = ''; // Ocultar el mensaje después de 3 segundos
    }, 3000);
}

function iniciarJuego() {
    // Carta oculta del dealer
    oculta = mazo.pop();
    dealerSuma += obtenerValor(oculta);
    dealerConteoAs += revisarAs(oculta);

    // Mostrar una carta oculta
    let imagenCartaOculta = document.createElement("img");
    imagenCartaOculta.src = "../cartas/BACK.png";
    imagenCartaOculta.id = "oculta"; // Asignar un ID para manipularla después
    document.getElementById("cartas-dealer").append(imagenCartaOculta);

    // Carta visible del dealer
    let imagenCartaVisible = document.createElement("img");
    let cartaVisible = mazo.pop();
    imagenCartaVisible.src = "../cartas/" + cartaVisible + ".png";
    dealerSuma += obtenerValor(cartaVisible);
    dealerConteoAs += revisarAs(cartaVisible);
    document.getElementById("cartas-dealer").append(imagenCartaVisible);

    // Mostrar valor inicial visible del dealer
    document.getElementById("suma-dealer").innerText = obtenerValor(cartaVisible);

    // Cartas iniciales del jugador
    for (let i = 0; i < 2; i++) {
        let imagenCarta = document.createElement("img");
        let carta = mazo.pop();
        imagenCarta.src = "../cartas/" + carta + ".png";
        jugadorSuma += obtenerValor(carta);
        jugadorConteoAs += revisarAs(carta);
        document.getElementById("cartas-jugador").append(imagenCarta);
    }

    // Ajustar la suma del jugador considerando ases
    jugadorSuma = ajustarAs(jugadorSuma, jugadorConteoAs);

    // Mostrar suma inicial del jugador
    document.getElementById("suma-jugador").innerText = jugadorSuma;

    // Si el jugador comienza con 21, desactivar la opción de pedir y revelar la carta oculta del dealer
    if (jugadorSuma === 21) {
        mostrarMensaje("BLACKJACK!!");
        audioWin.play();
        saldo += apuesta * 2.5;
        puedePedir = false; // Desactivar la posibilidad de pedir más cartas
        revelarCartaOculta(); // Revelar la carta del dealer
    }

    // Configurar eventos para los botones
    document.getElementById("pedir").addEventListener("click", pedirCarta);
    document.getElementById("plantarse").addEventListener("click", plantarse);
}

function pedirCarta() {
    if (!puedePedir) return;  // No permitir pedir más cartas si ya se pasó de 21 o hizo Blackjack

    // Reproducir el sonido de barajar cartas
    audioBaraja.play();

    // Pedir una nueva carta
    let carta = mazo.pop();
    let imagenCarta = document.createElement("img");
    imagenCarta.src = "../cartas/" + carta + ".png";
    jugadorSuma += obtenerValor(carta);
    jugadorConteoAs += revisarAs(carta);
    document.getElementById("cartas-jugador").append(imagenCarta);

    // Ajustar la suma del jugador considerando ases
    jugadorSuma = ajustarAs(jugadorSuma, jugadorConteoAs);

    // Actualizar la suma en el DOM
    document.getElementById("suma-jugador").innerText = jugadorSuma;

    // Comprobar si el jugador se pasa de 21
    if (jugadorSuma > 21) {
        mostrarMensaje("Te pasaste de 21. Perdiste.");
        audioLose.play();
        puedePedir = false; // Detener la posibilidad de pedir más cartas
        saldo -= apuesta;  // El jugador pierde la apuesta
        document.getElementById("saldo").innerText = `Saldo: $${saldo}`;
        revelarCartaOculta(); // Revelar automáticamente la carta del dealer
    } else if (jugadorSuma === 21) {
        // Si el jugador llega exactamente a 21, también se revela la carta del dealer
        mostrarMensaje("BLACKJACK!!");
        audioWin.play();
        saldo += apuesta * 2.5; // El jugador recibe 2.5 veces la apuesta
        puedePedir = false;
        document.getElementById("saldo").innerText = `Saldo: $${saldo}`;
        revelarCartaOculta();
    }
}

function plantarse() {
    if (plantarseActivado) return;  // No permitir plantearse más de una vez
    plantarseActivado = true;

    puedePedir = false;

    revelarCartaOculta();

    // Ajustar la suma del dealer y mostrarla
    dealerSuma = ajustarAs(dealerSuma, dealerConteoAs);
    document.getElementById("suma-dealer").innerText = dealerSuma;

    let mensaje = "";
    if (jugadorSuma === 21 && jugadorConteoAs === 1 && document.getElementById("cartas-jugador").childElementCount === 2) {
        mensaje = "¡BLACKJACK! Ganaste.";
        audioWin.play();
        saldo += apuesta * 2.5;
    } else if (jugadorSuma > 21) {
        mensaje = "Te pasaste de 21. Perdiste.";
        audioLose.play();
        saldo -= apuesta;
    } else if (dealerSuma > 21) {
        mensaje = "Ganaste. El dealer se pasó de 21.";
        audioWin.play();
        saldo += apuesta;
    } else if (jugadorSuma === dealerSuma) {
        mensaje = "Empate."; 
        audioLose.play();  // No se cambia el saldo en empate
    } else if (jugadorSuma > dealerSuma) {
        mensaje = "Ganaste.";
        audioWin.play();
        saldo += apuesta;
    } else {
        mensaje = "Perdiste.";
        audioLose.play();
        saldo -= apuesta;
    }

    // Actualizar el saldo en la interfaz
    document.getElementById("resultado").innerText = mensaje;
    document.getElementById("saldo").innerText = `Saldo: $${saldo}`;
}

function ajustarAs(suma, conteoAs) {
    while (suma > 21 && conteoAs > 0) {
        suma -= 10;
        conteoAs--;
    }
    return suma;
}

function obtenerValor(carta) {
    let data = carta.split("-");  // Separar el valor y el palo
    let valor = data[0];          // Obtener el valor de la carta (ej. "A", "9", "J", "K")
    
    // Si es una carta de letra (J, Q, K), devolver 10
    if (valor === "J" || valor === "Q" || valor === "K") {
        return 10;
    }
    
    // Si es un número, devolver ese número como valor
    if (!isNaN(valor)) {
        return parseInt(valor);
    }

    // Si es un As (A), devolver 11
    return 11;
}


function revisarAs(carta) {
    return carta[0] === "A" ? 1 : 0;
}

function mostrarMensaje(mensaje) {
    document.getElementById("resultado").innerText = mensaje;
    document.getElementById("saldo").innerText = `Saldo: $${saldo}`;
}

function revelarCartaOculta() {
    let imagenCartaOculta = document.createElement("img");
    imagenCartaOculta.src = "../cartas/" + oculta + ".png";
    document.getElementById("cartas-dealer").replaceChild(imagenCartaOculta, document.getElementById("oculta"));
}

function reiniciarJuego() {
    // Limpiar solo las cartas visibles de la ronda actual, no el saldo ni el mazo global
    document.getElementById("cartas-dealer").innerHTML = "";
    document.getElementById("cartas-jugador").innerHTML = "";
    document.getElementById("resultado").innerText = "";

    // Reiniciar variables relacionadas con el estado del juego
    jugadorSuma = 0;
    dealerSuma = 0;
    jugadorConteoAs = 0;
    dealerConteoAs = 0;
    puedePedir = true;
    plantarseActivado = false;

    // Restablecer el botón de "plantarse" y "pedir"
    document.getElementById("pedir").disabled = false;
    document.getElementById("plantarse").disabled = false;


    // Volver a generar un nuevo mazo y barajarlo para la siguiente ronda
    construirMazo();   // Genera el mazo
    barajarMazo();     // Baraja el mazo

    // Asegurar que el mensaje de la apuesta se oculte después del reinicio
    document.getElementById("mensaje-apuesta").style.display = "none";

    // Preparar el juego para una nueva ronda
    iniciarJuego(); // Esta función inicia el juego con las cartas iniciales
}

