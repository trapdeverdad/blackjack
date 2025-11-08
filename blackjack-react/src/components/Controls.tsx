import React from 'react';

interface ControlsProps {
  onHit: () => void;
  onStand: () => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onHit, onStand, onReset }) => {
  return (
    <div className="buttons flex justify-center gap-4 mt-5">
      <button id="pedir" onClick={onHit} className="bg-purple-700 text-white border-none rounded-md py-2.5 px-5 text-base shadow-md font-semibold cursor-pointer transition-colors duration-300 hover:bg-yellow-500 hover:text-black active:transform active:scale-95 m-2.5">Pedir Carta</button>
      <button id="plantarse" onClick={onStand} className="bg-purple-700 text-white border-none rounded-md py-2.5 px-5 text-base shadow-md font-semibold cursor-pointer transition-colors duration-300 hover:bg-yellow-500 hover:text-black active:transform active:scale-95 m-2.5">Plantarse</button>
      <button id="reiniciar" onClick={onReset} className="bg-purple-700 text-white border-none rounded-md py-2.5 px-5 text-base shadow-md font-semibold cursor-pointer transition-colors duration-300 hover:bg-yellow-500 hover:text-black active:transform active:scale-95 m-2.5">Reiniciar Juego</button>
    </div>
  );
};

export default Controls;
