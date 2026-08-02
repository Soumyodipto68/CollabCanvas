import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#111827]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="text-2xl font-bold text-cyan-400">
          WhiteBoard
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="hover:text-cyan-400">
            Features
          </a>

          <Link
            to="/login"
            className="rounded-lg border border-cyan-500 px-4 py-2 transition hover:bg-cyan-500"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;