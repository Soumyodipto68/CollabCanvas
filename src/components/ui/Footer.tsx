// client_side/src/components/Footer.tsx
import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="home-footer px-6 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <div className="home-footer__brand mb-4 flex items-center gap-2 text-xl font-bold">
            <span className="text-lg">✦</span>
            <span>RealTime WhiteBoard</span>
          </div>
          <p className="text-sm">
            Instant multi-user canvas collaboration anywhere, anytime.
          </p>
        </div>

        <div>
          <h4 className="home-footer__heading mb-4 font-semibold">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#features" className="home-footer__link transition">
                Features
              </a>
            </li>
            <li>
              <a href="/dashboard" className="home-footer__link transition">
                Dashboard
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="home-footer__heading mb-4 font-semibold">Tech Stack</h4>
          <ul className="space-y-2 text-sm">
            <li>React + Vite + TypeScript</li>
            <li>Node.js / Express</li>
            <li>Socket.IO & Prisma</li>
          </ul>
        </div>
      </div>

      <div className="home-footer__legal mx-auto mt-12 max-w-6xl border-t pt-6 text-center text-xs">
        &copy; {new Date().getFullYear()} RealTime WhiteBoard. All rights reserved.
      </div>
    </footer>
  );
};