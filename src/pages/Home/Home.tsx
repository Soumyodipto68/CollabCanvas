import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, LayoutDashboard, Pin, RefreshCw } from "lucide-react";
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
  ownerName?: string | null;
  owner?: { name?: string | null; email?: string | null };
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
  const [sharedBoards, setSharedBoards] = useState<BoardSummary[]>([]);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (authLoading || !user) {
      setBoards([]);
      setBoardsLoading(false);
      setBoardsError(false);
      setSharedBoards([]);
      setSharedLoading(false);
      setSharedError(false);
      return;
    }

    const controller = new AbortController();
    setBoardsLoading(true);
    setBoardsError(false);
    setSharedLoading(true);
    setSharedError(false);

    const loadBoards = async (endpoint: string, onSuccess: (data: BoardSummary[]) => void, onError: () => void) => {
      try {
        const response = await fetch(`http://localhost:4000/api/boards${endpoint}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load boards");
        const data: unknown = await response.json();
        onSuccess(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        onError();
      }
    };

    void Promise.all([
      loadBoards("", setBoards, () => {
        setBoardsError(true);
        setBoards([]);
      }).finally(() => {
        if (!controller.signal.aborted) setBoardsLoading(false);
      }),
      loadBoards("/shared", setSharedBoards, () => {
        setSharedError(true);
        setSharedBoards([]);
      }).finally(() => {
        if (!controller.signal.aborted) setSharedLoading(false);
      }),
    ]);

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
  const sharedRecentBoards = [...sharedBoards]
    .sort((first, second) => {
      const firstDate = new Date(first.updatedAt || first.createdAt || 0).getTime();
      const secondDate = new Date(second.updatedAt || second.createdAt || 0).getTime();
      return secondDate - firstDate;
    })
    .slice(0, 4);
  const recentBoards = [...boards]
    .sort((first, second) => {
      const firstDate = new Date(first.updatedAt || first.createdAt || 0).getTime();
      const secondDate = new Date(second.updatedAt || second.createdAt || 0).getTime();
      return secondDate - firstDate;
    })
    .slice(0, 5);
  const pinnedCount = boards.filter((board) => board.pinned).length;
  const highPriorityCount = boards.filter((board) => board.priority === "high").length;
  const featuredBoard = recentBoards[0];
  const otherRecentBoards = recentBoards.slice(1);

  return (
    <div className="home-shell home-member min-h-screen">
      <Navbar minimal />
      <main className="home-member__main">
        <section className="home-member__welcome">
          <div>
            <p className="home-member__eyebrow">COLLAB CANVAS / YOUR SPACE</p>
            <h1>Good to see you,<br /><span>{displayName}</span></h1>
            <p className="home-member__welcome-copy">Pick up where your team left off.</p>
          </div>
          <Link to="/dashboard" className="home-member__dashboard-link">
            <LayoutDashboard size={17} aria-hidden="true" />
            Browse all boards
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>

        <section className="home-member__stats" aria-label="Workspace summary">
          <div className="home-member__stat">
            <span>Boards</span>
            <strong>{boardsLoading || boardsError ? "—" : boards.length}</strong>
          </div>
          <div className="home-member__stat">
            <span>Pinned</span>
            <strong>{boardsLoading || boardsError ? "—" : pinnedCount}</strong>
          </div>
          <div className="home-member__stat">
            <span>High priority</span>
            <strong>{boardsLoading || boardsError ? "—" : highPriorityCount}</strong>
          </div>
          <div className="home-member__stat">
            <span>Shared with you</span>
            <strong>{sharedLoading || sharedError ? "—" : sharedBoards.length}</strong>
          </div>
          <div className="home-member__stats-note">
            <span className="home-member__live-dot" />
            <span>{boardsLoading ? "Syncing workspace" : "Workspace overview"}</span>
          </div>
        </section>

        <section className="home-member__boards">
          <header className="home-member__section-heading">
            <div>
              <p className="home-member__eyebrow">RECENT WORK</p>
              <h2>Back to your ideas</h2>
            </div>
            <Link to="/dashboard" className="home-member__all-link">
              View all <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </header>

          {boardsLoading ? (
            <div className="home-member__state" role="status">Loading your boards...</div>
          ) : boardsError ? (
            <div className="home-member__state home-member__state--error" role="alert">
              <span>Your boards couldn’t be loaded right now.</span>
              <button type="button" onClick={() => setRefreshKey((key) => key + 1)}>
                <RefreshCw size={15} aria-hidden="true" /> Try again
              </button>
            </div>
          ) : !featuredBoard ? (
            <div className="home-member__empty">
              <div className="home-member__empty-mark"><LayoutDashboard size={22} aria-hidden="true" /></div>
              <div>
                <h3>Your first canvas is waiting</h3>
                <p>Create a board to start gathering ideas in one place.</p>
              </div>
              <button type="button" onClick={() => navigate("/dashboard")}>
                Go to dashboard <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="home-member__board-layout">
              <Link
                to={`/board/${featuredBoard.id}`}
                state={{ board: featuredBoard }}
                className="home-member__featured-board"
              >
                <div className="home-member__canvas-preview" aria-hidden="true">
                  <span className="home-member__canvas-label">LATEST CANVAS</span>
                  <span className="home-member__canvas-stroke home-member__canvas-stroke--one" />
                  <span className="home-member__canvas-stroke home-member__canvas-stroke--two" />
                  <span className="home-member__canvas-stroke home-member__canvas-stroke--three" />
                  <span className="home-member__canvas-corner">OPEN BOARD <ArrowUpRight size={14} /></span>
                </div>
                <div className="home-member__featured-info">
                  <div className="home-member__featured-heading">
                    <div>
                      <p className="home-member__eyebrow">MOST RECENT</p>
                      <h3>{featuredBoard.title}</h3>
                    </div>
                    {featuredBoard.pinned && <Pin size={17} aria-label="Pinned" />}
                  </div>
                  <p className="home-member__featured-details">
                    {featuredBoard.details?.trim() || "No description added"}
                  </p>
                  <div className="home-member__board-meta">
                    <span className={`home-member__priority home-member__priority--${featuredBoard.priority || "medium"}`}>
                      {featuredBoard.priority || "medium"} priority
                    </span>
                    <span className="home-member__board-author">By {displayName}</span>
                    <span><CalendarDays size={14} aria-hidden="true" /> Updated {formatUpdatedDate(featuredBoard)}</span>
                  </div>
                </div>
              </Link>

              <div className="home-member__recent-list">
                <div className="home-member__recent-title">
                  <span>RECENTLY UPDATED</span>
                  <span>{otherRecentBoards.length.toString().padStart(2, "0")}</span>
                </div>
                {otherRecentBoards.length > 0 ? otherRecentBoards.map((board, index) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    state={{ board }}
                    className="home-member__recent-item"
                  >
                    <span className="home-member__recent-index">0{index + 2}</span>
                    <span className="home-member__recent-copy">
                      <strong>{board.title}</strong>
                      <small>By {displayName} · {formatUpdatedDate(board)}{board.pinned ? " · Pinned" : ""}</small>
                    </span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                )) : (
                  <p className="home-member__recent-empty">More boards will appear here as you work.</p>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="home-member__boards home-member__shared">
          <header className="home-member__section-heading">
            <div>
              <p className="home-member__eyebrow">TEAM CANVASES</p>
              <h2>Shared with you</h2>
            </div>
            <Link to="/shared" className="home-member__all-link">
              All shared boards <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </header>

          {sharedLoading ? (
            <div className="home-member__state" role="status">Loading shared boards...</div>
          ) : sharedError ? (
            <div className="home-member__state home-member__state--error" role="alert">
              <span>Shared boards couldn’t be loaded right now.</span>
              <button type="button" onClick={() => setRefreshKey((key) => key + 1)}>
                <RefreshCw size={15} aria-hidden="true" /> Try again
              </button>
            </div>
          ) : sharedRecentBoards.length === 0 ? (
            <div className="home-member__state home-member__shared-empty">
              No boards have been shared with you yet.
            </div>
          ) : (
            <div className="home-member__shared-list">
              {sharedRecentBoards.map((board) => (
                <Link
                  key={board.id}
                  to={`/board/${board.id}`}
                  state={{ board }}
                  className="home-member__shared-item"
                >
                  <span className="home-member__shared-icon"><LayoutDashboard size={17} aria-hidden="true" /></span>
                  <span className="home-member__shared-copy">
                    <strong>{board.title}</strong>
                    <small>{board.details?.trim() || "No description added"}</small>
                  </span>
                  <span className="home-member__shared-author">
                    <small>AUTHOR</small>
                    <strong>{board.ownerName || board.owner?.name || board.owner?.email || "Board owner"}</strong>
                  </span>
                  <span className={`home-member__priority home-member__priority--${board.priority || "medium"}`}>
                    {board.priority || "medium"}
                  </span>
                  <span className="home-member__shared-date">{formatUpdatedDate(board)}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
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