import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import adminService from "@/services/admin.service";
import { toast } from "@/contexts/ToastContext";

const DIFF_COLORS = {
  EASY: "bg-emerald-500/10 text-emerald-500",
  MEDIUM: "bg-yellow-500/10 text-yellow-500",
  HARD: "bg-red-500/10 text-red-500",
};

export default function AdminSmatchDecks() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const load = () => {
    setLoading(true);
    const params = {};
    if (categoryFilter) params.categoryId = categoryFilter;
    Promise.all([
      adminService.getSmatchDecks(params),
      adminService.getQcmCategories(),
    ])
      .then(([dRes, cRes]) => {
        setDecks(dRes.data?.content ?? []);
        setCategories(cRes.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [categoryFilter]);

  const handleToggleStatus = async (deck) => {
    setActionId(deck.id);
    try {
      await adminService.updateSmatchDeckStatus(deck.id, !deck.isActive);
      setDecks(prev => prev.map(d => d.id === deck.id ? { ...d, isActive: !deck.isActive } : d));
    } catch (e) { toast.error(e?.message || "Une erreur est survenue"); }
    setActionId(null);
  };

  const handleDelete = async (id) => {
    setActionId(id);
    setDeleteError("");
    try {
      await adminService.deleteSmatchDeck(id);
      setDecks(prev => prev.filter(d => d.id !== id));
      setConfirmDelete(null);
    } catch (e) {
      setDeleteError(e?.response?.data?.message ?? "Cannot delete deck");
    }
    setActionId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Link
          to="/admin/smatch/decks/new"
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Deck
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deck</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pairs</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Difficulty</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
              ))
            ) : decks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No decks yet</p>
                  <Link to="/admin/smatch/decks/new" className="text-sm text-primary hover:underline mt-1 inline-block">Create your first deck</Link>
                </td>
              </tr>
            ) : (
              decks.map(deck => (
                <tr key={deck.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{deck.name}</p>
                      {deck.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{deck.description}</p>}
                      {deck.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {deck.tags.map(t => (
                            <span key={t.id} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">{t.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{deck.categoryName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{deck.activePairCount ?? 0}</span>
                    <span className="text-xs text-muted-foreground"> / {deck.pairCount ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${DIFF_COLORS[deck.difficulty] ?? "bg-muted text-muted-foreground"}`}>
                      {deck.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${deck.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                      {deck.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        disabled={actionId === deck.id}
                        onClick={() => handleToggleStatus(deck)}
                        title={deck.isActive ? "Deactivate" : "Activate"}
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        {deck.isActive ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <Link to={`/admin/smatch/decks/${deck.id}/edit`} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        disabled={actionId === deck.id}
                        onClick={() => { setDeleteError(""); setConfirmDelete(deck); }}
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

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 className="font-bold">Delete deck?</h3>
            <p className="text-sm text-muted-foreground">
              Delete <strong>{confirmDelete.name}</strong>? All pairs will be deleted too. Decks with existing sessions cannot be deleted — deactivate instead.
            </p>
            {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
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
