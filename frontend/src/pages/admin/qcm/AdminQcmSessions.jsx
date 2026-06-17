import { useEffect, useState } from "react";
import { Trash2, StopCircle, Search } from "lucide-react";
import adminService from "@/services/admin.service";

const MODE_COLORS = {
  BLITZ: "bg-purple-500/10 text-purple-500",
  RUSH: "bg-blue-500/10 text-blue-500",
  CLASSIC: "bg-emerald-500/10 text-emerald-500",
};

export default function AdminQcmSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    adminService.getQcmSessions(modeFilter ? { gameMode: modeFilter } : {})
      .then(r => setSessions(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [modeFilter]);

  const handleForceComplete = async (id) => {
    setActionId(id);
    try {
      await adminService.forceCompleteQcmSession(id);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, completed: true } : s));
    } catch {}
    setActionId(null);
  };

  const handleDelete = async (id) => {
    setActionId(id);
    try {
      await adminService.deleteQcmSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch {}
    setActionId(null);
    setConfirmDelete(null);
  };

  const filtered = sessions.filter(s =>
    !search ||
    s.username?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user or ID…" className="pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 w-48" />
          </div>
          <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40">
            <option value="">All modes</option>
            <option value="BLITZ">Blitz</option>
            <option value="RUSH">Rush</option>
            <option value="CLASSIC">Classic</option>
          </select>
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} sessions</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Mode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Started</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No sessions found</td></tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">#{s.id}</td>
                    <td className="px-4 py-3 font-medium">{s.username}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${MODE_COLORS[s.gameMode] ?? "bg-muted text-muted-foreground"}`}>
                        {s.gameMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.totalScore ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                        {s.status === "COMPLETED" ? "Completed" : "In progress"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {s.startedAt ? new Date(s.startedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {s.status !== "COMPLETED" && (
                          <button
                            disabled={actionId === s.id}
                            onClick={() => handleForceComplete(s.id)}
                            title="Force complete"
                            className="p-1.5 rounded hover:bg-yellow-500/10 transition-colors text-muted-foreground hover:text-yellow-500 disabled:opacity-50"
                          >
                            <StopCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          disabled={actionId === s.id}
                          onClick={() => setConfirmDelete(s)}
                          className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 className="font-bold">Delete session #{confirmDelete.id}?</h3>
            <p className="text-sm text-muted-foreground">This will permanently delete the session and all answers for user <strong>{confirmDelete.username}</strong>.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
              <button disabled={actionId === confirmDelete.id} onClick={() => handleDelete(confirmDelete.id)} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                {actionId === confirmDelete.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
