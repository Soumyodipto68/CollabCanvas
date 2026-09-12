// client_side/src/components/board/UserCursors.tsx
import React from "react";

export interface UserCursor {
  id: string;
  name: string;
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
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md" />
          <span className="ml-2 px-2 py-0.5 bg-red-500/90 text-white text-[10px] rounded-md font-semibold whitespace-nowrap shadow">
            {c.name}
          </span>
        </div>
      ))}
    </>
  );
};