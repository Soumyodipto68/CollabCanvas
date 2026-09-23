import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { Navbar } from "../../components/ui/Navbar";
import { SearchBarControls } from "../../components/dashboard/SearchBarControls";
import * as BoardCardModule from "../../components/dashboard/BoardCard";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { CreateBoardModal } from "../../components/dashboard/CreateBoardModal";

interface RecentBoard {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}

export const RecentPage: React.FC = () => {
  const [boards, setBoards] = useState<RecentBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/boards", {
          credentials: "include",
        });
        if (response.ok) setBoards(await response.json());
      } catch (error) {
        console.error("Failed to fetch recent boards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handleCreateBoard = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch("http://localhost:4000/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newBoardTitle.trim() || "Untitled Board" }),
      });

      if (response.ok) {
        const createdBoard = await response.json();
        const board: RecentBoard = createdBoard.board ?? createdBoard;
        setBoards((current) => [board, ...current]);
        setNewBoardTitle("");
        setIsModalOpen(false);
        navigate(`/board/${board.id}`, { state: { board } });
      }
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (event: React.MouseEvent, boardId: string) => {
    event.stopPropagation();
    if (!confirm("Are you sure you want to delete this board?")) return;

    try {
      const response = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) setBoards((current) => current.filter((board) => board.id !== boardId));
    } catch (error) {
      console.error("Failed to delete board:", error);
    }
  };

  const handleTogglePin = async (event: React.MouseEvent, boardId: string) => {
    event.stopPropagation();

    try {
      const response = await fetch(`http://localhost:4000/api/boards/${boardId}/pin`, {
        method: "PATCH",
        credentials: "include",
      });

      if (response.ok) {
        const updatedBoard = await response.json();
        setBoards((current) => current.map((board) =>
          board.id === boardId ? { ...board, pinned: updatedBoard.pinned } : board
        ));
      }
    } catch (error) {
      console.error("Failed to update board pin:", error);
    }
  };

  const recentBoards = useMemo(() => {
    return [...boards]
      .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime())
      .filter((board) => board.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [boards, searchQuery]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-900 text-slate-100">
      <Navbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-50">Recent Whiteboards</h1>
            </header>
            <SearchBarControls searchQuery={searchQuery} setSearchQuery={setSearchQuery} onOpenModal={() => setIsModalOpen(true)} />
            {loading ? (
              <p className="text-slate-400">Loading recent whiteboards...</p>
            ) : recentBoards.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                {recentBoards.map((board) => (
                  <BoardCardModule.BoardCard
                    key={board.id}
                    board={board}
                    onSelect={(selectedBoard) => navigate(`/board/${selectedBoard.id}`, { state: { board: selectedBoard } })}
                    onDelete={handleDeleteBoard}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            )}
          </div>
          <CreateBoardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newBoardTitle} setTitle={setNewBoardTitle} onSubmit={handleCreateBoard} isCreating={isCreating} />
        </main>
      </div>
    </div>
  );
};
