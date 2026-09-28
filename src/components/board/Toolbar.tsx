import React from "react";
import {
  ArrowRight,
  Grid2X2,
  Hand,
  MousePointer2,
  Pencil,
  Shapes,
  Square,
  Trash2,
  Type,
} from "lucide-react";

type BoardTool = "draw" | "select" | "pan" | "shape" | "arrow" | "text";
type ShapeType = "rectangle" | "ellipse" | "diamond";
type ArrowType = "single" | "double" | "dashed";

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  size: number;
  setSize: (size: number) => void;
  showGrid: boolean;
  setShowGrid: (showGrid: boolean) => void;
  onClear: () => void;
  activeTool: BoardTool;
  setActiveTool: (tool: BoardTool) => void;
  shapeType: ShapeType;
  setShapeType: (shape: ShapeType) => void;
  arrowType: ArrowType;
  setArrowType: (arrow: ArrowType) => void;
  textSize: number;
  setTextSize: (size: number) => void;
  hasSelection: boolean;
  onDeleteSelected: () => void;
  availableColors?: string[];
}

export const Toolbar: React.FC<ToolbarProps> = ({
  color,
  setColor,
  size,
  setSize,
  showGrid,
  setShowGrid,
  onClear,
  activeTool,
  setActiveTool,
  shapeType,
  setShapeType,
  arrowType,
  setArrowType,
  textSize,
  setTextSize,
  hasSelection,
  onDeleteSelected,
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
  const tools = [
    { id: "draw", label: "Draw", icon: Pencil },
    { id: "select", label: "Select", icon: MousePointer2 },
    { id: "pan", label: "Pan", icon: Hand },
    { id: "shape", label: "Shape", icon: Shapes },
    { id: "arrow", label: "Arrow", icon: ArrowRight },
    { id: "text", label: "Text", icon: Type },
  ] as const;

  return (
    <div className="absolute left-4 top-1/2 z-50 flex max-h-[calc(100vh-6rem)] w-44 -translate-y-1/2 flex-col items-stretch gap-3 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800/95 p-3 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col gap-1" aria-label="Drawing tools">
        {tools.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTool(id)}
            aria-pressed={activeTool === id}
            className={`flex min-h-9 items-center gap-2 rounded-md px-2.5 text-left text-xs font-semibold transition-colors ${
              activeTool === id ? "bg-sky-500 text-slate-950" : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {activeTool === "shape" && (
        <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-300">
          Shape type
          <select
            value={shapeType}
            onChange={(event) => setShapeType(event.target.value as ShapeType)}
            className="w-full rounded-md border border-slate-600 bg-slate-900 px-2.5 py-2 text-xs text-slate-100 outline-none focus:border-sky-400"
          >
            <option value="rectangle">Rectangle</option>
            <option value="ellipse">Ellipse</option>
            <option value="diamond">Diamond</option>
          </select>
        </label>
      )}

      {activeTool === "arrow" && (
        <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-300">
          Arrow type
          <select
            value={arrowType}
            onChange={(event) => setArrowType(event.target.value as ArrowType)}
            className="w-full rounded-md border border-slate-600 bg-slate-900 px-2.5 py-2 text-xs text-slate-100 outline-none focus:border-sky-400"
          >
            <option value="single">Single arrow</option>
            <option value="double">Double arrow</option>
            <option value="dashed">Dashed arrow</option>
          </select>
        </label>
      )}

      {/* Color Palette */}
      <div className="grid grid-cols-4 justify-items-center gap-2">
        {availableColors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            type="button"
            aria-label={`Use ${c} drawing color`}
            aria-pressed={color === c}
            style={{ backgroundColor: c }}
            className={`h-5 w-5 rounded-full cursor-pointer transition-transform ${
              color === c ? "scale-110 ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900" : "hover:scale-110"
            }`}
          />
        ))}

        {/* Custom Native Color Picker */}
        <input
          aria-label="Choose a custom drawing color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-5 w-5 cursor-pointer rounded-full border-none bg-transparent p-0"
        />
      </div>

      <div className="h-px w-full bg-slate-700" />

      {/* Stroke or text size */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="toolbar-size" className="text-xs font-medium text-slate-300">
          {activeTool === "text" ? `Text size: ${textSize}px` : `Stroke size: ${size}`}
        </label>
        <input
          id="toolbar-size"
          type="range"
          min={activeTool === "text" ? 12 : 1}
          max={activeTool === "text" ? 72 : 20}
          step={activeTool === "text" ? 2 : 1}
          value={activeTool === "text" ? textSize : size}
          onChange={(event) => {
            const nextSize = Number(event.target.value);
            if (activeTool === "text") setTextSize(nextSize);
            else setSize(nextSize);
          }}
          className="w-full cursor-pointer accent-sky-400"
        />
      </div>

      {activeTool === "select" && hasSelection && (
        <button
          type="button"
          onClick={onDeleteSelected}
          className="flex min-h-9 items-center gap-2 rounded-md bg-red-500/15 px-2.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
        >
          <Trash2 size={15} aria-hidden="true" />
          Delete selection
        </button>
      )}

      <div className="h-px w-full bg-slate-700" />

      {/* Canvas Background */}
      <div className="flex flex-col rounded-lg border border-slate-700 bg-slate-900 p-1" aria-label="Canvas background">
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          aria-pressed={showGrid}
          className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
            showGrid ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          <Grid2X2 size={14} aria-hidden="true" />
          Grid
        </button>
        <button
          type="button"
          onClick={() => setShowGrid(false)}
          aria-pressed={!showGrid}
          className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
            !showGrid ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          <Square size={14} aria-hidden="true" />
          Blank
        </button>
      </div>

      <div className="h-px w-full bg-slate-700" />

      {/* Clear Button */}
      <button
        type="button"
        onClick={onClear}
        className="rounded-lg bg-red-500 px-2 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 cursor-pointer"
      >
        Clear canvas
      </button>
    </div>
  );
};