// client_side/src/components/Navbar.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();

  // Extract user fields safely regardless of backend payload structure
  const activeUser = (user as any)?.user || user;
  const displayName =
    activeUser?.name ||
    activeUser?.displayName ||
    activeUser?.email?.split("@")[0] ||
    "User";

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800 text-white">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition">
        <span className="text-2xl">🎨</span>
        <span>RealTime WhiteBoard</span>
      </Link>

      <div className="flex items-center gap-6">
        <a href="#features" className="text-slate-400 hover:text-white transition text-sm">
          Features
        </a>

        {/* Dashboard Link */}
        {activeUser && (
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition text-sm">
            Dashboard
          </Link>
        )}

        {/* User / Auth Action Controls */}
        {loading ? (
          <div className="h-9 w-20 bg-slate-800 animate-pulse rounded-lg" />
        ) : activeUser ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 font-medium">
              Hello, {displayName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm transition cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};