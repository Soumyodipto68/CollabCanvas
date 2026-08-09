import React from "react";

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface BoardCardProps {
  board: Board;
  onSelect: (board: Board) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, onSelect, onDelete }) => {
  return (
    <div
      onClick={() => onSelect(board)}
      className="bg-slate-800 border border-slate-700 rounded-xl p-5 cursor-pointer shadow-lg shadow-black/30 flex flex-col justify-between h-35 transition-all duration-200 hover:border-slate-500 hover:-translate-y-1 group"
    >
      <div>
        <h3 className="m-0 text-lg font-semibold text-slate-50 mb-2 truncate">
          {board.title}
        </h3>
        <span className="text-xs text-slate-400">
          Updated {new Date(board.updatedAt).toLocaleDateString()}
        </span>
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