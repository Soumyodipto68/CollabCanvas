// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { Navbar } from "../../components/ui/Navbar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { SearchBarControls } from "../../components/dashboard/SearchBarControls";
import { BoardCard } from "../../components/dashboard/BoardCard";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { CreateBoardModal } from "../../components/dashboard/CreateBoardModal";
import { useNavigate } from "react-router-dom";

// Define Board interface locally or import from your types
interface Board {
  id: string;
  boardId?: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DashboardPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/boards", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (err) {
      console.error("Failed to fetch boards:", err);
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
        body: JSON.stringify({ title: titleToCreate }),
      });

      if (res.ok) {
        const createdBoard = await res.json();
        const newBoard: Board = createdBoard.board ?? createdBoard;

        setNewBoardTitle("");
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
        setBoards((prev) => prev.filter((b) => (b.boardId || b.id) !== boardId));
      }
    } catch (err) {
      console.error("Failed to delete board:", err);
    }
  };

  // Filter boards dynamically based on search query
  const filteredBoards = boards.filter((board) =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* 1. Full-width Top Navbar */}
      <Navbar />

      {/* 2. Content Row: Sidebar on Left, Main Canvas/Body on Right */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar positioned underneath the Navbar */}
        <Sidebar />

        {/* Scrollable Dashboard Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <DashboardHeader />

            <SearchBarControls
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenModal={() => setIsModalOpen(true)}
            />

            {loading ? (
              <p className="text-slate-400">Loading whiteboards...</p>
            ) : filteredBoards.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                {filteredBoards.map((board) => (
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

          {/* Modal for board creation */}
          <CreateBoardModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={newBoardTitle}
            setTitle={setNewBoardTitle}
            onSubmit={handleCreateBoard}
            isCreating={isCreating}
          />
        </main>
      </div>
    </div>
  );
};