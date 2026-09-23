import React, { useEffect, useState } from "react";
import { Bell, Check, ChevronRight, Monitor, Moon, Palette, Shield, UserRound } from "lucide-react";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { Navbar } from "../../components/ui/Navbar";
import { useAuth } from "../../context/AuthContext";

type Preferences = {
  emailUpdates: boolean;
  cursorNames: boolean;
  gridVisible: boolean;
};

const defaultPreferences: Preferences = {
  emailUpdates: true,
  cursorNames: true,
  gridVisible: true,
};

const preferenceKey = "collab-canvas-preferences";
export const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || "");
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.name || "");
    }
  }, [user]);

  useEffect(() => {
    const stored = window.localStorage.getItem(preferenceKey);
    if (stored) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      } catch {
        window.localStorage.removeItem(preferenceKey);
      }
    }
  }, []);

  const savePreferences = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: displayName.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save profile");
      }

      setUser(data.user);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save profile");
      setSaved(false);
      setSaving(false);
      return;
    }

    window.localStorage.setItem(preferenceKey, JSON.stringify(preferences));
    setSaved(true);
    setSaving(false);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const togglePreference = (key: keyof Preferences) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
    setSaved(false);
  };

  const name = displayName || user?.email?.split("@")[0] || "Guest User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-900 text-slate-100">
      <Navbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-5 py-7 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <header className="mb-8">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-400">Workspace</p>
              <h1 className="text-3xl font-bold text-slate-50">Settings</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Tune your Collab Canvas experience and keep your workspace comfortable.</p>
            </header>

            <section className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
                <UserRound className="h-5 w-5 text-blue-400" />
                <div>
                  <h2 className="font-semibold text-slate-100">Profile</h2>
                  <p className="text-xs text-slate-500">How you appear to collaborators</p>
                </div>
              </div>
              <div className="grid gap-6 p-5 md:grid-cols-[auto_1fr] md:items-start">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl font-bold text-blue-300">{initial}</div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Display name</span>
                    <input value={displayName} onChange={(event) => { setDisplayName(event.target.value); setSaved(false); }} placeholder="Your name" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500" />
                  </label>
                  <div>
                    <span className="mb-2 block text-sm font-medium text-slate-300">Email address</span>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-500">{user?.email || "Not available"}</div>
                  </div>
                  <div>
                    <span className="mb-2 block text-sm font-medium text-slate-300">Account security</span>
                    <button type="button" className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-left text-sm text-slate-300 transition hover:border-slate-700 hover:text-white">Manage sign-in <ChevronRight className="h-4 w-4 text-slate-500" /></button>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
                <Palette className="h-5 w-5 text-blue-400" />
                <div>
                  <h2 className="font-semibold text-slate-100">Workspace preferences</h2>
                  <p className="text-xs text-slate-500">Choose what stays visible while you work</p>
                </div>
              </div>
              <div className="divide-y divide-slate-800">
                <PreferenceRow icon={<Monitor className="h-4 w-4" />} title="Canvas grid" description="Show the alignment grid on your boards" enabled={preferences.gridVisible} onToggle={() => togglePreference("gridVisible")} />
                <PreferenceRow icon={<UserRound className="h-4 w-4" />} title="Collaborator names" description="Show names beside live cursors" enabled={preferences.cursorNames} onToggle={() => togglePreference("cursorNames")} />
                <PreferenceRow icon={<Bell className="h-4 w-4" />} title="Email updates" description="Receive occasional workspace activity updates" enabled={preferences.emailUpdates} onToggle={() => togglePreference("emailUpdates")} />
              </div>
            </section>

            <section className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <h2 className="font-semibold text-slate-100">Your data stays yours</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">Workspace preferences are saved on this device. Your display name is saved to your account.</p>
              </div>
            </section>

            <div className="flex items-center justify-end gap-3 pb-8">
              {error && <span className="text-sm text-red-400">{error}</span>}
              {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-400"><Check className="h-4 w-4" /> Saved</span>}
              <button type="button" onClick={savePreferences} disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface PreferenceRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const PreferenceRow: React.FC<PreferenceRowProps> = ({ icon, title, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4">
    <div className="flex items-center gap-3">
      <div className="text-slate-500">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-slate-200">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
    <button type="button" aria-label={`Toggle ${title}`} aria-pressed={enabled} onClick={onToggle} className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-blue-600" : "bg-slate-700"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`} />
    </button>
  </div>
);
