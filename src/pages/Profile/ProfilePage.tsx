import React from "react";
import { Mail, Settings, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "../../components/ui/Navbar";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { useAuth } from "../../context/AuthContext";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.name || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-900 text-slate-100">
      <Navbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-5 py-7 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <header className="mb-8">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-400">Account</p>
              <h1 className="text-3xl font-bold text-slate-50">Profile</h1>
              <p className="mt-2 text-sm text-slate-400">Your account information and collaborator identity.</p>
            </header>

            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
              <div className="flex flex-col items-center gap-5 border-b border-slate-800 px-5 py-8 sm:flex-row sm:px-8">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl font-bold text-blue-300 ring-8 ring-blue-500/5">
                  {initial}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-semibold text-slate-50">{displayName}</h2>
                  <p className="mt-1 text-sm text-slate-400">Whiteboard collaborator</p>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="mb-3 flex items-center gap-2 text-slate-500">
                    <UserRound className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-[0.14em]">Display name</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">{displayName}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="mb-3 flex items-center gap-2 text-slate-500">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-[0.14em]">Email address</span>
                  </div>
                  <p className="break-all text-sm font-medium text-slate-200">{user?.email || "Not available"}</p>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800 px-5 py-5 sm:px-8">
                <Link to="/settings" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500/60 hover:text-white">
                  <Settings className="h-4 w-4" />
                  Edit profile
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
