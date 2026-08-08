// client_side/src/components/Dashboard.tsx
import React, { useState } from "react";

interface Board {
  id: string;
  title: string;
  updatedAt: string;
}

interface DashboardProps {
  boards: Board[];
  onCreateBoard: (title: string) => void;
  onOpenBoard: (id: string) => void;
  onDeleteBoard: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  boards,
  onCreateBoard,
  onOpenBoard,
  onDeleteBoard,
}) => {
  const [newTitle, setNewTitle] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateBoard(newTitle);
    setNewTitle("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold">Your Whiteboards</h1>
            <p className="text-slate-400 text-sm mt-1">
              Create, edit, and share real-time collaboration boards.
            </p>
          </div>

          {/* Quick Create Form */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              placeholder="Board name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition"
            >
              + New Board
            </button>
          </form>
        </div>

        {/* Board Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {boards.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
              <p className="text-slate-400">No whiteboards found. Create one above to get started!</p>
            </div>
          ) : (
            boards.map((board) => (
              <div
                key={board.id}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
                      {board.title}
                    </h3>
                    <button
                      onClick={() => onDeleteBoard(board.id)}
                      className="text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Updated {new Date(board.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => onOpenBoard(board.id)}
                  className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition text-center"
                >
                  Open Canvas
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};