import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, LayoutDashboard, Pin, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Features } from "../../components/ui/Features";
import { Footer } from "../../components/ui/Footer";
import { Hero } from "../../components/ui/Hero";
import { Navbar } from "../../components/ui/Navbar";
import { useAuth } from "../../context/AuthContext";

interface BoardSummary {
  id: string;
  title: string;
  details?: string | null;
  priority?: "low" | "medium" | "high";
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const formatUpdatedDate = (board: BoardSummary) => {
  const dateValue = board.updatedAt || board.createdAt;
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardsError, setBoardsError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (authLoading || !user) {
      setBoards([]);
      setBoardsLoading(false);
      setBoardsError(false);
      return;
    }

    const controller = new AbortController();
    setBoardsLoading(true);
    setBoardsError(false);

    fetch("http://localhost:4000/api/boards", {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load boards");
        return response.json();
      })
      .then((data: unknown) => {
        setBoards(Array.isArray(data) ? data : []);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setBoardsError(true);
        setBoards([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBoardsLoading(false);
      });

    return () => controller.abort();
  }, [authLoading, refreshKey, user]);

  if (authLoading) {
    return (
      <div className="home-shell min-h-screen">
        <Navbar minimal />
        <main className="mx-auto max-w-6xl px-6 py-16" aria-busy="true">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-800" />
          <div className="mt-8 h-28 animate-pulse rounded-lg border border-slate-800 bg-slate-900" />
          <p className="mt-4 text-sm text-slate-400">Loading your workspace...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="home-shell">
        <Navbar minimal />
        <Hero />
        <Features />
        <Footer />
      </div>
    );
  }

  const displayName = user.name || user.displayName || user.email.split("@")[0] || "there";
  const recentBoards = [...boards]
    .sort((first, second) => {
      const firstDate = new Date(first.updatedAt || first.createdAt || 0).getTime();
      const secondDate = new Date(second.updatedAt || second.createdAt || 0).getTime();
      return secondDate - firstDate;
    })
    .slice(0, 5);
  const pinnedCount = boards.filter((board) => board.pinned).length;
  const highPriorityCount = boards.filter((board) => board.priority === "high").length;

  return (
    <div className="home-shell min-h-screen">
      <Navbar minimal />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-12 sm:px-8 sm:pt-16">
        <section className="flex flex-col justify-between gap-6 border-b border-slate-800 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-400">
              Your workspace
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Welcome back, {displayName}
            </h1>
            <p className="mt-3 text-sm text-slate-400">Here’s what’s happening with your whiteboards.</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md bg-orange-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-orange-400 sm:self-auto"
          >
            <LayoutDashboard size={17} aria-hidden="true" />
            Open dashboard
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>

        <section className="grid grid-cols-1 divide-y divide-slate-800 border-b border-slate-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0" aria-label="Workspace summary">
          <div className="py-5 sm:pr-6">
            <p className="text-sm text-slate-400">Your boards</p>
            <p className="mt-1 text-3xl font-semibold text-white">{boardsLoading || boardsError ? "—" : boards.length}</p>
          </div>
          <div className="py-5 sm:px-6">
            <p className="text-sm text-slate-400">Pinned</p>
            <p className="mt-1 text-3xl font-semibold text-white">{boardsLoading || boardsError ? "—" : pinnedCount}</p>
          </div>
          <div className="py-5 sm:pl-6">
            <p className="text-sm text-slate-400">High priority</p>
            <p className="mt-1 text-3xl font-semibold text-white">{boardsLoading || boardsError ? "—" : highPriorityCount}</p>
          </div>
        </section>

        <section className="pt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Recently updated</h2>
              <p className="mt-1 text-sm text-slate-400">Your latest board activity</p>
            </div>
            <Link to="/dashboard" className="text-sm font-medium text-orange-400 transition hover:text-orange-300">
              All boards <span aria-hidden="true">→</span>
            </Link>
          </div>

          {boardsLoading ? (
            <p className="py-8 text-sm text-slate-400" role="status">Loading your boards...</p>
          ) : boardsError ? (
            <div className="flex flex-col items-start gap-3 border-y border-slate-800 py-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300" role="alert">Your boards couldn’t be loaded right now.</p>
              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
              >
                <RefreshCw size={15} aria-hidden="true" />
                Try again
              </button>
            </div>
          ) : recentBoards.length === 0 ? (
            <div className="border-y border-slate-800 py-8">
              <h3 className="text-base font-medium text-white">No boards yet</h3>
              <p className="mt-1 text-sm text-slate-400">Create your first whiteboard to start collecting ideas here.</p>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-400 transition hover:text-orange-300"
              >
                Go to your dashboard <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 border-y border-slate-800">
              {recentBoards.map((board) => (
                <Link
                  key={board.id}
                  to={`/board/${board.id}`}
                  state={{ board }}
                  className="group flex flex-col gap-3 py-4 transition sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-medium text-slate-100 transition group-hover:text-orange-300">
                        {board.title}
                      </h3>
                      {board.pinned && <Pin size={14} className="shrink-0 text-orange-400" aria-label="Pinned" />}
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-400">
                      {board.details?.trim() || "No description added"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-5 text-xs text-slate-400 sm:justify-end">
                    <span className="capitalize">{board.priority || "medium"} priority</span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} aria-hidden="true" />
                      {formatUpdatedDate(board)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;