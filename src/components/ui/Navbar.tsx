// client_side/src/components/Navbar.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const activeUser = (user as any)?.user || user;
  const displayName =
    activeUser?.name ||
    activeUser?.displayName ||
    activeUser?.email?.split("@")[0] ||
    "User";

  const userInitial = displayName.charAt(0).toUpperCase();

  const rawProfilePic =
    activeUser?.avatar ||
    activeUser?.photoURL ||
    activeUser?.image;

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
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
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 text-white shadow-lg">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
          <span className="text-4xl">🎨</span>
        </div>
        <span className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Collab Canvas
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {activeUser && (
          <Link
            to="/dashboard"
            className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
          >
            Dashboard
          </Link>
        )}

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 bg-slate-800 animate-pulse rounded-lg" />
            <div className="h-9 w-9 rounded-full bg-slate-800 animate-pulse" />
          </div>
        ) : activeUser ? (
          <div className="flex items-center gap-4 pl-2 border-l border-slate-800">
            <Link
              to="/profile"
              aria-label={`Open profile for ${displayName}`}
              className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-slate-800/60"
            >
              {rawProfilePic && !imgError ? (
                <img
                  src={rawProfilePic}
                  alt={displayName}
                  onError={() => setImgError(true)}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 bg-slate-800"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0 ring-2 ring-blue-500/20">
                  {userInitial}
                </div>
              )}
              <span className="text-sm font-medium text-slate-200 hidden sm:inline">
                {displayName}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition shadow-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-lg shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};