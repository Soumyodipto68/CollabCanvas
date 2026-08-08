// client_side/src/pages/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/ui/Navbar";

interface Board {
  id: string;
  title: string;
  updatedAt: string;
  createdAt?: string;
  isFavorite?: boolean;
}

export const DashboardPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "favorites">("all");
  const [loading, setLoading] = useState(true);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch whiteboards from API on mount
  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/boards", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setBoards(data.boards || []);
      } else if (response.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to fetch whiteboards.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while loading boards.");
    } finally {
      setLoading(false);
    }
  };

  // Create new whiteboard
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newBoardTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        setBoards([data.board, ...boards]);
        setNewBoardTitle("");
        setIsModalOpen(false);
        // Direct route to canvas page
        navigate(`/board/${data.board.id}`);
      } else {
        setError("Failed to create whiteboard.");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating board.");
    }
  };

  // Delete whiteboard
  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents clicking card action
    if (!window.confirm("Are you sure you want to delete this board?")) return;

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        setBoards(boards.filter((board) => board.id !== boardId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter boards according to Search & Active Tab
  const filteredBoards = boards.filter((board) => {
    const matchesSearch = board.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "favorites") return matchesSearch && board.isFavorite;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex flex-1">
        {/* Dashboard Sidebar */}
        <aside className="w-64 bg-slate-900/60 border-r border-slate-800 p-6 hidden md:flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-3">
                Workspace
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    activeTab === "all"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>📋</span> All Boards
                </button>
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    activeTab === "recent"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>🕒</span> Recent
                </button>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    activeTab === "favorites"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>⭐</span> Favorites
                </button>
              </nav>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
            <p className="font-semibold text-slate-200">Total Boards</p>
            <p className="text-xl font-bold text-blue-400 mt-1">{boards.length}</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 max-w-7xl">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage your real-time collaborative canvas boards.
              </p>
            </div>

            {/* Actions: Search and Create */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition w-full sm:w-64"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition whitespace-nowrap"
              >
                + New Board
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Boards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-slate-900/60 border border-slate-800/80 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredBoards.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
              <span className="text-5xl block mb-3">🎨</span>
              <p className="text-slate-300 font-semibold text-lg">No whiteboards found</p>
              <p className="text-slate-500 text-xs mt-1">
                Create a new board to start drawing with your team!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBoards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="group relative bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition truncate">
                        {board.title}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteBoard(board.id, e)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition"
                        title="Delete Board"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Updated {new Date(board.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Thumbnail Placeholder Graphic */}
                  <div className="mt-6 aspect-video bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center text-slate-700 group-hover:border-slate-700 transition">
                    <span className="text-2xl opacity-40">✏️</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Board Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-1">Create Whiteboard</h3>
            <p className="text-xs text-slate-400 mb-6">
              Give your new real-time canvas room a title.
            </p>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Board Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sprint Architecture Design"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition"
                >
                  Create & Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};