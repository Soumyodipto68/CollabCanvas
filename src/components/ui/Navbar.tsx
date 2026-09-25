// client_side/src/components/Navbar.tsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  minimal?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ minimal = false }) => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    <nav className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 sm:px-8 ${minimal ? "home-nav" : "bg-slate-900/90 text-white shadow-lg backdrop-blur-md border-b border-slate-800/80"}`}>
      <Link to="/" className="flex items-center gap-3 group">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${minimal ? "home-nav__mark" : "bg-linear-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20"} transition-transform group-hover:scale-105`}>
          <span className="text-lg">✦</span>
        </div>
        <span className={`text-xl font-bold tracking-tight ${minimal ? "home-nav__brand" : "text-white"}`}>
          Collab Canvas
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {activeUser && location.pathname !== "/dashboard" && (
          <Link
            to="/dashboard"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${minimal ? "home-nav__dashboard" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}
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
          <div className={`flex items-center gap-4 border-l pl-2 ${minimal ? "home-nav__account" : "border-slate-800"}`}>
            <Link
              to="/profile"
              aria-label={`Open profile for ${displayName}`}
              className={`flex items-center gap-3 rounded-lg p-1 transition ${minimal ? "home-nav__profile" : "hover:bg-slate-800/60"}`}
            >
              {rawProfilePic && !imgError ? (
                <img
                  src={rawProfilePic}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className={`h-9 w-9 rounded-full object-cover ${minimal ? "home-nav__avatar" : "ring-2 ring-blue-500/30 bg-slate-800"}`}
                />
              ) : (
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${minimal ? "home-nav__avatar" : "border border-blue-500/30 bg-blue-600/20 text-blue-400 ring-2 ring-blue-500/20"}`}>
                  {userInitial}
                </div>
              )}
              <span className={`hidden text-sm font-medium sm:inline ${minimal ? "home-nav__profile" : "text-slate-200"}`}>
                {displayName}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className={`cursor-pointer px-4 py-2 text-sm font-semibold transition ${minimal ? "home-nav__action" : "rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-300 shadow-sm hover:bg-slate-800 hover:text-white"}`}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className={`cursor-pointer px-5 py-2 text-sm font-semibold transition ${minimal ? "home-nav__sign-in" : "rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 active:scale-95"}`}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};