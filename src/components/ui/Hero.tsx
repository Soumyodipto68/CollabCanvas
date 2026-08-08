// client_side/src/components/Hero.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  const handleGetStarted = () => {
    // Navigate directly to dashboard or new whiteboard room
    navigate("/dashboard");
  };

  const handleWatchDemo = () => {
    setShowDemoModal(true);
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-24 px-6">
      {/* Background radial gradient overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/30 via-indigo-500/20 to-purple-600/0 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-6xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 mb-8 shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Socket v2.0 Live</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1]">
          Where Teams Visualise Ideas in{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Real-Time
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          An ultra-fast, infinite digital canvas built for remote teams. Draw, 
          diagram, and collaborate simultaneously with zero latency.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Create Free Board →
          </button>
          
          <button
            onClick={handleWatchDemo}
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
          >
            Watch 2-min Demo
          </button>
        </div>

        {/* User Presence Trust Bar */}
        <div className="mt-8 flex items-center gap-3 text-xs text-slate-400">
          <div className="flex -space-x-2">
            <span className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-950 bg-blue-500 text-white font-bold flex items-center justify-center text-[10px]">
              AK
            </span>
            <span className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-950 bg-purple-500 text-white font-bold flex items-center justify-center text-[10px]">
              JD
            </span>
            <span className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-950 bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
              SR
            </span>
          </div>
          <span>Joined by 10,000+ remote creators globally</span>
        </div>

        {/* Interactive Canvas Mockup */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-md relative group">
          
          {/* Mock Canvas Toolbar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl">
            <button className="p-2 text-blue-400 bg-slate-800 rounded-lg">✏️</button>
            <button className="p-2 text-slate-400 hover:text-white">🔲</button>
            <button className="p-2 text-slate-400 hover:text-white">⭕</button>
            <button className="p-2 text-slate-400 hover:text-white">🧹</button>
            <div className="h-4 w-px bg-slate-700 my-auto mx-1" />
            <div className="w-5 h-5 rounded-full bg-blue-500 border border-white cursor-pointer" />
            <div className="w-5 h-5 rounded-full bg-purple-500 border border-slate-700 cursor-pointer" />
          </div>

          {/* Simulated Active User Cursor 1 */}
          <div className="absolute top-28 left-1/4 z-20 flex items-center gap-1 pointer-events-none transition-all duration-700">
            <svg className="w-5 h-5 text-purple-400 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>
            <span className="bg-purple-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
              Sarah
            </span>
          </div>

          {/* Simulated Active User Cursor 2 */}
          <div className="absolute bottom-20 right-1/3 z-20 flex items-center gap-1 pointer-events-none">
            <svg className="w-5 h-5 text-emerald-400 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>
            <span className="bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
              Alex
            </span>
          </div>

          {/* Canvas Board Graphic */}
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-slate-950 border border-slate-800/80">
            <img
              src="/src/assets/hero.png"
              alt="Realtime Whiteboard UI"
              className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
            />
          </div>
        </div>

      </div>

      {/* Optional In-Component Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full relative">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">Product Demo</h3>
            <div className="aspect-video bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800">
              <p className="text-slate-400 text-sm">Demo Video Player Placeholder</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};