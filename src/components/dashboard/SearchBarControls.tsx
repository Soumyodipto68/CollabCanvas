import React from "react";

interface SearchBarControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenModal: () => void;
}

export const SearchBarControls: React.FC<SearchBarControlsProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenModal,
}) => {
  return (
    <div className="flex gap-3 mb-10">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search whiteboards by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-3 pr-4 pl-10 rounded-lg border border-slate-700 bg-slate-800 text-slate-50 text-sm outline-none box-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
        />
        {/* Search Icon SVG */}
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <button
        type="button"
        onClick={onOpenModal}
        className="px-6 py-3 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-blue-500 transition-colors"
      >
        + Create Board
      </button>
    </div>
  );
};