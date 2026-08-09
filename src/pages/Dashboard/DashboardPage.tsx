// src/pages/DashboardPage.tsx
import React, { useState } from "react";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { Navbar } from "../../components/ui/Navbar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { SearchBarControls } from "../../components/dashboard/SearchBarControls";
import { BoardCard} from "../../components/dashboard/BoardCard";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { CreateBoardModal } from "../../components/dashboard/CreateBoardModal";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
        const newBoard: Board = await res.json();
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
        setBoards((prev) => prev.filter((b) => b.id !== boardId));
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
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main Area (Navbar + Content) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Dashboard Body */}
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
                key={board.id}
                board={board}
                onSelect={(selectedBoard) =>
                  navigate(`/board/${selectedBoard.id}`, { state: { board: selectedBoard } })
                }
                onDelete={handleDeleteBoard}
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