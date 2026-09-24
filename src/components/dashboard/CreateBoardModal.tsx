import React from "react";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (title: string) => void;
  details: string;
  setDetails: (details: string) => void;
  priority: "low" | "medium" | "high";
  setPriority: (priority: "low" | "medium" | "high") => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreating: boolean;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  title,
  setTitle,
  details,
  setDetails,
  priority,
  setPriority,
  onSubmit,
  isCreating,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="m-0 text-xl font-semibold text-slate-50">
            Create New Board
          </h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-slate-400 text-xl cursor-pointer px-1 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-sm text-slate-400">
              Board Title
            </label>
            <input
              type="text"
              placeholder="e.g., Sprint Planning, Brainstorming..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-50 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 box-border transition-all"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-sm text-slate-400">
              Board Details
            </label>
            <textarea
              rows={3}
              placeholder="Add a quick summary, notes, or goals for this board..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-50 text-sm outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 box-border transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm text-slate-400">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-50 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 box-border transition-all"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-transparent text-slate-400 border border-slate-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2.5 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? "Creating..." : "Create Board"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};