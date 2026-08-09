import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { BoardHeader } from "../../components/board/BoardHeader";
import { Toolbar } from "../../components/board/Toolbar";
import { UserCursors } from "../../components/board/UserCursors";

export interface StrokePoint {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: StrokePoint[];
  color: string;
  size: number;
}

interface UserCursor {
  id: string;
  name: string;
  x: number;
  y: number;
}

// Preset vibrant colors designed for dark backgrounds
export const DARK_THEME_COLORS = [
  "#FFFFFF", // Pure White
  "#38BDF8", // Neon Blue
  "#4ADE80", // Emerald Green
  "#F472B6", // Pink/Magenta
  "#FB923C", // Bright Orange
  "#C084FC", // Purple
  "#FACC15", // Bright Yellow
  "#F87171", // Soft Red
];

export const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract initial board passed from Dashboard navigation (if present)
  const initialBoard = location.state?.board;

  // Canvas & Socket Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Drawing State (Default to bright white stroke for dark background)
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FFFFFF");
  const [size, setSize] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStrokeRef = useRef<StrokePoint[]>([]);

  // Board Metadata & Persistence State
  const [boardTitle, setBoardTitle] = useState<string>(initialBoard?.title || "Untitled Board");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const isInitialLoad = useRef(true);

  // Real-time Collaboration State
  const [activeCount, setActiveCount] = useState<number>(1);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, UserCursor>>({});
  const [currentUser] = useState<{ id: string; name: string }>({
    id: `user-${Math.random().toString(36).substring(2, 9)}`,
    name: "User_" + Math.floor(Math.random() * 1000),
  });

  // ---------------------------------------------------------------------------
  // 1. Fetch Board Data from Server
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!boardId) return;

    const loadBoardData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.title) setBoardTitle(data.title);
          if (Array.isArray(data.data)) {
            setStrokes(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to load board data:", err);
      } finally {
        isInitialLoad.current = false;
      }
    };

    loadBoardData();
  }, [boardId]);

  // ---------------------------------------------------------------------------
  // 2. Debounced Auto-Save Canvas Data (PUT /api/boards/:id)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isInitialLoad.current) return;

    setSaveStatus("unsaved");

    const saveTimer = setTimeout(async () => {
      if (!boardId) return;

      setSaveStatus("saving");
      try {
        const res = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: boardTitle,
            data: strokes,
          }),
        });

        if (res.ok) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("error");
      }
    }, 1500);

    return () => clearTimeout(saveTimer);
  }, [strokes, boardTitle, boardId]);

  // ---------------------------------------------------------------------------
  // 3. Socket.IO Connections & Event Handlers
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!boardId) return;

    const socket: Socket = io("http://localhost:4000", {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-board", {
        boardId,
        userId: currentUser.id,
        name: currentUser.name,
      });
    });

    socket.on("room-users-count", (count: number) => {
      setActiveCount(count);
    });

    socket.on("draw-stroke", (incomingStroke: Stroke) => {
      setStrokes((prev) => [...prev, incomingStroke]);
    });

    socket.on("cursor-moved", (data: { userId: string; name: string; x: number; y: number }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.userId]: {
          id: data.userId,
          name: data.name,
          x: data.x,
          y: data.y,
        },
      }));
    });

    socket.on("board-cleared", () => {
      setStrokes([]);
    });

    socket.on("user-left", (userId: string) => {
      setRemoteCursors((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    });

    return () => {
      socket.emit("leave-board", { boardId, userId: currentUser.id });
      socket.disconnect();
    };
  }, [boardId]);

  // ---------------------------------------------------------------------------
  // 4. Canvas Render Loop & Responsive Resizing
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawCanvas();
    };

    const redrawCanvas = () => {
      // Dark Canvas Background
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid dots for dark context
      ctx.fillStyle = "#334155";
      const gridSpacing = 30;
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        for (let y = 0; y < canvas.height; y += gridSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw all saved strokes
      strokes.forEach((stroke) => {
        if (stroke.points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [strokes]);

  // ---------------------------------------------------------------------------
  // 5. Mouse Event Handlers
  // ---------------------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const point = { x: e.clientX, y: e.clientY };
    currentStrokeRef.current = [point];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = { x: e.clientX, y: e.clientY };

    if (socketRef.current && boardId) {
      socketRef.current.emit("mouse-move", {
        boardId,
        userId: currentUser.id,
        name: currentUser.name,
        x: point.x,
        y: point.y,
      });
    }

    if (!isDrawing) return;

    currentStrokeRef.current.push(point);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = currentStrokeRef.current;
    if (points.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current.length > 0) {
      const finishedStroke: Stroke = {
        id: Math.random().toString(36).substring(2, 9),
        points: currentStrokeRef.current,
        color,
        size,
      };

      setStrokes((prev) => [...prev, finishedStroke]);

      if (socketRef.current && boardId) {
        socketRef.current.emit("draw-stroke", {
          boardId,
          stroke: finishedStroke,
        });
      }
    }
    currentStrokeRef.current = [];
  };

  const handleClearBoard = () => {
    setStrokes([]);
    if (socketRef.current && boardId) {
      socketRef.current.emit("clear-board", { boardId });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
      {/* Header */}
      <BoardHeader
        title={boardTitle}
        onTitleChange={(newTitle) => setBoardTitle(newTitle)}
        activeCount={activeCount}
        saveStatus={saveStatus}
        onBack={() => navigate("/dashboard")}
      />

      {/* Toolbar with Dark Palette Presets */}
      <Toolbar
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        onClear={handleClearBoard}
        availableColors={DARK_THEME_COLORS}
      />

      {/* Remote Cursors */}
      <UserCursors cursors={Object.values(remoteCursors)} />

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          display: "block",
          cursor: "crosshair",
        }}
      />
    </div>
  );
};