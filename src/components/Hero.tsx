import hero from "../assets/hero.png";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center gap-14 px-6 lg:flex-row">
      <div className="flex-1">
        <h1 className="text-5xl font-bold leading-tight md:text-7xl">
          Collaborate
          <br />
          Draw
          <br />
          Create
        </h1>

        <p className="mt-6 max-w-xl text-lg text-gray-400">
          A real-time collaborative whiteboard inspired by Excalidraw.
          Draw together, brainstorm ideas, and work with your team from
          anywhere.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            to="/login"
            className="rounded-xl bg-cyan-500 px-7 py-3 font-semibold transition hover:bg-cyan-600"
          >
            Get Started
          </Link>

          <a
            href="#features"
            className="rounded-xl border border-gray-700 px-7 py-3 hover:border-cyan-500"
          >
            Learn More
          </a>
        </div>
      </div>

      <div className="flex flex-1 justify-center">
        <img
          src={hero}
          alt="Whiteboard"
          className="w-full max-w-xl"
        />
      </div>
    </section>
  );
};

export default Hero;