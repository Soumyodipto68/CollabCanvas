import React from "react";
import { Pin } from "lucide-react";

interface BoardCardData {
  id: string;
  title: string;
  details?: string | null;
  priority?: "low" | "medium" | "high" | string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}

interface BoardCardProps {
  board: BoardCardData;
  onSelect: (board: BoardCardData) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onTogglePin?: (e: React.MouseEvent, id: string) => void;
}

const priorityStyles: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  high: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
};

export const BoardCard: React.FC<BoardCardProps> = ({ board, onSelect, onDelete, onTogglePin }) => {
  const priority = (board.priority || "medium").toLowerCase();
  const summary = board.details?.trim();

  return (
    <div
      onClick={() => onSelect(board)}
      className="bg-slate-800 border border-slate-700 rounded-xl p-5 cursor-pointer shadow-lg shadow-black/30 flex flex-col justify-between h-40 transition-all duration-200 hover:border-slate-500 hover:-translate-y-1 group"
    >
      <div>
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="m-0 truncate text-lg font-semibold text-slate-50">{board.title}</h3>
          {onTogglePin && (
            <button
              type="button"
              aria-label={board.pinned ? `Unpin ${board.title}` : `Pin ${board.title}`}
              aria-pressed={board.pinned}
              onClick={(event) => onTogglePin(event, board.id)}
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${board.pinned ? "text-blue-400 hover:bg-blue-500/10" : "text-slate-500 hover:bg-slate-700 hover:text-slate-200"}`}
            >
              <Pin className="h-4 w-4" fill={board.pinned ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {summary ? (
          <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-300">{summary}</p>
        ) : (
          <p className="mb-3 text-xs text-slate-500">No details added yet.</p>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${priorityStyles[priority] || priorityStyles.medium}`}>
            {priority}
          </span>
          <span className="text-[11px] text-slate-400">
            Updated {new Date(board.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={(e) => onDelete(e, board.id)}
          className="bg-transparent border-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-medium cursor-pointer px-2 py-1 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};