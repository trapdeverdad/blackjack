import React, { useState, useEffect } from 'react';
import Player from './Player';
import Dealer from './Dealer';
import Controls from './Controls';
import Sidebar from './Sidebar';
import { crearMazo, barajarMazo, obtenerValor, revisarAs, ajustarAs, esDiezOCara, esBlackjackNatural, ajustarSumaYAces } from '../logic/logic/game';

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
  const [betConfirmed, setBetConfirmed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [volume, setVolume] = useState(50); // 0-100
  const [prevVolume, setPrevVolume] = useState(50);
  const [muted, setMuted] = useState(false);
  const [doubledDown, setDoubledDown] = useState(false); // indica si ya se realizó double down en la mano actual
  const [showOutOfMoney, setShowOutOfMoney] = useState(false);

  const [audioBaraja] = useState(new Audio('/audios/barajaCarta.mp3'));
  const [audioWin] = useState(new Audio('/audios/juegoGanado.mp3'));
  const [audioLose] = useState(new Audio('/audios/juegoPerdido.mp3'));
  const [musicaFondo] = useState(new Audio('/audios/musicaCasino.mp3'));

  useEffect(() => {
    musicaFondo.loop = true;
    // sincronizar volumen con estado (0.0 - 1.0)
    const vol = Math.max(0, Math.min(1, (muted ? 0 : volume / 100)));
    musicaFondo.volume = vol;
    audioBaraja.volume = vol;
    audioWin.volume = vol;
    audioLose.volume = vol;

    if (sonidoActivado) {
      // Intentamos reproducir; si el navegador bloquea el autoplay
      // la promesa rechazará y lo capturamos para evitar el error en consola.
      const p = musicaFondo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {
        // Autoplay bloqueado: esperaremos a una interacción del usuario
        // (el botón de sonido o cualquier click) para reintentar.
      });
    } else {
      musicaFondo.pause();
    }
    return () => {
      musicaFondo.pause();
    };
  }, [sonidoActivado, musicaFondo]);

  // Sincroniza volumen cuando cambia el slider o el mute
  useEffect(() => {
    const vol = Math.max(0, Math.min(1, (muted ? 0 : volume / 100)));
    musicaFondo.volume = vol;
    audioBaraja.volume = vol;
    audioWin.volume = vol;
    audioLose.volume = vol;
  }, [volume, muted, musicaFondo, audioBaraja, audioWin, audioLose]);

  useEffect(() => {
    // Iniciar una nueva mano automáticamente cuando se confirme una apuesta
    if (betConfirmed) {
      iniciarJuego();
    }
  }, [betConfirmed]);

  // Si el saldo llega a 0 mostramos el modal de "La casa siempre gana"
  useEffect(() => {
    if (saldo <= 0) {
      setShowOutOfMoney(true);
      // asegurarnos de bloquear la apuesta
      setBetConfirmed(false);
    } else {
      setShowOutOfMoney(false);
    }
  }, [saldo]);

  const iniciarJuego = () => {
    // Requerir apuesta confirmada para iniciar una mano
    if (!betConfirmed) {
      setMensajeApuesta('Por favor, confirme una apuesta para iniciar.');
      return;
    }
    setGameOver(false);
    let nuevoMazo = barajarMazo(crearMazo());

    // Reset states (inicia mano)
    setJugadorSuma(0);
    setDealerSuma(0);
    setJugadorCartas([]);
    setDealerCartas([]);
    setJugadorConteoAs(0);
    setDealerConteoAs(0);
    setPuedePedir(true);
    setPlantarseActivado(false);
    setMensaje('');
  setDoubledDown(false);

  // Dealer's cards
    const cartaOculta = nuevoMazo.pop()!;
    setOculta(cartaOculta);
  let dealerSumaTemp = obtenerValor(cartaOculta);
  let dealerAcesComo11 = revisarAs(cartaOculta);

  const cartaVisible = nuevoMazo.pop()!;
  dealerSumaTemp += obtenerValor(cartaVisible);
  dealerAcesComo11 += revisarAs(cartaVisible);

  // Ajustar por si se pasa (raro con 2 cartas salvo ambos As)
  const dealerAjuste = ajustarSumaYAces(dealerSumaTemp, dealerAcesComo11);
  dealerSumaTemp = dealerAjuste.suma;
  dealerAcesComo11 = dealerAjuste.asesComo11;

  setDealerCartas([cartaOculta, cartaVisible]);
  setDealerSuma(dealerSumaTemp);
  setDealerConteoAs(dealerAcesComo11);

    // Player's cards
    let jugadorSumaTemp = 0;
    let jugadorAcesComo11 = 0;
    const jugadorCartasTemp: string[] = [];
    for (let i = 0; i < 2; i++) {
      const carta = nuevoMazo.pop()!;
      jugadorSumaTemp += obtenerValor(carta);
      jugadorAcesComo11 += revisarAs(carta);
      jugadorCartasTemp.push(carta);
    }
    const ajusteJugador = ajustarSumaYAces(jugadorSumaTemp, jugadorAcesComo11);
    jugadorSumaTemp = ajusteJugador.suma;
    jugadorAcesComo11 = ajusteJugador.asesComo11;
    setJugadorSuma(jugadorSumaTemp);
    setJugadorConteoAs(jugadorAcesComo11);
    setJugadorCartas(jugadorCartasTemp);

    // Chequeo temprano de Blackjack natural y peek del dealer (upcard A o 10)
  const dealerSumaAjustada = dealerSumaTemp; // ya ajustado arriba
  const dealerEsNatural = dealerSumaAjustada === 21; // con exactamente 2 cartas
    const jugadorEsNatural = esBlackjackNatural(jugadorCartasTemp);
    const upcard = cartaVisible;
    const dealerPuedeRevisar = revisarAs(upcard) === 1 || esDiezOCara(upcard);

    // Si el dealer puede revisar y tiene blackjack, se resuelve al instante
    if (dealerPuedeRevisar && dealerEsNatural) {
      // Revelar y finalizar
      setPlantarseActivado(true);
  setDealerSuma(dealerSumaAjustada);
      setPuedePedir(false);

      let nuevoSaldo = saldo;
      if (jugadorEsNatural) {
        // Push: devolver stake
        setMensaje("Empate: ambos tienen Blackjack.");
        nuevoSaldo += apuesta;
      } else {
        setMensaje("Dealer tiene Blackjack. Perdiste.");
        if (sonidoActivado) {
          const p = audioLose.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      }
      setSaldo(nuevoSaldo);
      setGameOver(true);
      setBetConfirmed(false);
      setApuesta(0);
      setMensajeApuesta('');
      setMazo(nuevoMazo);
      return;
    }

    // Si el jugador tiene Blackjack natural y el dealer no lo tiene, pagar 3:2 y finalizar
    if (jugadorEsNatural) {
      setPlantarseActivado(true); // mostramos la oculta para claridad
  setDealerSuma(dealerSumaAjustada);
      setPuedePedir(false);

      let nuevoSaldo = saldo + apuesta * 2.5; // stake (1x) + ganancia (1.5x)
      setSaldo(nuevoSaldo);
      setMensaje("BLACKJACK! Pago 3:2.");
      if (sonidoActivado) {
        const p = audioWin.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
      setGameOver(true);
      setBetConfirmed(false);
      setApuesta(0);
      setMensajeApuesta('');
      setMazo(nuevoMazo);
      return;
    }

    // Si el dealer puede revisar y NO tenía blackjack, o si no hay naturales, seguimos la mano normal
    setMazo(nuevoMazo);
  };

  const toggleMute = () => {
    if (muted) {
      setMuted(false);
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setMuted(true);
      setVolume(0);
    }
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (v === 0) setMuted(true); else setMuted(false);
  };

  const toggleSound = () => {
    const nuevo = !sonidoActivado;
    setSonidoActivado(nuevo);
    // Si activamos, intentamos reproducir y manejamos la posible promesa rechazada
    if (nuevo) {
      const p = musicaFondo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {
        // Autoplay bloqueado: no hacemos nada, la reproducción se activará
        // cuando el usuario interactúe (por ejemplo al presionar cualquier botón)
      });
    } else {
      musicaFondo.pause();
    }
  };

  const realizarApuesta = () => {
    // No permitir confirmar una nueva apuesta si ya hay una ronda activa
    if (betConfirmed && !gameOver) {
      setMensajeApuesta('Ya hay una ronda activa. Finaliza la mano antes de apostar.');
      return;
    }
    const apuestaVal = isNaN(apuesta) ? 0 : apuesta;
    if (apuestaVal <= 0 || apuestaVal > saldo) {
      setMensajeApuesta("Por favor, ingrese una apuesta válida.");
      return;
    }
    setMensajeApuesta(`Apuesta de $${apuestaVal} realizada.`);
    setBetConfirmed(true);
    // Deduce el saldo inmediatamente al confirmar la apuesta
    setSaldo((s) => s - apuestaVal);
  };

  const cambiarApuesta = (v: number) => {
    // No permitir cambiar la apuesta durante una ronda activa
    if (betConfirmed && !gameOver) {
      setMensajeApuesta('No puedes cambiar la apuesta durante una mano activa.');
      return;
    }
    const val = Math.max(0, Math.floor(v));
    setApuesta(val);
    setMensajeApuesta('');
    setBetConfirmed(false);
  };

  const resetApuesta = () => {
    // No permitir reset durante una ronda activa
    if (betConfirmed && !gameOver) {
      setMensajeApuesta('No puedes resetear la apuesta durante una mano activa.');
      return;
    }
    // Si la apuesta ya estaba confirmada y la ronda no está activa, devolverla al saldo
    if (betConfirmed && apuesta > 0) {
      setSaldo((s) => s + apuesta);
    }
    setApuesta(0);
    setMensajeApuesta('');
    setBetConfirmed(false);
  };

  const restartGameApp = () => {
    // restablece el estado principal como si reiniciara la app
    setSaldo(500);
    setApuesta(0);
    setMensajeApuesta('');
    setBetConfirmed(false);
    setGameOver(false);
    setJugadorCartas([]);
    setDealerCartas([]);
    setJugadorSuma(0);
    setDealerSuma(0);
    setJugadorConteoAs(0);
    setDealerConteoAs(0);
    setPuedePedir(true);
    setPlantarseActivado(false);
    setMensaje('');
    setMazo([]);
    setShowOutOfMoney(false);
  };

  const pedirCarta = () => {
    if (!puedePedir || !betConfirmed || gameOver) return;
    if (sonidoActivado) {
      const p = audioBaraja.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    const carta = mazo.pop()!;
    let nuevaSumaBase = jugadorSuma + obtenerValor(carta);
    let nuevoAcesComo11 = jugadorConteoAs + revisarAs(carta);
    const ajuste = ajustarSumaYAces(nuevaSumaBase, nuevoAcesComo11);
    const nuevaSuma = ajuste.suma;
    nuevoAcesComo11 = ajuste.asesComo11;

    setJugadorSuma(nuevaSuma);
    setJugadorConteoAs(nuevoAcesComo11);
    setJugadorCartas([...jugadorCartas, carta]);

    if (nuevaSuma > 21) {
      setMensaje("Te pasaste de 21. Perdiste.");
      setPuedePedir(false);
      if (sonidoActivado) {
        const p = audioLose.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
      // Resolver apuesta inmediatamente al bust
      // (La apuesta ya fue deducida, solo cerramos la mano)
      setGameOver(true);
      setBetConfirmed(false);
      setApuesta(0);
      setMensajeApuesta('');
      return;
    } else if (nuevaSuma === 21) {
      setMensaje("BLACKJACK!!");
      setPuedePedir(false);
    }
  };

  const doubleDown = () => {
    // Condiciones: apuesta confirmada, mano inicial (2 cartas), saldo suficiente para duplicar, no bust, no game over, no ya doblado
    if (!betConfirmed || gameOver || jugadorCartas.length !== 2 || !puedePedir || doubledDown) return;
    if (saldo < apuesta) {
      setMensaje("Saldo insuficiente para Double Down.");
      return;
    }
    // Deduce apuesta adicional
    setSaldo(s => s - apuesta);
    setApuesta(a => a * 2);
    setDoubledDown(true);
    // Tomar exactamente una carta y plantarse automáticamente si no bust
    const carta = mazo.pop()!;
    let nuevaSumaBase = jugadorSuma + obtenerValor(carta);
    let nuevoAcesComo11 = jugadorConteoAs + revisarAs(carta);
    const ajuste = ajustarSumaYAces(nuevaSumaBase, nuevoAcesComo11);
    const nuevaSuma = ajuste.suma;
    nuevoAcesComo11 = ajuste.asesComo11;
    setJugadorSuma(nuevaSuma);
    setJugadorConteoAs(nuevoAcesComo11);
    setJugadorCartas([...jugadorCartas, carta]);
    if (nuevaSuma > 21) {
      setMensaje("Te pasaste de 21 tras Double Down. Perdiste.");
      if (sonidoActivado) {
        const p = audioLose.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
      setPuedePedir(false);
      setGameOver(true);
      setBetConfirmed(false);
      setApuesta(0);
      setMensajeApuesta('');
      return;
    }
    // Si no bust, plantarse automáticamente
    plantarse();
  };

  const plantarse = () => {
    if (plantarseActivado || !betConfirmed || gameOver) return;
    setPlantarseActivado(true);
    setPuedePedir(false);

    let dealerSumaFinal = dealerSuma;
    let dealerAcesComo11 = dealerConteoAs;
    let dealerCartasFinal = [...dealerCartas];
    let mazoActual = [...mazo];

    while (dealerSumaFinal < 17) {
      const carta = mazoActual.pop()!;
      dealerSumaFinal += obtenerValor(carta);
      dealerAcesComo11 += revisarAs(carta);
      const ajuste = ajustarSumaYAces(dealerSumaFinal, dealerAcesComo11);
      dealerSumaFinal = ajuste.suma;
      dealerAcesComo11 = ajuste.asesComo11;
      dealerCartasFinal.push(carta);
    }

  setDealerSuma(dealerSumaFinal);
  setDealerConteoAs(dealerAcesComo11);
  setDealerCartas(dealerCartasFinal);
    setMazo(mazoActual);

    // DEBUG: registrar estados relevantes para diagnosticar empates/pagos
    try {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG] Resolviendo plantarse', {
        jugadorSuma,
        jugadorCartas,
        dealerSumaFinal,
        dealerCartasFinal,
        apuesta,
        saldo
      });
    } catch (e) {}

    let mensajeFinal = "";
    let nuevoSaldo = saldo;

    if (betConfirmed) {
      // Si la apuesta ya fue deducida al confirmar, aquí solo devolvemos/entregamos premios
      if (jugadorSuma > 21) {
        mensajeFinal = "Te pasaste de 21. Perdiste.";
        // ya se dedujo la apuesta al confirmar
        if (sonidoActivado) {
          const p = audioLose.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      } else if (dealerSumaFinal > 21) {
        mensajeFinal = "Ganaste. El dealer se pasó de 21.";
        // devolver stake + ganancia (stake * 2)
        nuevoSaldo += apuesta * 2;
        if (sonidoActivado) {
          const p = audioWin.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      } else if (jugadorSuma === dealerSumaFinal) {
        mensajeFinal = "Empate.";
        // devolver stake
        nuevoSaldo += apuesta;
      } else if (jugadorSuma > dealerSumaFinal) {
        mensajeFinal = "Ganaste.";
        nuevoSaldo += apuesta * 2;
        if (sonidoActivado) {
          const p = audioWin.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      } else {
        mensajeFinal = "Perdiste.";
        // ya se dedujo la apuesta al confirmar
        if (sonidoActivado) {
          const p = audioLose.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      }
    } else {
      // comportamiento anterior: la apuesta no se dedujo
      if (jugadorSuma > 21) {
        mensajeFinal = "Te pasaste de 21. Perdiste.";
        nuevoSaldo -= apuesta;
        if (sonidoActivado) {
          const p = audioLose.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      } else if (dealerSumaFinal > 21) {
        mensajeFinal = "Ganaste. El dealer se pasó de 21.";
        nuevoSaldo += apuesta;
        if (sonidoActivado) {
          const p = audioWin.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      } else if (jugadorSuma === dealerSumaFinal) {
        mensajeFinal = "Empate.";
      } else if (jugadorSuma > dealerSumaFinal) {
        mensajeFinal = "Ganaste.";
        nuevoSaldo += apuesta;
        if (sonidoActivado) {
          const p = audioWin.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      } else {
        mensajeFinal = "Perdiste.";
        nuevoSaldo -= apuesta;
        if (sonidoActivado) {
          const p = audioLose.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      }
    }

    // limpiar estado de apuesta tras resolución
  setGameOver(true);
  setBetConfirmed(false);
    setApuesta(0);
    setMensajeApuesta('');

    setSaldo(nuevoSaldo);
    setMensaje(mensajeFinal);
  };

  return (
    <div className="bg-green-800 text-white font-sans text-center p-0 m-0 min-h-screen flex flex-col items-center justify-center">
  <div className="game-container w-full max-w-4xl mx-auto p-5 ml-80">
        <div className="back-button absolute top-5 left-5">
          <a href="inicio.html">
            <button className="bg-yellow-500 text-lg p-2.5 rounded-md"><span>&#8592; Volver</span></button>
          </a>
        </div>

        <Sidebar
          saldo={saldo}
          apuesta={apuesta}
          cambiarApuesta={cambiarApuesta}
          realizarApuesta={realizarApuesta}
          betConfirmed={betConfirmed}
          mensajeApuesta={mensajeApuesta}
          resetApuesta={resetApuesta}
          volume={volume}
          changeVolume={changeVolume}
          toggleMute={toggleMute}
          muted={muted}
        />

        <Dealer score={plantarseActivado ? dealerSuma : obtenerValor(dealerCartas[1] || '')} cards={dealerCartas} showHidden={plantarseActivado} />
        <Player score={jugadorSuma} cards={jugadorCartas} />

        <div id="resultado" className="text-xl font-bold mt-4">{mensaje}</div>

        <Controls
          onHit={pedirCarta}
          onStand={plantarse}
          onDoubleDown={doubleDown}
          canHit={betConfirmed && !gameOver && puedePedir}
          canStand={betConfirmed && !gameOver && !plantarseActivado}
          canDouble={betConfirmed && !gameOver && puedePedir && jugadorCartas.length === 2 && saldo >= apuesta && !doubledDown}
        />

        {/* Modal simple cuando el jugador se queda sin saldo */}
        {showOutOfMoney && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
              <h3 className="text-xl font-bold mb-4 text-black">La casa siempre gana</h3>
              <p className="text-gray-700 mb-6">Te has quedado sin saldo.</p>
              <button
                onClick={restartGameApp}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-500"
              >
                Reiniciar juego
              </button>
            </div>
          </div>
        )}

        {/* El botón flotante de sonido se eliminó: se usa el icono dentro del sidebar para mutear/desmutear */}
      </div>
    </div>
  );
};

export default GameBoard;
