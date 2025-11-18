import React from 'react';
import { FaTrashAlt, FaVolumeUp, FaVolumeMute, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

type Props = {
  saldo: number;
  apuesta: number;
  cambiarApuesta: (v: number) => void;
  realizarApuesta: () => void;
  betConfirmed: boolean;
  mensajeApuesta: string;
  resetApuesta: () => void;
  volume: number;
  changeVolume: (v: number) => void;
  toggleMute: () => void;
  muted: boolean;
};

const Sidebar: React.FC<Props> = ({
  saldo,
  apuesta,
  cambiarApuesta,
  realizarApuesta,
  betConfirmed,
  mensajeApuesta,
  resetApuesta,
  volume,
  changeVolume,
  toggleMute,
  muted,
}) => {
  return (
  <aside className="fixed left-0 top-0 h-full w-96 text-white p-6 z-30 shadow-xl bg-slate-900">
      <div className="mb-8">
        <div className="">
          <p className="text-xs uppercase text-gray-400 tracking-wider">Saldo</p>
          <p className="text-3xl font-extrabold mt-2 text-white">${saldo}</p>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2 text-gray-300">Apostar</label>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button
              onClick={() => cambiarApuesta(Math.max(0, (apuesta || 0) - 100))}
              disabled={betConfirmed || (apuesta || 0) <= 0}
              title="-100"
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-gray-200"
            >
              <FaAngleDoubleLeft size={12} />
            </button>
            <button
              onClick={() => cambiarApuesta(Math.max(0, (apuesta || 0) - 50))}
              disabled={betConfirmed || (apuesta || 0) <= 0}
              title="-50"
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-gray-200"
            >
              <FaChevronLeft size={14} />
            </button>
          </div>

          <input
            type="number"
            value={apuesta || ''}
            onChange={(e) => cambiarApuesta(Math.max(0, parseInt(e.target.value || '0')))}
            className="flex-1 p-3 rounded-lg text-black bg-white/90 shadow-sm text-center"
            disabled={betConfirmed}
          />

          <div className="flex gap-1">
            <button
              onClick={() => cambiarApuesta(Math.max(0, (apuesta || 0) + 50))}
              disabled={betConfirmed}
              title="+50"
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-gray-200"
            >
              <FaChevronRight size={14} />
            </button>
            <button
              onClick={() => cambiarApuesta(Math.max(0, (apuesta || 0) + 100))}
              disabled={betConfirmed}
              title="+100"
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-gray-200"
            >
              <FaAngleDoubleRight size={12} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-4 items-center">
          <button
            onClick={realizarApuesta}
            disabled={betConfirmed}
            className={`flex-1 p-3 rounded-lg text-sm font-medium ${betConfirmed ? 'bg-green-700/90' : 'bg-green-600 hover:bg-green-500'} transition`}
          >
            {betConfirmed ? 'Apuesta confirmada' : 'Confirmar apuesta'}
          </button>

          <button
            onClick={resetApuesta}
            aria-label="reset-apuesta"
            className="p-2 bg-transparent border border-gray-700 rounded-md flex items-center justify-center hover:bg-gray-800 transition"
          >
            <FaTrashAlt size={18} />
          </button>
        </div>
        <p className="text-sm text-green-400 mt-3">{mensajeApuesta}</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-200">Volumen</label>
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition">
            {muted || volume === 0 ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
          </button>
          <input type="range" min={0} max={100} value={volume} onChange={(e) => changeVolume(parseInt(e.target.value))} className="flex-1" />
          <span className="w-10 text-right text-gray-200">{volume}%</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
