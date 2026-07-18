import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CopyCheck, Trash2, Pencil, AlertTriangle } from "lucide-react";
import adminService from "@/services/admin.service";

/**
 * Dedup queue — legacy questions that share identical (normalised) content.
 * New submissions are hard-blocked, so these are pre-existing duplicates to clean up.
 */
export default function AdminQcmDuplicates() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    adminService.getQcmDuplicates()
      .then(r => setGroups(r.data ?? []))
      .catch(() => setError("Impossible de charger les doublons"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    if (!window.confirm("Supprimer définitivement cette question ?")) return;
    setBusyId(id);
    try {
      await adminService.deleteQcmQuestion(id);
      load();
    } catch (e) {
      setError(e?.message ?? "Échec de la suppression");
    }
    setBusyId(null);
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <CopyCheck className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Doublons de questions</h2>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {groups.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun doublon exact détecté. 🎉
        </div>
      ) : (
        <>
          <p className="flex items-center gap-1.5 text-sm text-amber-500">
            <AlertTriangle className="h-4 w-4" />
            {groups.length} groupe{groups.length > 1 ? "s" : ""} de questions identiques à nettoyer.
          </p>
          <div className="space-y-4">
            {groups.map(group => (
              <div key={group.hash} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <p className="text-xs text-muted-foreground">{group.questions.length} exemplaires</p>
                {group.questions.map(q => (
                  <div key={q.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background p-3">
                    <div className="min-w-0">
                      <p className="text-sm line-clamp-2">{q.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        #{q.id} · {q.status}{q.submittedBy ? ` · par ${q.submittedBy}` : ""}{q.createdAt ? ` · ${q.createdAt.slice(0, 10)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link to={`/admin/qcm/questions/${q.id}/edit`} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Éditer">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => remove(q.id)} disabled={busyId === q.id} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-40" title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
