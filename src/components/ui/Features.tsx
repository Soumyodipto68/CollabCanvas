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
    <section id="features" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Everything You Need for Remote Brainstorming
        </h2>
        <p className="mt-4 text-gray-600 text-lg">
          Designed for seamless vector performance and instant collaboration.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureList.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};