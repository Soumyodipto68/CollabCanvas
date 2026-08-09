import React, { useState } from "react";

interface BoardHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  activeCount: number;
  saveStatus: "saved" | "saving" | "unsaved" | "error";
  onBack: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  title,
  onTitleChange,
  activeCount,
  saveStatus,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

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

  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-slate-900/85 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-5 z-50 text-slate-50">
      {/* Left Section: Back Button & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-700 transition-colors cursor-pointer"
        >
          ← Dashboard
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

          {/* Save Status Badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${status.style}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* Right Section: Active Users Counter */}
      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-400 font-medium">
        <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block shadow-[0_0_8px_#10B981]" />
        <span className="text-slate-50 font-semibold">{activeCount}</span>
        {activeCount === 1 ? "User" : "Users"} Online
      </div>
    </header>
  );
};