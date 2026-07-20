import { useEffect, useState } from "react";
import { Trash2, Search, Eye, X } from "lucide-react";
import adminService from "@/services/admin.service";
import { toast } from "@/contexts/ToastContext";

const MODE_COLORS = {
  TIME_ATTACK: "bg-orange-500/10 text-orange-500",
  ZEN: "bg-emerald-500/10 text-emerald-500",
  SURVIVAL: "bg-red-500/10 text-red-500",
};

function SessionDetailModal({ session, onClose }) {
  if (!session) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-bold">Session #{session.id}</h3>
            <p className="text-xs text-muted-foreground">{session.username} · {session.gameModeDisplay}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Score", value: session.totalScore },
              { label: "Matched", value: session.pairsMatched },
              { label: "Errors", value: session.wrongAttempts },
            ].map(stat => (
              <div key={stat.label} className="rounded-lg bg-muted p-3">
                <p className="text-lg font-bold">{stat.value ?? 0}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          {session.attempts?.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Attempts</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {session.attempts.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-xs rounded p-2 bg-muted/50">
                    <span className="text-muted-foreground truncate max-w-[60%]">{a.pairTerm ?? `Pair #${a.pairId}`}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={a.isCorrect ? "text-emerald-500" : "text-red-500"}>{a.isCorrect ? "✓" : "✗"}</span>
                      <span className="text-muted-foreground">{a.timeTakenMs}ms</span>
                      <span className="font-medium">+{a.pointsEarned}pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSmatchSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [detailSession, setDetailSession] = useState(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (modeFilter) params.gameMode = modeFilter;
    adminService.getSmatchSessions(params)
      .then(r => setSessions(r.data?.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [modeFilter]);

  const handleViewDetail = async (id) => {
    try {
      const res = await adminService.getSmatchSession(id);
      setDetailSession(res.data);
    } catch (e) { toast.error(e?.message || "Une erreur est survenue"); }
  };

  const handleDelete = async (id) => {
    setActionId(id);
    try {
      await adminService.deleteSmatchSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      setConfirmDelete(null);
    } catch (e) { toast.error(e?.message || "Une erreur est survenue"); }
    setActionId(null);
  };

  const filtered = sessions.filter(s =>
    !search ||
    s.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.deckName?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 w-44" />
          </div>
          <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40">
            <option value="">All modes</option>
            <option value="TIME_ATTACK">Time Attack</option>
            <option value="ZEN">Zen</option>
            <option value="SURVIVAL">Survival</option>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Deck</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
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
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.deckName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${MODE_COLORS[s.gameMode] ?? "bg-muted text-muted-foreground"}`}>
                        {s.gameModeDisplay ?? s.gameMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.totalScore ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                        {s.completed ? "Done" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => handleViewDetail(s.id)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button disabled={actionId === s.id} onClick={() => setConfirmDelete(s)} className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-50">
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

      <SessionDetailModal session={detailSession} onClose={() => setDetailSession(null)} />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 className="font-bold">Delete session #{confirmDelete.id}?</h3>
            <p className="text-sm text-muted-foreground">This will delete all attempt data for <strong>{confirmDelete.username}</strong>.</p>
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
