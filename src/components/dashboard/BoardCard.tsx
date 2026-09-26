import React from "react";
import { ArrowUpRight, CalendarDays, LayoutDashboard, Pin, Trash2 } from "lucide-react";

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

export const BoardCard: React.FC<BoardCardProps> = ({ board, onSelect, onDelete, onTogglePin }) => {
  const priority = (board.priority || "medium").toLowerCase();
  const summary = board.details?.trim();
  const updatedDate = new Date(board.updatedAt);
  const formattedDate = Number.isNaN(updatedDate.getTime())
    ? "Date unavailable"
    : updatedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <article className="board-card">
      <div className="board-card__topline">
        <span className="board-card__type"><LayoutDashboard size={13} aria-hidden="true" /> WHITEBOARD</span>
        {onTogglePin && (
          <button
            type="button"
            aria-label={board.pinned ? `Unpin ${board.title}` : `Pin ${board.title}`}
            aria-pressed={board.pinned}
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin(event, board.id);
            }}
            className={`board-card__pin${board.pinned ? " is-pinned" : ""}`}
          >
            <Pin size={16} fill={board.pinned ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        )}
      </div>

      <button type="button" onClick={() => onSelect(board)} className="board-card__open">
        <span className="board-card__preview" aria-hidden="true">
          <span className="board-card__preview-note board-card__preview-note--one" />
          <span className="board-card__preview-note board-card__preview-note--two" />
          <span className="board-card__preview-note board-card__preview-note--three" />
          <span className="board-card__preview-arrow"><ArrowUpRight size={16} /></span>
        </span>
        <span className="board-card__content">
          <span className="board-card__title">{board.title}</span>
          <span className="board-card__summary">{summary || "No details added yet."}</span>
        </span>
      </button>

      <footer className="board-card__footer">
        <span className={`board-card__priority board-card__priority--${priority}`}>
          {priority}
        </span>
        <span className="board-card__updated">
          <CalendarDays size={13} aria-hidden="true" />
          {formattedDate}
        </span>
        <button
          type="button"
          aria-label={`Delete ${board.title}`}
          onClick={(event) => onDelete(event, board.id)}
          className="board-card__delete"
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </footer>
    </article>
  );
};