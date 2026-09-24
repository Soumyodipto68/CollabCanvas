import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { Navbar } from "../../components/ui/Navbar";
import { SearchBarControls } from "../../components/dashboard/SearchBarControls";
import { BoardCard } from "../../components/dashboard/BoardCard";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { CreateBoardModal } from "../../components/dashboard/CreateBoardModal";

interface Board {
  id: string;
  boardId?: string;
  title: string;
  details?: string | null;
  priority?: "low" | "medium" | "high";
  createdAt?: string;
  updatedAt?: string;
}

export const SharedPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDetails, setNewBoardDetails] = useState("");
  const [newBoardPriority, setNewBoardPriority] = useState<"low" | "medium" | "high">("medium");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/boards/shared", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (err) {
      console.error("Failed to fetch shared boards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;

    const titleToCreate = newBoardTitle.trim() || "Untitled Board";
    setIsCreating(true);

    try {
      const res = await fetch("http://localhost:4000/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: titleToCreate,
          details: newBoardDetails.trim(),
          priority: newBoardPriority,
        }),
      });

      if (res.ok) {
        const createdBoard = await res.json();
        const newBoard: Board = createdBoard.board ?? createdBoard;

        setNewBoardTitle("");
        setNewBoardDetails("");
        setNewBoardPriority("medium");
        setIsModalOpen(false);
        setBoards((prev) => [newBoard, ...prev]);
        navigate(`/board/${newBoard.id}`, { state: { board: newBoard } });
      }
    } catch (err) {
      console.error("Failed to create board:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this board?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setBoards((prev) => prev.filter((board) => (board.boardId || board.id) !== boardId));
      }
    } catch (err) {
      console.error("Failed to delete board:", err);
    }
  };

  const sharedBoards = useMemo(() => {
    return [...boards]
      .sort(
        (a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
      )
      .filter((board) => board.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [boards, searchQuery]);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-slate-50">Shared with Me</h1>
            </header>

            <SearchBarControls
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenModal={() => setIsModalOpen(true)}
            />

            {loading ? (
              <p className="text-slate-400">Loading shared whiteboards...</p>
            ) : sharedBoards.length === 0 ? (
              <div className="text-center py-15 text-slate-400">
                <p className="text-lg mb-2 text-slate-200">No boards shared with you yet</p>
                <p className="text-sm">Boards shared by your teammates will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                {sharedBoards.map((board) => (
                  <BoardCard
                    key={board.boardId || board.id}
                    board={board}
                    onSelect={(selectedBoard) =>
                      navigate(`/board/${selectedBoard.boardId || selectedBoard.id}`, {
                        state: { board: selectedBoard },
                      })
                    }
                    onDelete={(e) => handleDeleteBoard(e, board.boardId || board.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <CreateBoardModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setNewBoardTitle("");
              setNewBoardDetails("");
              setNewBoardPriority("medium");
            }}
            title={newBoardTitle}
            setTitle={setNewBoardTitle}
            details={newBoardDetails}
            setDetails={setNewBoardDetails}
            priority={newBoardPriority}
            setPriority={setNewBoardPriority}
            onSubmit={handleCreateBoard}
            isCreating={isCreating}
          />
        </main>
      </div>
    </div>
  );
};
