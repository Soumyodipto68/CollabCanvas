// client_side/src/pages/BoardPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { BoardHeader } from "../../components/board/BoardHeader";
import { Toolbar } from "../../components/board/Toolbar";
import { UserCursors} from "../../components/board/UserCursors";

interface DrawPoint {
  x: number;
  y: number;
}

interface DrawData {
  points: DrawPoint[];
  color: string;
  width: number;
  tool: "pencil" | "eraser";
}

export const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { user } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Tools & State
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [color, setColor] = useState("#3b82f6");
  const [lineWidth, setLineWidth] = useState(4);
  const [currentPath, setCurrentPath] = useState<DrawPoint[]>([]);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Room State
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [cursors, setCursors] = useState<{ [key: string]: UserCursor }>({});

  const displayName = user?.name || user?.email?.split("@")[0] || "Anonymous";

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-board", { boardId, userId: user?.id, name: displayName });
    });

    socket.on("room-users-count", (count: number) => setActiveUsers(count));
    socket.on("draw-stroke", (data: DrawData) => drawRemoteStroke(data));
    socket.on("board-cleared", () => clearLocalCanvas());
    
    socket.on("cursor-moved", (cursorData: UserCursor) => {
      if (cursorData.userId !== user?.id) {
        setCursors((prev) => ({ ...prev, [cursorData.userId]: cursorData }));
      }
    });

    socket.on("user-left", (userId: string) => {
      setCursors((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    return () => {
      socket.emit("leave-board", { boardId, userId: user?.id });
      socket.disconnect();
    };
  }, [boardId, user, displayName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      saveHistory();
    }
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setHistory((prev) => [...prev.slice(-20), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const drawRemoteStroke = (data: DrawData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || data.points.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = data.tool === "eraser" ? "#0f172a" : data.color;
    ctx.lineWidth = data.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(data.points[0].x, data.points[0].y);
    for (let i = 1; i < data.points.length; i++) {
      ctx.lineTo(data.points[i].x, data.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setIsDrawing(true);
    setCurrentPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    socketRef.current?.emit("mouse-move", { boardId, userId: user?.id, name: displayName, x, y });

    if (!isDrawing) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setCurrentPath((prev) => [...prev, { x, y }]);
    ctx.beginPath();
    ctx.strokeStyle = tool === "eraser" ? "#0f172a" : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const prevPoint = currentPath[currentPath.length - 1] || { x, y };
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length > 1) {
      saveHistory();
      socketRef.current?.emit("draw-stroke", {
        boardId,
        stroke: { points: currentPath, color, width: lineWidth, tool },
      });
    }
    setCurrentPath([]);
  };

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  const handleClearBoard = () => {
    clearLocalCanvas();
    socketRef.current?.emit("clear-board", { boardId });
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop();
    const previousState = newHistory[newHistory.length - 1];
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `whiteboard-${boardId || "export"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden text-white select-none">
      <BoardHeader boardId={boardId} activeUsers={activeUsers} onExport={handleExportPNG} />

      <div className="flex-1 relative bg-slate-950 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 w-full h-full block"
        />

        <UserCursors cursors={cursors} />

        <Toolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          canUndo={history.length > 1}
          onUndo={handleUndo}
          onClear={handleClearBoard}
        />
      </div>
    </div>
  );
};

export default BoardPage;