import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BrandMark } from "../common/BrandMark.tsx";

interface BoardHeaderProps {
  title: string;
  details?: string;
  priority?: "low" | "medium" | "high";
  onTitleChange: (newTitle: string) => void;
  activeCount: number;
  saveStatus: "saved" | "saving" | "unsaved" | "error";
  onBack: () => void;
  onShare?: (email: string) => Promise<void> | void;
  onEditBoard?: (payload: { details: string; priority?: "low" | "medium" | "high" }) => Promise<void> | void;
  canEditPriority?: boolean;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  title,
  details = "",
  priority = "medium",
  onTitleChange,
  activeCount,
  saveStatus,
  onBack,
  onShare,
  onEditBoard,
  canEditPriority = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempDetails, setTempDetails] = useState(details);
  const [tempPriority, setTempPriority] = useState<"low" | "medium" | "high">(priority);

  useEffect(() => {
    setTempDetails(details);
    setTempPriority(priority);
  }, [details, priority]);

  const handleTitleSubmit = () => {
    setIsEditing(false);
    if (tempTitle.trim() && tempTitle !== title) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
  };

  const getSaveStatusBadge = () => {
    switch (saveStatus) {
      case "saving":
        return { text: "Saving...", style: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
      case "unsaved":
        return { text: "Unsaved changes", style: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
      case "error":
        return { text: "Save failed", style: "text-red-400 bg-red-400/10 border-red-400/20" };
      case "saved":
      default:
        return { text: "Saved", style: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
    }
  };

  const status = getSaveStatusBadge();

  const priorityStyles: Record<string, string> = {
    low: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    high: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  };

  const handleShareSubmit = async () => {
    if (!onShare) return;

    const email = shareEmail.trim();
    if (!email) {
      toast.error("Enter a valid email address.");
      return;
    }

    try {
      await onShare(email);
      toast.success(`Board shared with ${email}`);
      setShareEmail("");
      setIsShareOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to share the board right now.");
    }
  };

  const handleEditSubmit = async () => {
    if (!onEditBoard) return;

    try {
      await onEditBoard({
        details: tempDetails.trim(),
        ...(canEditPriority ? { priority: tempPriority } : {}),
      });
      toast.success("Board information updated.");
      setIsEditOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update the board right now.");
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-slate-900/85 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-5 z-50 text-slate-50">
      {/* Left Section: Back Button & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 cursor-pointer"
        >
          <BrandMark className="h-5 w-5" />
          <span>← Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              autoFocus
              className="bg-slate-800 text-slate-50 border border-sky-400 rounded-md px-2 py-1 text-base font-semibold outline-none"
            />
          ) : (
            <h1
              onClick={() => setIsEditing(true)}
              title="Click to edit title"
              className="m-0 text-base font-semibold text-slate-50 cursor-pointer px-2 py-1 rounded-md hover:bg-slate-800 transition-colors"
            >
              {title}
            </h1>
          )}

          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${priorityStyles[priority] || priorityStyles.medium}`}
          >
            {priority}
          </span>

          {/* Save Status Badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${status.style}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* Right Section: Edit, Share + Active Users Counter */}
      <div className="flex items-center gap-3">
        {onEditBoard && (
          <div className="relative">
            <button
              onClick={() => {
                setIsEditOpen((prev) => !prev);
              }}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold cursor-pointer transition-all duration-200"
            >
              <span className="text-sm">✏️</span>
              <span>Edit</span>
            </button>

            {isEditOpen && (
              <div className="absolute right-0 top-12 z-60 w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-2xl">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Board Details
                </label>
                <textarea
                  rows={4}
                  value={tempDetails}
                  onChange={(e) => setTempDetails(e.target.value)}
                  placeholder="Add notes or goals for this board..."
                  className="min-h-32 w-full resize-y rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-50 outline-none focus:border-blue-500"
                />

                <label className="mb-2 mt-4 block text-sm font-semibold text-slate-200">
                  Priority
                </label>
                <select
                  value={tempPriority}
                  disabled={!canEditPriority}
                  onChange={(e) => setTempPriority(e.target.value as "low" | "medium" | "high")}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-50 outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditOpen(false)}
                    className="px-3 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {onShare && (
          <div className="relative">
            <button
              onClick={() => {
                setIsShareOpen((prev) => !prev);
              }}
              className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 rounded-xl px-3.5 py-2.5 text-xs font-bold cursor-pointer shadow-lg shadow-blue-500/20 transition-all duration-200"
            >
              <span className="text-sm">🔗</span>
              <span>Share</span>
            </button>

            {isShareOpen && (
              <div className="absolute right-0 top-12 z-60 w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-2xl">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Share with user email
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-50 outline-none focus:border-blue-500"
                />

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setIsShareOpen(false)}
                    className="px-3 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShareSubmit}
                    className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                  >
                    Share
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block shadow-[0_0_8px_#10B981]" />
          <span className="text-slate-50 font-semibold">{activeCount}</span>
          {activeCount === 1 ? "User" : "Users"} Online
        </div>
      </div>
    </header>
  );
};