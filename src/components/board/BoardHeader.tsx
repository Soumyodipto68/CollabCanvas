// client_side/src/components/board/BoardHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiUsers } from "react-icons/fi";

interface BoardHeaderProps {
  boardId?: string;
  activeUsers: number;
  onExport: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  boardId,
  activeUsers,
  onExport,
}) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-slate-300 hover:text-white cursor-pointer"
          title="Back to Dashboard"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-semibold tracking-wide">
            Board #{boardId?.slice(0, 8) || "Room"}
          </h1>
          <p className="text-xs text-slate-400">Real-time collaboration</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-full text-xs font-medium text-slate-300">
          <FiUsers className="text-blue-400" />
          <span>{activeUsers} Online</span>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition cursor-pointer"
        >
          <FiDownload size={14} />
          Export
        </button>
      </div>
    </header>
  );
};