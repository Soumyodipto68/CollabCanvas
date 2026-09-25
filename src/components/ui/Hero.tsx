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
    <section className="home-hero px-6 pb-20 pt-20 sm:pb-28">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <p className="home-hero__eyebrow mb-6 text-xs font-semibold uppercase tracking-[0.2em]">A shared space for clear thinking</p>
        <h1 className="home-hero__title max-w-3xl">
          Ideas, together.
        </h1>
        <p className="home-hero__body mt-6 max-w-xl leading-relaxed">
          A calm, real-time whiteboard for teams to sketch, plan, and move forward.
        </p>
        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={handleGetStarted}
            className="home-hero__primary w-full px-6 py-3 sm:w-auto"
          >
            Create a board
          </button>
          <button
            onClick={handleWatchDemo}
            className="home-hero__secondary w-full px-6 py-3 sm:w-auto"
          >
            See how it works
          </button>
        </div>
        <div className="home-hero__preview mt-16 w-full max-w-5xl rounded-lg border p-2">
          <div className="home-hero__preview-bar mb-2 flex items-center gap-1 border-b px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-200" />
            <span className="h-2 w-2 rounded-full bg-slate-100" />
            <span className="ml-3 text-xs text-slate-400">Team canvas</span>
          </div>
          <div className="home-hero__preview-canvas aspect-video overflow-hidden rounded-lg border">
            <img
              src="/src/assets/hero.png"
              alt="Realtime Whiteboard UI"
              className="h-full w-full object-cover opacity-90"
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