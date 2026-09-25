// client_side/src/components/Features.tsx
import React from "react";

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

const featureList: FeatureCard[] = [
  {
    icon: "⚡",
    title: "Real-Time Sync",
    description: "Multi-user drawing with ultra-low latency powered by Socket.IO WebSockets.",
  },
  {
    icon: "🛠️",
    title: "Rich Drawing Tools",
    description: "Pencil, smooth eraser, geometric shapes, dynamic color pickers, and stroke sizes.",
  },
  {
    icon: "👥",
    title: "Live Cursors & Presence",
    description: "See your team members' active mouse positions on screen in real time.",
  },
  {
    icon: "💾",
    title: "Cloud Persistence",
    description: "Save your boards automatically to PostgreSQL database via Prisma ORM.",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="home-features px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="home-section__eyebrow text-xs font-semibold uppercase tracking-[0.2em]">Built for momentum</p>
          <h2 className="home-features__heading mt-4 text-3xl sm:text-4xl">
            Everything stays in one place.
          </h2>
          <p className="home-features__copy mt-4 text-base leading-relaxed">
            Simple tools for teams that need to think together without getting in the way.
          </p>
        </div>

        <div className="home-features__grid mt-12 grid grid-cols-1 divide-y border-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {featureList.map((feature, index) => (
            <div
              key={index}
              className="home-feature p-6 text-left sm:p-8"
            >
              <div className="home-feature__index mb-5 text-sm">0{index + 1}</div>
              <h3 className="home-feature__heading mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="home-feature__copy text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};