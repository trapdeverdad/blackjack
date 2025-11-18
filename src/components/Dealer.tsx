import React from 'react';

interface DealerProps {
  score: number;
  cards: string[];
  showHidden: boolean;
}

const Dealer: React.FC<DealerProps> = ({ score, cards, showHidden }) => {
  return (
    <div className="section dealer mb-5">
      <h2 className="text-xl">Dealer: <span id="suma-dealer">{score}</span></h2>
      <div id="cartas-dealer" className="flex justify-center items-center gap-4 mt-2.5 relative">
        {(cards.length > 0 ? cards : ["BACK", "BACK"]).map((card, index) => (
          <img
            key={index}
            src={`/cartas/${index === 0 && !showHidden ? 'BACK' : card}.png`}
            alt={card}
            className="h-44 w-32 rounded-lg shadow-lg"
          />
        ))}
      </div>
    </div>
  );
};

export default Dealer;
