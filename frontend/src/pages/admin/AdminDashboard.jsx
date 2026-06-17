import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, FileQuestion, Layers, Play, TrendingUp,
  Inbox, Plus, AlertCircle, CheckCircle2, ArrowRight,
  Tag, BarChart2,
} from "lucide-react";
import adminService from "@/services/admin.service";
import { useAuth } from "@/contexts/AuthContext";

function KpiCard({ label, value, sub, accent, to }) {
  const inner = (
    <div className={`rounded-2xl border ${accent.border} bg-card p-5 hover:border-opacity-80 transition-colors group`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className={`text-3xl font-black tracking-tight ${accent.text}`}>{value ?? "—"}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
      {to && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${accent.text} opacity-60 group-hover:opacity-100 transition-opacity`}>
          Voir <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3">{children}</p>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      adminService.getContributionsCount(),
    ])
      .then(([sRes, cRes]) => {
        setStats(sRes.data ?? null);
        setPending(cRes.data?.pending ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = stats;

  const qcmActive = s?.activeQcmQuestions ?? 0;
  const qcmTotal = s?.totalQcmQuestions ?? 0;
  const qcmInactive = qcmTotal - qcmActive;
  const activeRatio = qcmTotal > 0 ? Math.round((qcmActive / qcmTotal) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">Console Admin</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
            Bonjour, {user?.firstName || user?.username || "Admin"}
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        {pending > 0 && (
          <Link
            to="/admin/qcm/contributions"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-bold hover:bg-amber-500/25 transition-colors shrink-0"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {pending} contribution{pending > 1 ? "s" : ""} en attente
          </Link>
        )}
      </div>

      {/* ── KPIs ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Utilisateurs"
            value={s?.totalUsers?.toLocaleString()}
            to="/admin/users"
            accent={{ border: "border-blue-500/20", text: "text-blue-400" }}
          />
          <KpiCard
            label="Questions actives"
            value={qcmActive?.toLocaleString()}
            sub={`${activeRatio}% du catalogue · ${qcmTotal} total`}
            to="/admin/qcm/questions"
            accent={{ border: "border-violet-500/20", text: "text-violet-400" }}
          />
          <KpiCard
            label="En attente de revue"
            value={pending}
            sub={pending > 0 ? "Action requise" : "Tout est à jour"}
            to="/admin/qcm/contributions"
            accent={pending > 0
              ? { border: "border-amber-500/30", text: "text-amber-400" }
              : { border: "border-emerald-500/20", text: "text-emerald-400" }
            }
          />
          <KpiCard
            label="Sessions QCM"
            value={s?.totalQcmSessions?.toLocaleString()}
            sub={`${s?.activeQcmSessions ?? 0} terminées`}
            to="/admin/qcm/sessions"
            accent={{ border: "border-orange-500/20", text: "text-orange-400" }}
          />
        </div>
      )}

      {/* ── Content detail ── */}
      {!loading && s && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* QCM breakdown */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-black text-white/80">Catalogue QCM</span>
              </div>
              <Link to="/admin/qcm/questions" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                Gérer <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {/* Active ratio bar */}
              <div>
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>Questions actives</span>
                  <span>{qcmActive} / {qcmTotal}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${activeRatio}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Inactives</p>
                <p className="text-xl font-black text-white/60">{qcmInactive}</p>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Catégories</p>
                <p className="text-xl font-black text-white/60">{s.totalQcmCategories ?? 0}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-white/[0.05]">
              <Link to="/admin/qcm/categories" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/50 border border-white/[0.07] hover:text-white/80 hover:border-white/20 transition-colors">
                <TrendingUp className="h-3 w-3" /> Catégories
              </Link>
              <Link to="/admin/qcm/tags" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/50 border border-white/[0.07] hover:text-white/80 hover:border-white/20 transition-colors">
                <Tag className="h-3 w-3" /> Tags
              </Link>
              <Link to="/admin/qcm/sessions" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/50 border border-white/[0.07] hover:text-white/80 hover:border-white/20 transition-colors">
                <BarChart2 className="h-3 w-3" /> Sessions
              </Link>
            </div>
          </div>

          {/* Smatch breakdown */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-pink-400" />
                <span className="text-sm font-black text-white/80">Catalogue Smatch</span>
              </div>
              <Link to="/admin/smatch/decks" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                Gérer <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {/* Deck active ratio bar */}
              {(() => {
                const total = s.totalSmatchDecks ?? 0;
                const active = s.activeSmatchDecks ?? 0;
                const ratio = total > 0 ? Math.round((active / total) * 100) : 0;
                return (
                  <div>
                    <div className="flex justify-between text-xs text-white/40 mb-1">
                      <span>Decks actifs</span>
                      <span>{active} / {total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Paires</p>
                <p className="text-xl font-black text-white/60">{s.totalSmatchPairs ?? 0}</p>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Sessions</p>
                <p className="text-xl font-black text-white/60">{s.totalSmatchSessions ?? 0}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-white/[0.05]">
              <Link to="/admin/smatch/decks" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/50 border border-white/[0.07] hover:text-white/80 hover:border-white/20 transition-colors">
                <Layers className="h-3 w-3" /> Decks
              </Link>
              <Link to="/admin/smatch/sessions" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/50 border border-white/[0.07] hover:text-white/80 hover:border-white/20 transition-colors">
                <BarChart2 className="h-3 w-3" /> Sessions
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div>
        <SectionLabel>Actions rapides</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Link
            to="/admin/qcm/questions/new"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors group"
          >
            <Plus className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-bold text-white/70 group-hover:text-white/90">Nouvelle question</span>
          </Link>

          <Link
            to="/admin/qcm/contributions"
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-colors group ${
              pending > 0
                ? "bg-amber-500/10 border-amber-500/25 hover:bg-amber-500/20"
                : "bg-white/[0.02] border-white/[0.07] hover:border-white/20"
            }`}
          >
            <Inbox className={`h-4 w-4 shrink-0 ${pending > 0 ? "text-amber-400" : "text-white/40"}`} />
            <span className={`text-sm font-bold group-hover:text-white/90 ${pending > 0 ? "text-amber-300" : "text-white/70"}`}>
              {pending > 0 ? `Contributions (${pending})` : "Contributions"}
            </span>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-white/20 transition-colors group"
          >
            <Users className="h-4 w-4 text-white/40 shrink-0" />
            <span className="text-sm font-bold text-white/70 group-hover:text-white/90">Utilisateurs</span>
          </Link>

          <Link
            to="/admin/smatch/decks"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-white/20 transition-colors group"
          >
            <Layers className="h-4 w-4 text-white/40 shrink-0" />
            <span className="text-sm font-bold text-white/70 group-hover:text-white/90">Decks Smatch</span>
          </Link>
        </div>
      </div>

      {/* ── Platform status footer ── */}
      {!loading && (
        <div className="flex items-center gap-2 text-xs text-white/20">
          <CheckCircle2 className={`h-3.5 w-3.5 ${pending === 0 ? "text-emerald-500/50" : "text-amber-500/50"}`} />
          {pending === 0
            ? "Aucune action en attente — plateforme à jour"
            : `${pending} contribution${pending > 1 ? "s" : ""} en attente de validation`
          }
        </div>
      )}
    </div>
  );
}
