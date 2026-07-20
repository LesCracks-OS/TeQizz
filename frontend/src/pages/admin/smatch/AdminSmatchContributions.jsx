import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import adminService from "@/services/admin.service";
import { toast } from "@/contexts/ToastContext";

const DIFF_COLORS = {
  EASY: "bg-emerald-500/10 text-emerald-500",
  MEDIUM: "bg-yellow-500/10 text-yellow-500",
  HARD: "bg-red-500/10 text-red-500",
};

/**
 * Admin review of user-proposed Smatch decks — the Smatch counterpart of AdminQcmContributions.
 * Approving materialises a real active deck; rejecting asks for a reason.
 */
export default function AdminSmatchContributions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    setLoading(true);
    adminService.getSmatchContributions()
      .then(r => setItems(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async (id) => {
    setActing(true);
    try {
      await adminService.approveSmatchContribution(id);
      setItems(prev => prev.filter(c => c.id !== id));
    } catch (e) { toast.error(e?.message || "Une erreur est survenue"); }
    setActing(false);
  };

  const reject = async (id) => {
    const reason = window.prompt("Raison du rejet (optionnel) :") ?? "";
    setActing(true);
    try {
      await adminService.rejectSmatchContribution(id, reason);
      setItems(prev => prev.filter(c => c.id !== id));
    } catch (e) { toast.error(e?.message || "Une erreur est survenue"); }
    setActing(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Contributions Smatch</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {items.length} deck{items.length !== 1 ? "s" : ""} en attente de revue
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <p className="font-semibold">Rien à modérer !</p>
          <p className="text-sm text-muted-foreground mt-1">Aucune contribution Smatch en attente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(c => {
            const isExpanded = expandedId === c.id;
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">par <span className="text-foreground font-medium">{c.submittedBy}</span></span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${DIFF_COLORS[c.difficulty] ?? "bg-muted text-muted-foreground"}`}>
                        {c.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.pairs?.length ?? 0} paires</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setExpandedId(isExpanded ? null : c.id)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button disabled={acting} onClick={() => reject(c.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button disabled={acting} onClick={() => approve(c.id)} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-1.5 border-t border-border pt-3">
                    {c.description && <p className="text-xs text-muted-foreground mb-2">{c.description}</p>}
                    {c.pairs?.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-muted/30">
                        <span className="font-medium text-foreground">{p.term}</span>
                        <span className="text-muted-foreground/50">↔</span>
                        <span className="text-muted-foreground">{p.definition}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
