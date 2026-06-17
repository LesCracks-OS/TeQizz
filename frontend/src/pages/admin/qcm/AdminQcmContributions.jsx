import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Eye, X, ChevronDown, ChevronUp } from "lucide-react";
import adminService from "@/services/admin.service";

const LEVEL_COLORS = {
  EASY: "bg-emerald-500/10 text-emerald-500",
  MEDIUM: "bg-yellow-500/10 text-yellow-500",
  HARD: "bg-red-500/10 text-red-500",
};

function QuestionPreviewModal({ question, onClose, onApprove, onReject, acting }) {
  if (!question) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="font-bold text-sm">Question preview</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              by <span className="font-medium text-foreground">{question.submittedBy}</span>
              {" · "}{question.categoryName}{" · "}
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${LEVEL_COLORS[question.level]}`}>
                {question.level}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-sm leading-relaxed">{question.content}</p>

          <div className="space-y-2">
            {question.answers?.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                a.isCorrect ? 'border-emerald-500/40 bg-emerald-500/8 text-emerald-400' : 'border-border bg-muted/20 text-muted-foreground'
              }`}>
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  a.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-border'
                }`}>
                  {a.isCorrect && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span>{a.content}</span>
              </div>
            ))}
          </div>

          {question.hint && (
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Hint</p>
              <p className="text-sm text-muted-foreground">{question.hint}</p>
            </div>
          )}
          {question.explanation && (
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Explanation</p>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-3 shrink-0">
          <button
            disabled={acting}
            onClick={() => onReject(question.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" /> Reject
          </button>
          <button
            disabled={acting}
            onClick={() => onApprove(question.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminQcmContributions() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [acting, setActing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    setLoading(true);
    adminService.getContributions()
      .then(r => setContributions(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActing(true);
    try {
      await adminService.approveContribution(id);
      setContributions(prev => prev.filter(c => c.id !== id));
      setSelected(null);
    } catch {}
    setActing(false);
  };

  const handleReject = async (id) => {
    setActing(true);
    try {
      await adminService.rejectContribution(id);
      setContributions(prev => prev.filter(c => c.id !== id));
      setSelected(null);
    } catch {}
    setActing(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Contributions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {contributions.length} question{contributions.length !== 1 ? 's' : ''} pending review
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : contributions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <p className="font-semibold">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No pending contributions to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map(c => {
            const isExpanded = expandedId === c.id;
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-2">{c.content}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">by <span className="text-foreground font-medium">{c.submittedBy}</span></span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground">{c.categoryName}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${LEVEL_COLORS[c.level]}`}>
                        {c.level}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.answers?.length} answers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setSelected(c)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      disabled={acting}
                      onClick={() => handleReject(c.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button
                      disabled={acting}
                      onClick={() => handleApprove(c.id)}
                      className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                    {c.answers?.map((a, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                        a.isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted/30 text-muted-foreground'
                      }`}>
                        <div className={`w-3 h-3 rounded-full border shrink-0 ${a.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-border'}`} />
                        {a.content}
                      </div>
                    ))}
                    {c.hint && (
                      <p className="text-xs text-muted-foreground px-1"><span className="font-semibold">Hint:</span> {c.hint}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <QuestionPreviewModal
        question={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        acting={acting}
      />
    </div>
  );
}
