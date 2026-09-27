// client_side/src/components/board/UserCursors.tsx
import React from "react";
import { MousePointer2 } from "lucide-react";

export interface UserCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface UserCursorsProps {
  cursors: UserCursor[];
}

export const UserCursors: React.FC<UserCursorsProps> = ({ cursors }) => {
  return (
    <>
      {cursors.map((c) => (
        <div
          key={c.id}
          className="absolute pointer-events-none transition-all duration-75 ease-out z-30"
          style={{ left: `${c.x}px`, top: `${c.y}px` }}
        >
          <MousePointer2
            size={24}
            fill={c.color}
            color="white"
            strokeWidth={2.5}
            className="drop-shadow-md"
          />
          <span
            className="absolute left-5 top-4 rounded-md px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white shadow"
            style={{ backgroundColor: c.color }}
          >
            {c.name}
          </span>
        </div>
      ))}
    </>
  );
};