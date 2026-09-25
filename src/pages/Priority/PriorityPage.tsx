import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { Navbar } from "../../components/ui/Navbar";
import { SearchBarControls } from "../../components/dashboard/SearchBarControls";
import { BoardCard } from "../../components/dashboard/BoardCard";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { CreateBoardModal } from "../../components/dashboard/CreateBoardModal";

interface PriorityBoard {
  id: string;
  boardId?: string;
  title: string;
  details?: string | null;
  priority?: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}

const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };

export const PriorityPage: React.FC = () => {
  const [boards, setBoards] = useState<PriorityBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDetails, setNewBoardDetails] = useState("");
  const [newBoardPriority, setNewBoardPriority] = useState<"low" | "medium" | "high">("medium");
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
        console.error("Failed to fetch priority boards:", error);
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
        body: JSON.stringify({
          title: newBoardTitle.trim() || "Untitled Board",
          details: newBoardDetails.trim(),
          priority: newBoardPriority,
        }),
      });

      if (response.ok) {
        const createdBoard = await response.json();
        const board: PriorityBoard = createdBoard.board ?? createdBoard;
        setBoards((current) => [board, ...current]);
        setNewBoardTitle("");
        setNewBoardDetails("");
        setNewBoardPriority("medium");
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
      if (response.ok) setBoards((current) => current.filter((board) => (board.boardId || board.id) !== boardId));
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
          (board.boardId || board.id) === boardId ? { ...board, pinned: updatedBoard.pinned } : board
        ));
      }
    } catch (error) {
      console.error("Failed to update board pin:", error);
    }
  };

  const priorityBoards = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return [...boards]
      .filter((board) => board.title.toLowerCase().includes(query))
      .sort((first, second) => {
        const priorityDifference = (priorityRank[first.priority || "medium"] ?? 1) - (priorityRank[second.priority || "medium"] ?? 1);
        if (priorityDifference !== 0) return priorityDifference;
        return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime();
      });
  }, [boards, searchQuery]);

  const priorityGroups = [
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" },
  ];

  return (
    <div className="workspace-shell flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-50">Priority Whiteboards</h1>
              <p className="mt-2 text-sm text-slate-400">High priority boards are shown first.</p>
            </header>

            <SearchBarControls
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenModal={() => setIsModalOpen(true)}
            />

            {loading ? (
              <p className="text-slate-400">Loading priority whiteboards...</p>
            ) : priorityBoards.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-8">
                {priorityGroups.map((group, groupIndex) => {
                  const groupBoards = priorityBoards.filter(
                    (board) => (board.priority || "medium").toLowerCase() === group.key
                  );

                  return (
                    <React.Fragment key={group.key}>
                      <section>
                        <h2 className="mb-4 text-xl font-semibold text-slate-100">{group.label}</h2>
                        {groupBoards.length === 0 ? (
                          <p className="text-sm text-slate-500">No {group.label.toLowerCase()} priority boards.</p>
                        ) : (
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                            {groupBoards.map((board) => (
                              <BoardCard
                                key={board.boardId || board.id}
                                board={board}
                                onSelect={(selectedBoard) => navigate(`/board/${selectedBoard.id}`, { state: { board: selectedBoard } })}
                                onDelete={handleDeleteBoard}
                                onTogglePin={handleTogglePin}
                              />
                            ))}
                          </div>
                        )}
                      </section>
                      {groupIndex < priorityGroups.length - 1 && <hr className="border-slate-700" />}
                    </React.Fragment>
                  );
                })}
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
