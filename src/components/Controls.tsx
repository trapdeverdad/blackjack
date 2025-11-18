import React from 'react';

interface ControlsProps {
  onHit: () => void;
  onStand: () => void;
  onDoubleDown: () => void;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  disabled?: boolean;
}

const baseBtn = "bg-purple-700 text-white border-none rounded-md py-2.5 px-5 text-base shadow-md font-semibold cursor-pointer transition-colors duration-300 hover:bg-yellow-500 hover:text-black active:transform active:scale-95 m-2.5 disabled:opacity-40 disabled:cursor-not-allowed";

const Controls: React.FC<ControlsProps> = ({ onHit, onStand, onDoubleDown, canHit, canStand, canDouble, disabled }) => {
  return (
    <div className="buttons flex justify-center gap-4 mt-5">
      <button id="doble" onClick={onDoubleDown} disabled={!canDouble || disabled} className={baseBtn}>Double Down</button>
      <button id="pedir" onClick={onHit} disabled={!canHit || disabled} className={baseBtn}>Pedir Carta</button>
      <button id="plantarse" onClick={onStand} disabled={!canStand || disabled} className={baseBtn}>Plantarse</button>
    </div>
  );
};

export default Controls;
