import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { BoardHeader } from "../../components/board/BoardHeader";
import { Toolbar } from "../../components/board/Toolbar";
import { UserCursors } from "../../components/board/UserCursors";
import { DARK_THEME_COLORS } from "../../constants/boardColors";
import { useAuth } from "../../context/AuthContext";

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

interface ShapeElement {
  id: string;
  type: "shape";
  shape: "rectangle" | "ellipse" | "diamond";
  start: StrokePoint;
  end: StrokePoint;
  color: string;
  size: number;
  userId?: string;
}

interface ArrowElement {
  id: string;
  type: "arrow";
  arrowType: "single" | "double" | "dashed";
  start: StrokePoint;
  end: StrokePoint;
  color: string;
  size: number;
  userId?: string;
}

interface TextElement {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  userId?: string;
}

type BoardElement = Stroke | ShapeElement | ArrowElement | TextElement;
type BoardTool = "draw" | "select" | "pan" | "shape" | "arrow" | "text";

const getElementBounds = (element: BoardElement, ctx: CanvasRenderingContext2D) => {
  if ("points" in element) {
    if (element.points.length === 0) {
      return { left: 0, top: 0, right: 0, bottom: 0 };
    }
    const xs = element.points.map((point) => point.x);
    const ys = element.points.map((point) => point.y);
    return {
      left: Math.min(...xs),
      top: Math.min(...ys),
      right: Math.max(...xs),
      bottom: Math.max(...ys),
    };
  }

  if (element.type === "text") {
    ctx.font = `${element.fontSize}px ABCDiatype, sans-serif`;
    return {
      left: element.x,
      top: element.y,
      right: element.x + ctx.measureText(element.text).width,
      bottom: element.y + element.fontSize * 1.25,
    };
  }

  return {
    left: Math.min(element.start.x, element.end.x),
    top: Math.min(element.start.y, element.end.y),
    right: Math.max(element.start.x, element.end.x),
    bottom: Math.max(element.start.y, element.end.y),
  };
};

const findElementAt = (
  elements: BoardElement[],
  point: StrokePoint,
  ctx: CanvasRenderingContext2D,
  zoom: number,
) => {
  const tolerance = 10 / zoom;
  return [...elements].reverse().find((element) => {
    const bounds = getElementBounds(element, ctx);
    return (
      point.x >= bounds.left - tolerance &&
      point.x <= bounds.right + tolerance &&
      point.y >= bounds.top - tolerance &&
      point.y <= bounds.bottom + tolerance
    );
  });
};

const translateElement = (element: BoardElement, dx: number, dy: number): BoardElement => {
  if ("points" in element) {
    return { ...element, points: element.points.map((point) => ({ x: point.x + dx, y: point.y + dy })) };
  }
  if (element.type === "text") {
    return { ...element, x: element.x + dx, y: element.y + dy };
  }
  return {
    ...element,
    start: { x: element.start.x + dx, y: element.start.y + dy },
    end: { x: element.end.x + dx, y: element.end.y + dy },
  };
};

const drawArrowHead = (
  ctx: CanvasRenderingContext2D,
  from: StrokePoint,
  to: StrokePoint,
  size: number,
) => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const headLength = Math.max(10, size * 4);
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - headLength * Math.cos(angle - Math.PI / 6),
    to.y - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - headLength * Math.cos(angle + Math.PI / 6),
    to.y - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
};

const drawBoardElement = (ctx: CanvasRenderingContext2D, element: BoardElement) => {
  ctx.strokeStyle = element.color;
  ctx.fillStyle = element.color;
  ctx.lineWidth = element.type === "text" ? 1 : element.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if ("points" in element) {
    if (element.points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(element.points[0].x, element.points[0].y);
    for (let index = 1; index < element.points.length; index++) {
      ctx.lineTo(element.points[index].x, element.points[index].y);
    }
    ctx.stroke();
    return;
  }

  if (element.type === "text") {
    ctx.font = `${element.fontSize}px ABCDiatype, sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText(element.text, element.x, element.y);
    return;
  }

  if (element.type === "shape") {
    const left = Math.min(element.start.x, element.end.x);
    const top = Math.min(element.start.y, element.end.y);
    const width = Math.abs(element.end.x - element.start.x);
    const height = Math.abs(element.end.y - element.start.y);
    ctx.beginPath();
    if (element.shape === "rectangle") {
      ctx.rect(left, top, width, height);
    } else if (element.shape === "ellipse") {
      ctx.ellipse(left + width / 2, top + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    } else {
      ctx.moveTo(left + width / 2, top);
      ctx.lineTo(left + width, top + height / 2);
      ctx.lineTo(left + width / 2, top + height);
      ctx.lineTo(left, top + height / 2);
      ctx.closePath();
    }
    ctx.stroke();
    return;
  }

  ctx.setLineDash(element.arrowType === "dashed" ? [8, 6] : []);
  ctx.beginPath();
  ctx.moveTo(element.start.x, element.start.y);
  ctx.lineTo(element.end.x, element.end.y);
  ctx.stroke();
  drawArrowHead(ctx, element.start, element.end, element.size);
  if (element.arrowType === "double") {
    drawArrowHead(ctx, element.end, element.start, element.size);
  }
  ctx.setLineDash([]);
};

interface UserCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface RemoteCursorPayload {
  userId: string;
  name: string;
  x: number;
  y: number;
}

const cursorColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#ec4899",
  "#a855f7",
];

export const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initialBoard = location.state?.board;

  // Canvas & Socket Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FFFFFF");
  const [size, setSize] = useState(3);
  const [strokes, setStrokes] = useState<BoardElement[]>([]);
  const currentStrokeRef = useRef<StrokePoint[]>([]);

  // Infinite Canvas Viewport State (Pan & Zoom)
  const [activeTool, setActiveTool] = useState<BoardTool>("draw");
  const [shapeType, setShapeType] = useState<ShapeElement["shape"]>("rectangle");
  const [arrowType, setArrowType] = useState<ArrowElement["arrowType"]>("single");
  const [textSize, setTextSize] = useState(24);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [previewElement, setPreviewElement] = useState<BoardElement | null>(null);
  const [isCreatingElement, setIsCreatingElement] = useState(false);
  const [isMovingElement, setIsMovingElement] = useState(false);
  const [textDraft, setTextDraft] = useState<{ x: number; y: number; screenX: number; screenY: number; value: string } | null>(null);
  const elementStartRef = useRef<StrokePoint | null>(null);
  const movingElementRef = useRef<{ id: string; origin: BoardElement; start: StrokePoint } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Board Metadata & Persistence Refs
  const [boardTitle, setBoardTitle] = useState<string>(initialBoard?.title || "Untitled Board");
  const [boardDetails, setBoardDetails] = useState<string>(initialBoard?.details || "");
  const [boardPriority, setBoardPriority] = useState<"low" | "medium" | "high">(
    initialBoard?.priority || "medium"
  );
  const [boardOwnerId, setBoardOwnerId] = useState<string | null>(
    initialBoard?.ownerId || initialBoard?.owner?.id || null
  );
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  
  // Critical persistence guards
  const isLoadedRef = useRef(false);
  const strokesRef = useRef<BoardElement[]>([]);
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
  const [currentUserId] = useState(
    () => `user-${Math.random().toString(36).substring(2, 9)}`
  );
  const currentUserName = user?.displayName?.trim() || user?.name?.trim() || "Anonymous";

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
    async (dataToSave: BoardElement[], titleToSave: string) => {
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
            ...(user?.id && boardOwnerId === user.id ? { priority: boardPriority } : {}),
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
    [boardId, boardDetails, boardPriority, boardOwnerId, user?.id]
  );

  // ---------------------------------------------------------------------------
  // 1. Initial Load (Hydrate state before enabling autosave)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!boardId) return;

    let isMounted = true;

    const loadBoardData = async () => {
      let loadedStrokes: BoardElement[] = [];
      let loadedTitle = "Untitled Board";
      let loadedDetails = "";
      let loadedPriority: "low" | "medium" | "high" = "medium";

      try {
        const res = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setBoardOwnerId(data.ownerId || data.owner?.id || null);
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
        userId: currentUserId,
        name: currentUserName,
      });
    });

    socket.on("room-users-count", (count: number) => setActiveCount(count));

    socket.on("draw-stroke", (incomingStroke: BoardElement) => {
      // Ignore self-sent strokes
      if (incomingStroke.userId === currentUserId) return;
      setStrokes((prev) => [...prev, incomingStroke]);
    });

    socket.on("update-element", (incomingElement: BoardElement) => {
      if (incomingElement.userId === currentUserId) return;
      setStrokes((previous) => {
        const exists = previous.some((element) => element.id === incomingElement.id);
        return exists
          ? previous.map((element) => element.id === incomingElement.id ? incomingElement : element)
          : [...previous, incomingElement];
      });
    });

    socket.on("delete-element", (elementId: string) => {
      setStrokes((previous) => previous.filter((element) => element.id !== elementId));
    });

    socket.on("cursor-moved", (data: RemoteCursorPayload) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.userId]: {
          id: data.userId,
          name: data.name,
          color:
            prev[data.userId]?.color ??
            cursorColors[Math.floor(Math.random() * cursorColors.length)],
          x: data.x,
          y: data.y,
        },
      }));
    });

    socket.on("board-cleared", () => {
      setStrokes([]);
      strokesRef.current = [];
      setSelectedElementId(null);
      setPreviewElement(null);
    });

    socket.on("user-left", (userId: string) => {
      setRemoteCursors((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    });

    return () => {
      socket.emit("leave-board", { boardId, userId: currentUserId });
      socket.disconnect();
    };
  }, [boardId, currentUserId, currentUserName]);

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

    if (showGrid) {
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1 / zoom;
      const dotSpacing = 30;
      const startX = Math.floor(-pan.x / zoom / dotSpacing) * dotSpacing - dotSpacing;
      const endX = startX + canvas.width / zoom + dotSpacing * 2;
      const startY = Math.floor(-pan.y / zoom / dotSpacing) * dotSpacing - dotSpacing;
      const endY = startY + canvas.height / zoom + dotSpacing * 2;

      ctx.beginPath();
      for (let x = startX; x < endX; x += dotSpacing) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y < endY; y += dotSpacing) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();
    }

    const drawSelection = (element: BoardElement) => {
      const bounds = getElementBounds(element, ctx);
      const padding = 7 / zoom;
      const handleSize = 6 / zoom;
      ctx.save();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5 / zoom;
      ctx.setLineDash([5 / zoom, 4 / zoom]);
      ctx.strokeRect(
        bounds.left - padding,
        bounds.top - padding,
        bounds.right - bounds.left + padding * 2,
        bounds.bottom - bounds.top + padding * 2,
      );
      ctx.setLineDash([]);
      ctx.fillStyle = "#38bdf8";
      for (const x of [bounds.left - padding, bounds.right + padding]) {
        for (const y of [bounds.top - padding, bounds.bottom + padding]) {
          ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        }
      }
      ctx.restore();
    };

    strokes.forEach((element) => {
      if (previewElement?.id === element.id) return;
      drawBoardElement(ctx, element);
      if (element.id === selectedElementId) drawSelection(element);
    });

    if (previewElement) {
      drawBoardElement(ctx, previewElement);
      if (previewElement.id === selectedElementId) drawSelection(previewElement);
    }

    ctx.restore();
  }, [strokes, pan, zoom, showGrid, previewElement, selectedElementId]);

  // ---------------------------------------------------------------------------
  // 5. Mouse & Window Interactions
  // ---------------------------------------------------------------------------
  const persistBoardElement = (element: BoardElement) => {
    const updated = [...strokesRef.current, element];
    strokesRef.current = updated;
    setStrokes(updated);
    if (socketRef.current && boardId) {
      socketRef.current.emit("draw-stroke", { boardId, stroke: element });
    }
  };

  const commitText = () => {
    if (!textDraft?.value.trim()) {
      setTextDraft(null);
      return;
    }
    persistBoardElement({
      id: Math.random().toString(36).substring(2, 9),
      type: "text",
      x: textDraft.x,
      y: textDraft.y,
      text: textDraft.value.trim(),
      fontSize: textSize,
      color,
      userId: currentUserId,
    });
    setTextDraft(null);
    setActiveTool("select");
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    const updated = strokesRef.current.filter((element) => element.id !== selectedElementId);
    strokesRef.current = updated;
    setStrokes(updated);
    if (socketRef.current && boardId) {
      socketRef.current.emit("delete-element", { boardId, elementId: selectedElementId });
    }
    setSelectedElementId(null);
    setPreviewElement(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (activeTool !== "select" || !selectedElementId) return;
      if ((event.target as HTMLElement).matches("input, textarea, select")) return;
      event.preventDefault();
      deleteSelectedElement();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTool, selectedElementId]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    if (e.button === 1 || activeTool === "pan") {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (e.button !== 0) return;

    const point = getWorldCoordinates(e.clientX, e.clientY);

    if (activeTool === "select") {
      const ctx = e.currentTarget.getContext("2d");
      const element = ctx ? findElementAt(strokesRef.current, point, ctx, zoom) : undefined;
      setSelectedElementId(element?.id ?? null);
      setPreviewElement(element ?? null);
      if (element) {
        movingElementRef.current = { id: element.id, origin: element, start: point };
        setIsMovingElement(true);
      }
      return;
    }

    if (activeTool === "text") {
      const rect = e.currentTarget.getBoundingClientRect();
      setTextDraft({
        x: point.x,
        y: point.y,
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
        value: "",
      });
      return;
    }

    if (activeTool === "shape") {
      const element: ShapeElement = {
        id: Math.random().toString(36).substring(2, 9),
        type: "shape",
        shape: shapeType,
        start: point,
        end: point,
        color,
        size,
        userId: currentUserId,
      };
      elementStartRef.current = point;
      setPreviewElement(element);
      setIsCreatingElement(true);
      return;
    }

    if (activeTool === "arrow") {
      const element: ArrowElement = {
        id: Math.random().toString(36).substring(2, 9),
        type: "arrow",
        arrowType,
        start: point,
        end: point,
        color,
        size,
        userId: currentUserId,
      };
      elementStartRef.current = point;
      setPreviewElement(element);
      setIsCreatingElement(true);
      return;
    }

    if (activeTool === "draw") {
      setIsDrawing(true);
      currentStrokeRef.current = [point];
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
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
        userId: currentUserId,
        name: currentUserName,
        x: screenPos.x,
        y: screenPos.y,
      });
    }

    if (isMovingElement && movingElementRef.current) {
      const { id, origin, start } = movingElementRef.current;
      setPreviewElement(translateElement(origin, worldPoint.x - start.x, worldPoint.y - start.y));
      setSelectedElementId(id);
      return;
    }

    if (isCreatingElement && elementStartRef.current) {
      setPreviewElement((current) => {
        if (!current || (current.type !== "shape" && current.type !== "arrow")) return current;
        return { ...current, end: worldPoint };
      });
      return;
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

  // Window-level pointer handler to finish gestures even when the pointer leaves the canvas.
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isPanning) {
        setIsPanning(false);
        return;
      }

      if (isMovingElement && previewElement) {
        const updated = strokesRef.current.map((element) =>
          element.id === previewElement.id ? previewElement : element,
        );
        strokesRef.current = updated;
        setStrokes(updated);
        if (socketRef.current && boardId) {
          socketRef.current.emit("update-element", { boardId, element: previewElement });
        }
        movingElementRef.current = null;
        setIsMovingElement(false);
        setPreviewElement(null);
        return;
      }

      if (isCreatingElement && previewElement && "start" in previewElement) {
        const distance = Math.hypot(
          previewElement.end.x - previewElement.start.x,
          previewElement.end.y - previewElement.start.y,
        );
        if (distance > 2) persistBoardElement(previewElement);
        elementStartRef.current = null;
        setIsCreatingElement(false);
        setPreviewElement(null);
        return;
      }

      if (isDrawing && currentStrokeRef.current.length > 0) {
        setIsDrawing(false);

        const finishedStroke: Stroke = {
          id: Math.random().toString(36).substring(2, 9),
          points: [...currentStrokeRef.current],
          color,
          size,
          userId: currentUserId,
        };

        persistBoardElement(finishedStroke);
      }
      currentStrokeRef.current = [];
    };

    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [isDrawing, isPanning, isCreatingElement, isMovingElement, previewElement, color, size, boardId, currentUserId]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const zoomFactor = 1.08;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.min(Math.max(newZoom, 0.15), 4);

    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;
    setPan({
      x: cursorX - worldX * clampedZoom,
      y: cursorY - worldY * clampedZoom,
    });
    setZoom(clampedZoom);
  };

  const handleClearBoard = () => {
    setStrokes([]);
    strokesRef.current = [];
    setSelectedElementId(null);
    setPreviewElement(null);
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

  const handleEditBoard = async (payload: { details: string; priority?: "low" | "medium" | "high" }) => {
    if (!boardId) {
      throw new Error("Board is not available to update.");
    }

    const isBoardOwner = Boolean(user?.id && boardOwnerId === user.id);
    const updatePayload = isBoardOwner
      ? {
          title: boardTitle,
          details: payload.details,
          priority: payload.priority || boardPriority,
          elements: strokesRef.current,
        }
      : {
          details: payload.details,
        };

    const response = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updatePayload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to update the board.");
    }

    setBoardDetails(typeof data.details === "string" ? data.details : payload.details);
    setBoardPriority(
      data.priority === "low" || data.priority === "medium" || data.priority === "high"
        ? data.priority
      : payload.priority || boardPriority
    );

    return data;
  };

  const canManageBoard = Boolean(user?.id && boardOwnerId === user.id);

  return (
    <div className="board-shell relative w-screen h-screen overflow-hidden select-none">
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
        onShare={canManageBoard ? handleShareBoard : undefined}
        onEditBoard={handleEditBoard}
        canEditPriority={canManageBoard}
      />

      <Toolbar
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        onClear={handleClearBoard}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        shapeType={shapeType}
        setShapeType={setShapeType}
        arrowType={arrowType}
        setArrowType={setArrowType}
        textSize={textSize}
        setTextSize={setTextSize}
        hasSelection={Boolean(selectedElementId)}
        onDeleteSelected={deleteSelectedElement}
        availableColors={DARK_THEME_COLORS}
      />

      <UserCursors cursors={Object.values(remoteCursors)} />

      {textDraft && (
        <div
          className="absolute z-70 flex items-center gap-2 rounded-lg border border-sky-400/60 bg-slate-900/95 p-2 shadow-xl"
          style={{ left: textDraft.screenX, top: textDraft.screenY }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <input
            autoFocus
            type="text"
            aria-label="Text to add to the board"
            placeholder="Type here..."
            value={textDraft.value}
            onChange={(event) => setTextDraft({ ...textDraft, value: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitText();
              if (event.key === "Escape") setTextDraft(null);
            }}
            className="w-56 border-0 bg-transparent px-2 py-1 text-slate-50 outline-none placeholder:text-slate-500"
            style={{ color, fontSize: Math.max(14, textSize * zoom) }}
          />
          <button
            type="button"
            onClick={commitText}
            className="rounded bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400"
          >
            Add
          </button>
          <button
            type="button"
            aria-label="Cancel text"
            onClick={() => setTextDraft(null)}
            className="px-1.5 py-1 text-sm text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
        className={`block h-full w-full touch-none ${
          activeTool === "pan" || isPanning ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
        }`}
      />
    </div>
  );
};