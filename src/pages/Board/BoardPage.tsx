import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { BoardHeader } from "../../components/board/BoardHeader";
import { Toolbar } from "../../components/board/Toolbar";
import { UserCursors } from "../../components/board/UserCursors";
import { DARK_THEME_COLORS } from "../../constants/boardColors";

export interface StrokePoint {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: StrokePoint[];
  color: string;
  size: number;
  userId?: string;
}

interface UserCursor {
  id: string;
  name: string;
  x: number;
  y: number;
}

interface RemoteCursorPayload {
  userId: string;
  name: string;
  x: number;
  y: number;
}

export const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const initialBoard = location.state?.board;

  // Canvas & Socket Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FFFFFF");
  const [size, setSize] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStrokeRef = useRef<StrokePoint[]>([]);

  // Infinite Canvas Viewport State (Pan & Zoom)
  const [activeTool, setActiveTool] = useState<"draw" | "pan">("draw");
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Board Metadata & Persistence Refs
  const [boardTitle, setBoardTitle] = useState<string>(initialBoard?.title || "Untitled Board");
  const [boardDetails, setBoardDetails] = useState<string>(initialBoard?.details || "");
  const [boardPriority, setBoardPriority] = useState<"low" | "medium" | "high">(
    initialBoard?.priority || "medium"
  );
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  
  // Critical persistence guards
  const isLoadedRef = useRef(false);
  const strokesRef = useRef<Stroke[]>([]);
  const titleRef = useRef<string>(boardTitle);

  // Keep state refs updated for unload/unmount saving
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    titleRef.current = boardTitle;
  }, [boardTitle]);

  // Collaboration State
  const [activeCount, setActiveCount] = useState<number>(1);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, UserCursor>>({});
  const [currentUser] = useState<{ id: string; name: string }>(() => ({
    id: `user-${Math.random().toString(36).substring(2, 9)}`,
    name: "User_" + Math.floor(Math.random() * 1000),
  }));

  // Convert Screen Coordinates -> Infinite World Coordinates
  const getWorldCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };
  };

  // Convert Infinite World Coordinates -> Screen Coordinates
  const getScreenCoordinates = (worldX: number, worldY: number) => {
    return {
      x: worldX * zoom + pan.x,
      y: worldY * zoom + pan.y,
    };
  };

  // Direct persistence trigger (bypasses debouncer)
  const saveToServer = useCallback(
    async (dataToSave: Stroke[], titleToSave: string) => {
      if (!boardId || !isLoadedRef.current) return;

      setSaveStatus("saving");
      
      // Save locally first
      localStorage.setItem(
        `board_${boardId}`,
        JSON.stringify({
          title: titleToSave,
          details: boardDetails,
          priority: boardPriority,
          strokes: dataToSave,
        })
      );

      try {
        const res = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: titleToSave,
            details: boardDetails,
            priority: boardPriority,
            elements: dataToSave,
          }),
        });

        if (res.ok) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.warn("Server save failed. Changes stored in LocalStorage.", err);
        setSaveStatus("saved"); // Fall back silently to local storage success
      }
    },
    [boardId, boardDetails, boardPriority]
  );

  // ---------------------------------------------------------------------------
  // 1. Initial Load (Hydrate state before enabling autosave)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!boardId) return;

    let isMounted = true;

    const loadBoardData = async () => {
      let loadedStrokes: Stroke[] = [];
      let loadedTitle = "Untitled Board";
      let loadedDetails = "";
      let loadedPriority: "low" | "medium" | "high" = "medium";

      try {
        const res = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.title) loadedTitle = data.title;
          if (typeof data.details === "string") loadedDetails = data.details;
          if (data.priority === "low" || data.priority === "medium" || data.priority === "high") {
            loadedPriority = data.priority;
          }
          if (Array.isArray(data.elements)) {
            loadedStrokes = data.elements;
          } else if (Array.isArray(data.data)) {
            loadedStrokes = data.data;
          }
        } else {
          throw new Error("Server response not ok");
        }
      } catch (err) {
        console.warn("Server fetch failed, loading local backup...", err);
        const localData = localStorage.getItem(`board_${boardId}`);
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed.strokes)) loadedStrokes = parsed.strokes;
            if (Array.isArray(parsed.elements)) loadedStrokes = parsed.elements;
            if (Array.isArray(parsed.data)) loadedStrokes = parsed.data;
            if (parsed.title) loadedTitle = parsed.title;
            if (typeof parsed.details === "string") loadedDetails = parsed.details;
            if (parsed.priority === "low" || parsed.priority === "medium" || parsed.priority === "high") {
              loadedPriority = parsed.priority;
            }
          } catch (e) {
            console.error("Local storage parse error:", e);
          }
        }
      }

      if (isMounted) {
        setBoardTitle(loadedTitle);
        setBoardDetails(loadedDetails);
        setBoardPriority(loadedPriority);
        setStrokes(loadedStrokes);
        strokesRef.current = loadedStrokes;
        titleRef.current = loadedTitle;
        isLoadedRef.current = true; // Mark board as safe to auto-save
        setSaveStatus("saved");
      }
    };

    loadBoardData();

    return () => {
      isMounted = false;
    };
  }, [boardId]);

  // ---------------------------------------------------------------------------
  // 2. Debounced Auto-Save & Unmount Save Guard
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoadedRef.current || !boardId) return;

    setSaveStatus("unsaved");

    const timer = setTimeout(() => {
      saveToServer(strokes, boardTitle);
    }, 1000);

    return () => clearTimeout(timer);
  }, [strokes, boardTitle, boardId, saveToServer]);

  // Save state on tab close / reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoadedRef.current && boardId) {
        localStorage.setItem(
          `board_${boardId}`,
          JSON.stringify({
            title: titleRef.current,
            details: boardDetails,
            priority: boardPriority,
            strokes: strokesRef.current,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [boardId]);

  // ---------------------------------------------------------------------------
  // 3. Socket.IO Connections
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!boardId) return;

    const socket: Socket = io("http://localhost:4000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-board", {
        boardId,
        userId: currentUser.id,
        name: currentUser.name,
      });
    });

    socket.on("room-users-count", (count: number) => setActiveCount(count));

    socket.on("draw-stroke", (incomingStroke: Stroke) => {
      // Ignore self-sent strokes
      if (incomingStroke.userId === currentUser.id) return;
      setStrokes((prev) => [...prev, incomingStroke]);
    });

    socket.on("cursor-moved", (data: RemoteCursorPayload) => {
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

    socket.on("board-cleared", () => setStrokes([]));

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
  }, [boardId, currentUser.id, currentUser.name]);

  // ---------------------------------------------------------------------------
  // 4. Render Loop & Viewport Transformations
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillStyle = "#0F172A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Infinite Grid Dot Pattern
    ctx.fillStyle = "#334155";
    const dotSpacing = 30;
    const startX = Math.floor(-pan.x / zoom / dotSpacing) * dotSpacing - dotSpacing;
    const endX = startX + canvas.width / zoom + dotSpacing * 2;
    const startY = Math.floor(-pan.y / zoom / dotSpacing) * dotSpacing - dotSpacing;
    const endY = startY + canvas.height / zoom + dotSpacing * 2;

    for (let x = startX; x < endX; x += dotSpacing) {
      for (let y = startY; y < endY; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2 / zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render Saved Strokes
    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length < 2) return;
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

    ctx.restore();
  }, [strokes, pan, zoom]);

  // ---------------------------------------------------------------------------
  // 5. Mouse & Window Interactions
  // ---------------------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || activeTool === "pan") {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (e.button === 0 && activeTool === "draw") {
      setIsDrawing(true);
      const point = getWorldCoordinates(e.clientX, e.clientY);
      currentStrokeRef.current = [point];
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
      return;
    }

    const worldPoint = getWorldCoordinates(e.clientX, e.clientY);

    if (socketRef.current && boardId) {
      const screenPos = getScreenCoordinates(worldPoint.x, worldPoint.y);
      socketRef.current.emit("mouse-move", {
        boardId,
        userId: currentUser.id,
        name: currentUser.name,
        x: screenPos.x,
        y: screenPos.y,
      });
    }

    if (!isDrawing) return;

    currentStrokeRef.current.push(worldPoint);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pts = currentStrokeRef.current;
    if (pts.length >= 2) {
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();

      ctx.restore();
    }
  };

  // Window-level mouseup handler to ensure strokes complete if drag leaves canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        return;
      }

      if (isDrawing && currentStrokeRef.current.length > 0) {
        setIsDrawing(false);

        const finishedStroke: Stroke = {
          id: Math.random().toString(36).substring(2, 9),
          points: [...currentStrokeRef.current],
          color,
          size,
          userId: currentUser.id,
        };

        const updated = [...strokesRef.current, finishedStroke];
        setStrokes(updated);

        if (socketRef.current && boardId) {
          socketRef.current.emit("draw-stroke", {
            boardId,
            stroke: finishedStroke,
          });
        }
      }
      currentStrokeRef.current = [];
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDrawing, isPanning, color, size, boardId, currentUser.id]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.min(Math.max(newZoom, 0.15), 4);
    setZoom(clampedZoom);
  };

  const handleClearBoard = () => {
    setStrokes([]);
    if (socketRef.current && boardId) {
      socketRef.current.emit("clear-board", { boardId });
    }
  };

  const handleShareBoard = async (email: string) => {
    if (!boardId) {
      throw new Error("Board is not available to share.");
    }

    const response = await fetch(`http://localhost:4000/api/boards/${boardId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to share the board.");
    }

    return data;
  };

  const handleEditBoard = async (payload: { details: string; priority: "low" | "medium" | "high" }) => {
    if (!boardId) {
      throw new Error("Board is not available to update.");
    }

    const response = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: boardTitle,
        details: payload.details,
        priority: payload.priority,
        elements: strokesRef.current,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to update the board.");
    }

    setBoardDetails(typeof data.details === "string" ? data.details : payload.details);
    setBoardPriority(
      data.priority === "low" || data.priority === "medium" || data.priority === "high"
        ? data.priority
        : payload.priority
    );

    return data;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      <BoardHeader
        title={boardTitle}
        details={boardDetails}
        priority={boardPriority}
        onTitleChange={(newTitle) => setBoardTitle(newTitle)}
        activeCount={activeCount}
        saveStatus={saveStatus}
        onBack={() => {
          saveToServer(strokesRef.current, titleRef.current);
          navigate("/dashboard", {
            state: {
              updatedBoard: {
                id: boardId,
                title: boardTitle,
                details: boardDetails,
                priority: boardPriority,
                updatedAt: new Date().toISOString(),
              },
            },
          });
        }}
        onShare={handleShareBoard}
        onEditBoard={handleEditBoard}
      />

      <div className="absolute top-20 left-4 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1.5 rounded-xl shadow-xl text-xs">
        <button
          onClick={() => setActiveTool("draw")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTool === "draw" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          ✏️ Draw Mode
        </button>
        <button
          onClick={() => setActiveTool("pan")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTool === "pan" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          🖐️ Pan Canvas
        </button>
      </div>

      <Toolbar
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        onClear={handleClearBoard}
        availableColors={DARK_THEME_COLORS}
      />

      <UserCursors cursors={Object.values(remoteCursors)} />

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        className={`block w-full h-full ${
          activeTool === "pan" || isPanning ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
        }`}
      />
    </div>
  );
};