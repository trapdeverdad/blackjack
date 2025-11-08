import React from 'react';

interface PlayerProps {
  score: number;
  cards: string[];
}

const Player: React.FC<PlayerProps> = ({ score, cards }) => {
  return (
    <div className="section player mb-5">
      <h2 className="text-xl">Jugador: <span id="suma-jugador">{score}</span></h2>
      <div id="cartas-jugador" className="flex justify-center gap-4 mt-2.5">
        {cards.map((card, index) => (
          <img key={index} src={`/cartas/${card}.png`} alt="card" className="h-44 w-32 rounded-lg shadow-lg" />
        ))}
      </div>
    </div>
  );
};

export default Player;
