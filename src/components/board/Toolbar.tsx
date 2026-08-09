// client_side/src/components/board/Toolbar.tsx
import React from "react";
import { FiEdit2, FiMinus, FiRotateCcw, FiTrash2 } from "react-icons/fi";

interface ToolbarProps {
  tool: "pencil" | "eraser";
  setTool: (tool: "pencil" | "eraser") => void;
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#a855f7", "#ffffff"];

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  lineWidth,
  setLineWidth,
  canUndo,
  onUndo,
  onClear,
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl px-5 py-3 flex items-center gap-6 shadow-2xl z-20">
      {/* Tool Switcher */}
      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setTool("pencil")}
          className={`p-2.5 rounded-lg text-sm transition ${
            tool === "pencil"
              ? "bg-blue-600 text-white font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
          title="Pencil"
        >
          <FiEdit2 size={16} />
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`p-2.5 rounded-lg text-sm transition ${
            tool === "eraser"
              ? "bg-blue-600 text-white font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
          title="Eraser"
        >
          <FiMinus size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-800" />

      {/* Color Palette */}
      {tool === "pencil" && (
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full transition transform hover:scale-110 ${
                color === c ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110" : ""
              }`}
            />
          ))}
        </div>
      )}

      <div className="w-px h-6 bg-slate-800" />

      {/* Stroke Width Slider */}
      <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
        <span>Size</span>
        <input
          type="range"
          min="2"
          max="24"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-20 accent-blue-500 cursor-pointer"
        />
      </div>

      <div className="w-px h-6 bg-slate-800" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition text-slate-300 hover:text-white cursor-pointer"
          title="Undo stroke"
        >
          <FiRotateCcw size={16} />
        </button>
        <button
          onClick={onClear}
          className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
          title="Clear Canvas for all"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};