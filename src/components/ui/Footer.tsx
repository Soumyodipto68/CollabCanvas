// client_side/src/components/Footer.tsx
import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
            <span className="text-2xl">🎨</span>
            <span>RealTime WhiteBoard</span>
          </div>
          <p className="text-sm text-slate-400">
            Instant multi-user canvas collaboration anywhere, anytime.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#features" className="hover:text-white transition">
                Features
              </a>
            </li>
            <li>
              <a href="/dashboard" className="hover:text-white transition">
                Dashboard
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Tech Stack</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>React + Vite + TypeScript</li>
            <li>Node.js / Express</li>
            <li>Socket.IO & Prisma</li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} RealTime WhiteBoard. All rights reserved.
      </div>
    </footer>
  );
};