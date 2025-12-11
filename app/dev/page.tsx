const tasks = [
  {
    id: "DEV-142",
    title: "Wire Pricing OS webhook for agent events",
    status: "In Progress",
    owner: "Scarlette Dev Agent",
    updated: "5m ago",
    priority: "High",
  },
  {
    id: "DEV-139",
    title: "Add healthcheck fallback messaging",
    status: "Review",
    owner: "Scarlette Dev Agent",
    updated: "18m ago",
    priority: "Medium",
  },
  {
    id: "DEV-131",
    title: "Prepare Listings OS schema sync",
    status: "Queued",
    owner: "Scarlette Dev Agent",
    updated: "1h ago",
    priority: "Low",
  },
];

const statusStyles: Record<string, string> = {
  "In Progress": "bg-amber-500/15 text-amber-200 border border-amber-500/40",
  Review: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40",
  Queued: "bg-slate-600/20 text-slate-200 border border-slate-500/40",
};

export default function DevAgentPage() {
  const taskCount = tasks.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Scarlette
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              Dev Agent
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]" />
            {taskCount} tasks active
          </span>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 shadow-xl shadow-slate-950/40">
          <div className="border-b border-slate-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Task queue
                </p>
                <h2 className="text-lg font-semibold text-slate-50">
                  Active tickets
                </h2>
              </div>
              <div className="text-xs text-slate-400">
                Updated just now
              </div>
            </div>
          </div>

          <ul className="divide-y divide-slate-800">
            {tasks.map((task) => (
              <li key={task.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.8rem] font-semibold text-slate-100">
                      {task.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.7rem] font-medium ${statusStyles[task.status]}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{task.title}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-slate-200">
                    Owner: {task.owner}
                  </span>
                  <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-slate-200">
                    Priority: {task.priority}
                  </span>
                  <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1">
                    Updated {task.updated}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
