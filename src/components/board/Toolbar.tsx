import React from "react";

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  size: number;
  setSize: (size: number) => void;
  onClear: () => void;
  availableColors?: string[];
}

export const Toolbar: React.FC<ToolbarProps> = ({
  color,
  setColor,
  size,
  setSize,
  onClear,
  availableColors = [
    "#FFFFFF",
    "#38BDF8",
    "#4ADE80",
    "#F472B6",
    "#FB923C",
    "#C084FC",
    "#FACC15",
    "#F87171",
  ],
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 flex items-center gap-5 shadow-2xl z-50">
      {/* Color Palette */}
      <div className="flex items-center gap-2">
        {availableColors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
              color === c ? "scale-125 ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900" : ""
            }`}
          />
        ))}

        {/* Custom Native Color Picker */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-full"
        />
      </div>

      <div className="w-px h-6 bg-slate-700" />

      {/* Stroke Size Range Slider */}
      <div className="flex items-center gap-2.5">
        <span className="text-slate-400 text-xs">Size:</span>
        <input
          type="range"
          min="1"
          max="20"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-20 cursor-pointer accent-sky-400"
        />
      </div>

      <div className="w-px h-6 bg-slate-700" />

      {/* Clear Button */}
      <button
        onClick={onClear}
        className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors"
      >
        Clear Canvas
      </button>
    </div>
  );
};