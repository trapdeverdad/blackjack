import React, { useState, useEffect } from 'react';
import Player from './Player';
import Dealer from './Dealer';
import Controls from './Controls';
import { crearMazo, barajarMazo, obtenerValor, revisarAs, ajustarAs } from '../logic/game';

const GameBoard: React.FC = () => {
  const [saldo, setSaldo] = useState(500);
  const [apuesta, setApuesta] = useState(0);
  const [mazo, setMazo] = useState<string[]>([]);
  const [jugadorSuma, setJugadorSuma] = useState(0);
  const [dealerSuma, setDealerSuma] = useState(0);
  const [jugadorCartas, setJugadorCartas] = useState<string[]>([]);
  const [dealerCartas, setDealerCartas] = useState<string[]>([]);
  const [jugadorConteoAs, setJugadorConteoAs] = useState(0);
  const [dealerConteoAs, setDealerConteoAs] = useState(0);
  const [oculta, setOculta] = useState('');
  const [puedePedir, setPuedePedir] = useState(true);
  const [plantarseActivado, setPlantarseActivado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajeApuesta, setMensajeApuesta] = useState('');
  const [sonidoActivado, setSonidoActivado] = useState(true);

  const [audioBaraja] = useState(new Audio('/audios/barajaCarta.mp3'));
  const [audioWin] = useState(new Audio('/audios/juegoGanado.mp3'));
  const [audioLose] = useState(new Audio('/audios/juegoPerdido.mp3'));
  const [musicaFondo] = useState(new Audio('/audios/musicaCasino.mp3'));

  useEffect(() => {
    musicaFondo.loop = true;
    if (sonidoActivado) {
      musicaFondo.play();
    } else {
      musicaFondo.pause();
    }
    return () => {
      musicaFondo.pause();
    };
  }, [sonidoActivado, musicaFondo]);

  useEffect(() => {
    iniciarJuego();
  }, []);

  const iniciarJuego = () => {
    let nuevoMazo = barajarMazo(crearMazo());

    // Reset states
    setJugadorSuma(0);
    setDealerSuma(0);
    setJugadorCartas([]);
    setDealerCartas([]);
    setJugadorConteoAs(0);
    setDealerConteoAs(0);
    setPuedePedir(true);
    setPlantarseActivado(false);
    setMensaje('');

    // Dealer's cards
    const cartaOculta = nuevoMazo.pop()!;
    setOculta(cartaOculta);
    let dealerSumaTemp = obtenerValor(cartaOculta);
    let dealerConteoAsTemp = revisarAs(cartaOculta);

    const cartaVisible = nuevoMazo.pop()!;
    dealerSumaTemp += obtenerValor(cartaVisible);
    dealerConteoAsTemp += revisarAs(cartaVisible);

    setDealerCartas([cartaOculta, cartaVisible]);
    setDealerSuma(dealerSumaTemp);
    setDealerConteoAs(dealerConteoAsTemp);

    // Player's cards
    let jugadorSumaTemp = 0;
    let jugadorConteoAsTemp = 0;
    const jugadorCartasTemp: string[] = [];
    for (let i = 0; i < 2; i++) {
      const carta = nuevoMazo.pop()!;
      jugadorSumaTemp += obtenerValor(carta);
      jugadorConteoAsTemp += revisarAs(carta);
      jugadorCartasTemp.push(carta);
    }
    jugadorSumaTemp = ajustarAs(jugadorSumaTemp, jugadorConteoAsTemp);
    setJugadorSuma(jugadorSumaTemp);
    setJugadorConteoAs(jugadorConteoAsTemp);
    setJugadorCartas(jugadorCartasTemp);

    if (jugadorSumaTemp === 21) {
      setMensaje("BLACKJACK!!");
      setPuedePedir(false);
    }

    setMazo(nuevoMazo);
  };

  const toggleSound = () => {
    setSonidoActivado(!sonidoActivado);
  };

  const realizarApuesta = () => {
    if (apuesta <= 0 || apuesta > saldo) {
      setMensajeApuesta("Por favor, ingrese una apuesta válida.");
      return;
    }
    setMensajeApuesta(`Apuesta de $${apuesta} realizada.`);
  };

  const pedirCarta = () => {
    if (!puedePedir) return;
    if (sonidoActivado) audioBaraja.play();

    const carta = mazo.pop()!;
    let nuevaSuma = jugadorSuma + obtenerValor(carta);
    let nuevoConteoAs = jugadorConteoAs + revisarAs(carta);
    nuevaSuma = ajustarAs(nuevaSuma, nuevoConteoAs);

    setJugadorSuma(nuevaSuma);
    setJugadorConteoAs(nuevoConteoAs);
    setJugadorCartas([...jugadorCartas, carta]);

    if (nuevaSuma > 21) {
      setMensaje("Te pasaste de 21. Perdiste.");
      setPuedePedir(false);
    } else if (nuevaSuma === 21) {
      setMensaje("BLACKJACK!!");
      setPuedePedir(false);
    }
  };

  const plantarse = () => {
    if (plantarseActivado) return;
    setPlantarseActivado(true);
    setPuedePedir(false);

    let dealerSumaFinal = ajustarAs(dealerSuma, dealerConteoAs);
    let dealerCartasFinal = [...dealerCartas];
    let mazoActual = [...mazo];

    while (dealerSumaFinal < 17) {
      const carta = mazoActual.pop()!;
      dealerSumaFinal += obtenerValor(carta);
      dealerCartasFinal.push(carta);
      dealerSumaFinal = ajustarAs(dealerSumaFinal, dealerConteoAs + dealerCartasFinal.filter(c => c.startsWith('A')).length);
    }

    setDealerSuma(dealerSumaFinal);
    setDealerCartas(dealerCartasFinal);
    setMazo(mazoActual);

    let mensajeFinal = "";
    let nuevoSaldo = saldo;
    if (jugadorSuma > 21) {
      mensajeFinal = "Te pasaste de 21. Perdiste.";
      nuevoSaldo -= apuesta;
      if (sonidoActivado) audioLose.play();
    } else if (dealerSumaFinal > 21) {
      mensajeFinal = "Ganaste. El dealer se pasó de 21.";
      nuevoSaldo += apuesta;
      if (sonidoActivado) audioWin.play();
    } else if (jugadorSuma === dealerSumaFinal) {
      mensajeFinal = "Empate.";
    } else if (jugadorSuma > dealerSumaFinal) {
      mensajeFinal = "Ganaste.";
      nuevoSaldo += apuesta;
      if (sonidoActivado) audioWin.play();
    } else {
      mensajeFinal = "Perdiste.";
      nuevoSaldo -= apuesta;
      if (sonidoActivado) audioLose.play();
    }
    setSaldo(nuevoSaldo);
    setMensaje(mensajeFinal);
  };

  return (
    <div className="bg-green-800 text-white font-sans text-center p-0 m-0 min-h-screen flex flex-col items-center justify-center">
      <div className="game-container w-full max-w-4xl mx-auto p-5">
        <div className="back-button absolute top-5 left-5">
          <a href="inicio.html">
            <button className="bg-yellow-500 text-lg p-2.5 rounded-md"><span>&#8592; Volver</span></button>
          </a>
        </div>

        <div id="informacion" className="text-lg mb-5 text-white">
          <p id="saldo">Saldo: ${saldo}</p>
          <label htmlFor="apuesta">Apostar: </label>
          <input type="number" id="apuesta" placeholder="Ingrese su apuesta" className="p-2 m-2.5 text-base rounded-md border-none text-black" onChange={(e) => setApuesta(parseInt(e.target.value))} />
          <button id="apostar" className="p-2.5 bg-purple-700 text-white rounded-md text-base font-semibold cursor-pointer" onClick={realizarApuesta}>Apostar</button>
          <p id="mensaje-apuesta" className="text-base text-green-500 font-bold mt-2.5">{mensajeApuesta}</p>
        </div>

        <Dealer score={plantarseActivado ? dealerSuma : obtenerValor(dealerCartas[1] || '')} cards={dealerCartas} showHidden={plantarseActivado} />
        <Player score={jugadorSuma} cards={jugadorCartas} />

        <div id="resultado" className="text-xl font-bold mt-4">{mensaje}</div>

        <Controls onHit={pedirCarta} onStand={plantarse} onReset={iniciarJuego} />

        <button id="btn-sound" className="bg-transparent border-none text-white text-3xl cursor-pointer fixed bottom-5 right-5 z-10 p-2.5 rounded-full shadow-lg" onClick={toggleSound}>
          <i className={`fas ${sonidoActivado ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
