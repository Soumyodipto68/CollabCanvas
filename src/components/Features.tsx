import {
  Users,
  MousePointer2,
  Palette,
  Infinity,
} from "lucide-react";

const features = [
  {
    title: "Real-Time Collaboration",
    icon: Users,
    desc: "Work together instantly with teammates.",
  },
  {
    title: "Infinite Canvas",
    icon: Infinity,
    desc: "Never run out of drawing space.",
  },
  {
    title: "Drawing Tools",
    icon: Palette,
    desc: "Pen, shapes, colors, text and eraser.",
  },
  {
    title: "Live Cursor",
    icon: MousePointer2,
    desc: "See where everyone is working.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <h2 className="mb-16 text-center text-4xl font-bold">
        Features
      </h2>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-2 hover:border-cyan-500"
            >
              <Icon
                size={42}
                className="mb-5 text-cyan-400"
              />

              <h3 className="mb-3 text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="text-gray-400">
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;