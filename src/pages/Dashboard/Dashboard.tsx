import { Plus, Users, ArrowRight } from "lucide-react";

const boards = [
  {
    id: 1,
    title: "System Design",
    updated: "2 hours ago",
  },
  {
    id: 2,
    title: "College Notes",
    updated: "Yesterday",
  },
  {
    id: 3,
    title: "Brainstorm Session",
    updated: "3 days ago",
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#111827] text-white">

      {/* Navbar */}

      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <h1 className="text-2xl font-bold text-cyan-400">
            WhiteBoard
          </h1>

          <img
            src="https://i.pravatar.cc/100"
            alt="profile"
            className="h-10 w-10 rounded-full"
          />

        </div>
      </header>

      {/* Main */}

      <main className="mx-auto max-w-7xl px-6 py-12">

        <h2 className="text-4xl font-bold">
          Welcome Back 👋
        </h2>

        <p className="mt-2 text-gray-400">
          Continue where you left off.
        </p>

        {/* Buttons */}

        <div className="mt-10 flex flex-wrap gap-5">

          <button className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold transition hover:bg-cyan-600">
            <Plus size={20} />
            Create Board
          </button>

          <button className="flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 hover:border-cyan-500">
            <Users size={20} />
            Join Board
          </button>

        </div>

        {/* Boards */}

        <section className="mt-14">

          <h3 className="mb-8 text-2xl font-semibold">
            Recent Boards
          </h3>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {boards.map((board) => (

              <div
                key={board.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-500 hover:-translate-y-1"
              >

                <h4 className="text-xl font-semibold">
                  {board.title}
                </h4>

                <p className="mt-2 text-sm text-gray-400">
                  Updated {board.updated}
                </p>

                <button className="mt-8 flex items-center gap-2 text-cyan-400 hover:gap-3 transition-all">
                  Open Board
                  <ArrowRight size={18} />
                </button>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
};

export default Dashboard;