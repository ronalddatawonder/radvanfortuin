import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Trophy, User, CheckCircle2, Circle, RefreshCw, X } from 'lucide-react';
import confetti from 'canvas-confetti';

type Participant = {
  id: string;
  name: string;
  active: boolean;
};

const COLORS = [
  '#6366f1', // indigo-500
  '#f43f5e', // rose-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#0ea5e9', // sky-500
  '#a855f7', // purple-500
  '#f97316', // orange-500
  '#94a3b8', // slate-400
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
  '#eab308'  // yellow-500
];

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alice', active: true },
    { id: '2', name: 'Bob', active: true },
    { id: '3', name: 'Charlie', active: true },
    { id: '4', name: 'David', active: true },
  ]);
  const [newName, setNewName] = useState('');
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);

  const activeParticipants = participants.filter(p => p.active);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setParticipants(prev => [...prev, {
      id: crypto.randomUUID(),
      name: newName.trim(),
      active: true
    }]);
    setNewName('');
  };

  const toggleActive = (id: string) => {
    if (spinning) return;
    setParticipants(prev => prev.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const deleteParticipant = (id: string) => {
    if (spinning) return;
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const resetAllActive = () => {
    if (spinning) return;
    setParticipants(prev => prev.map(p => ({ ...p, active: true })));
  };

  const spinWheel = () => {
    if (activeParticipants.length < 2 || spinning) return;
    
    setSpinning(true);
    setWinner(null);

    const winnerIdx = Math.floor(Math.random() * activeParticipants.length);
    const selectedWinner = activeParticipants[winnerIdx];

    const sliceAngle = 360 / activeParticipants.length;
    const targetSliceCenterAngle = (winnerIdx * sliceAngle) + (sliceAngle / 2);

    const currentMod = rotation % 360;
    const extraDegrees = 360 - targetSliceCenterAngle;
    let delta = extraDegrees - currentMod;
    if (delta <= 0) delta += 360;

    const spins = 6;
    const nextRotation = rotation + (spins * 360) + delta;

    setRotation(nextRotation);

    setTimeout(() => {
      setSpinning(false);
      setWinner(selectedWinner);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        zIndex: 100,
        colors: ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#F15BB5']
      });
    }, 5500);
  };

  const removeWinnerFromWheel = () => {
    if (winner) toggleActive(winner.id);
    setWinner(null);
  };

  const renderNameOnWheel = (name: string) => {
    const parts = name.trim().split(' ');
    const truncate = (s: string) => (s.length > 20 ? s.substring(0, 18) + '...' : s);

    if (parts.length <= 1) {
      return <tspan>{truncate(name)}</tspan>;
    }
    
    if (parts.length === 2) {
      return (
        <>
          <tspan x="0" dy="-0.6em">{truncate(parts[0])}</tspan>
          <tspan x="0" dy="1.2em">{truncate(parts[1])}</tspan>
        </>
      );
    }

    const line1 = parts[0];
    const line3 = parts[parts.length - 1];
    const line2 = parts.slice(1, parts.length - 1).join(' ');

    return (
      <>
        <tspan x="0" dy="-1.2em">{truncate(line1)}</tspan>
        <tspan x="0" dy="1.2em">{truncate(line2)}</tspan>
        <tspan x="0" dy="1.2em">{truncate(line3)}</tspan>
      </>
    );
  };

  const renderWheel = () => {
    const total = activeParticipants.length;

    if (total === 0) {
      return <circle cx="0" cy="0" r="100" fill="#cbd5e1" />;
    }
    
    if (total === 1) {
      return (
        <g>
          <circle cx="0" cy="0" r="100" fill={COLORS[0]} />
          <text 
            transform="translate(0, -85) rotate(-90)" 
            fill="white" 
            fontSize="14" 
            fontWeight="bold" 
            textAnchor="end" 
            dominantBaseline="central"
            style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.4)" }}
          >
            {renderNameOnWheel(activeParticipants[0].name)}
          </text>
        </g>
      );
    }

    const sliceAngle = 360 / total;

    return activeParticipants.map((p, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = (i + 1) * sliceAngle;
      const radius = 100;
      
      const start = polarToCartesian(0, 0, radius, endAngle);
      const end = polarToCartesian(0, 0, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
      const d = [
        "M", 0, 0,
        "L", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "Z"
      ].join(" ");
      
      const midAngle = startAngle + (sliceAngle / 2);

      return (
        <g key={p.id}>
          <path d={d} fill={COLORS[i % COLORS.length]} />
          <text
            transform={`rotate(${midAngle}) translate(0, -85) rotate(-90)`}
            fill="white"
            fontSize={total > 16 ? "5" : total > 12 ? "7" : total > 8 ? "9" : "11"}
            fontWeight="bold"
            textAnchor="end"
            dominantBaseline="central"
            style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.5)" }}
          >
            {renderNameOnWheel(p.name)}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* Sidebar: Names Management */}
      <aside className="w-full lg:w-80 h-[45vh] lg:h-screen bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col p-6 lg:p-8 z-10 shadow-sm relative">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-600">Rad van fortuin</h1>
          <p className="text-sm text-slate-500 mt-1">Voeg namen toe en draai aan het rad.</p>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-3 lg:gap-4 mb-6 lg:mb-8">
          <label className="text-xs font-semibold tracking-wider text-slate-400">Nieuwe deelnemer</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={spinning}
              placeholder="Naam invullen..."
              className="flex-1 px-4 py-2 lg:py-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newName.trim() || spinning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 lg:py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
            >
              <Plus strokeWidth={3} className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-semibold tracking-wider text-slate-400">
              deelnemers ({activeParticipants.length}/{participants.length})
            </label>
          </div>

          <div className="flex flex-wrap gap-2 content-start pb-4">
            {participants.length === 0 ? (
              <p className="text-slate-400 text-sm italic w-full text-center py-4">Geen namen nog. Voeg er een paar toe!</p>
            ) : (
              participants.map((p, i) => {
                const colors = [
                  'bg-indigo-50 text-indigo-700 border-indigo-100',
                  'bg-rose-50 text-rose-700 border-rose-100',
                  'bg-amber-50 text-amber-700 border-amber-100',
                  'bg-emerald-50 text-emerald-700 border-emerald-100',
                  'bg-sky-50 text-sky-700 border-sky-100',
                  'bg-purple-50 text-purple-700 border-purple-100',
                  'bg-orange-50 text-orange-700 border-orange-100'
                ];
                const activeColor = colors[i % colors.length];
                const bgClass = p.active ? activeColor : 'bg-slate-100 text-slate-400 border-slate-200 line-through';
                
                return (
                  <div 
                    key={p.id} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${bgClass}`}
                  >
                    <button 
                      className={`hover:opacity-70 focus:outline-none transition-opacity ${!p.active ? 'opacity-50' : ''}`}
                      onClick={() => toggleActive(p.id)}
                      disabled={spinning}
                      title={p.active ? "Verwijder tijdelijk" : "Voeg weer toe"}
                    >
                      {p.name}
                    </button>
                    <button
                      onClick={() => deleteParticipant(p.id)}
                      disabled={spinning}
                      className={`hover:text-red-500 transition-colors focus:outline-none ${!p.active ? 'opacity-50' : 'text-current/60'}`}
                      title="Verwijder definitief"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-3 border-t border-slate-100">
          <button 
            onClick={spinWheel}
            disabled={spinning || activeParticipants.length < 2}
            className="w-full py-3 lg:py-4 bg-indigo-600 text-white rounded-xl font-bold text-base lg:text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
          >
            {spinning ? 'AAN HET DRAAIEN...' : 'DRAAI HET RAD'}
          </button>
          <button 
            onClick={resetAllActive}
            disabled={spinning || activeParticipants.length === participants.length}
            className="w-full py-2.5 lg:py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Reset deelnemers
          </button>
        </div>
      </aside>

      {/* Main Board: The Wheel */}
      <main className="flex-1 flex flex-col items-center justify-center relative bg-slate-50 p-4 lg:p-8 h-[55vh] lg:h-screen overflow-hidden">
        
        {/* Decorative River-like background elements */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 800C100 700 300 900 500 800C700 700 900 900 1100 800" stroke="#4F46E5" strokeWidth="60" />
            <path d="M-100 700C100 600 300 800 500 700C700 600 900 800 1100 700" stroke="#4F46E5" strokeWidth="60" />
          </svg>
        </div>

        <div className="relative w-full max-w-[85vh] lg:max-w-[700px] xl:max-w-[900px] aspect-square flex items-center justify-center z-10">
          
          {/* Main wheel container */}
          <div className="relative w-full h-full p-4 md:p-8">
            
            {/* Pointer / Needle */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 drop-shadow-lg" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' }}>
              <div 
                className="w-8 h-12 md:w-10 md:h-14 bg-slate-900" 
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }}
              ></div>
            </div>

            {/* The actual svg wheel */}
            <motion.div
              className="w-full h-full rounded-full overflow-hidden shadow-2xl border-[10px] md:border-[16px] border-white bg-slate-100 relative"
              animate={{ rotate: rotation }}
              transition={{ duration: 5.5, ease: [0.1, 0.9, 0.2, 1] }} 
              // A nice smooth deceleration curve
            >
              <svg viewBox="-100 -100 200 200" className="w-full h-full">
                {renderWheel()}
              </svg>
            </motion.div>
            
            {/* Inner Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-inner z-20">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-slate-200 rounded-full"></div>
            </div>

          </div>
        </div>

      </main>

      {/* Winner Announcement (Overlay styling) */}
      <AnimatePresence>
        {winner && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-100 flex flex-col md:flex-row items-center gap-6 max-w-lg w-full relative overflow-hidden"
            >
              <div className="w-20 h-20 md:w-16 md:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl md:text-3xl font-bold shrink-0">
                ✓
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Geselecteerd</p>
                <h2 className="text-3xl md:text-2xl font-black text-slate-800 mb-4">{winner.name}</h2>
                <div className="flex flex-col md:flex-row gap-3">
                   <button
                    onClick={removeWinnerFromWheel}
                    className="flex-1 px-4 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-lg text-sm hover:bg-rose-100 transition-colors"
                  >
                    Verwijder deelnemer
                  </button>
                  <button
                    onClick={() => setWinner(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
