import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, Download, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import adminService from "@/services/admin.service";

const LEVEL_COLORS = {
  EASY: "bg-emerald-500/10 text-emerald-500",
  MEDIUM: "bg-yellow-500/10 text-yellow-500",
  HARD: "bg-red-500/10 text-red-500",
};

const STATUS_COLORS = {
  ACTIVE: "bg-emerald-500/10 text-emerald-500",
  ARCHIVED: "bg-muted text-muted-foreground",
  DRAFT: "bg-yellow-500/10 text-yellow-500",
  REVIEW: "bg-blue-500/10 text-blue-500",
};

function ImportModal({ onClose, categories }) {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setParseError("");
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target.result;
        let data;
        if (f.name.endsWith(".json")) {
          data = JSON.parse(raw);
          if (!Array.isArray(data)) data = [data];
        } else {
          const lines = raw.split("\n").filter(l => l.trim() && !l.startsWith("#"));
          data = lines.map(line => {
            const cols = line.split("\t").map(s => s.trim());
            return {
              content: cols[0] || "",
              level: (cols[1] || "EASY").toUpperCase(),
              categoryId: Number(cols[2]) || null,
              answers: [],
            };
          });
        }
        setParsed(data);
      } catch (err) {
        setParseError("Impossible de lire le fichier : " + err.message);
      }
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!parsed?.length) return;
    setImporting(true);
    try {
      const r = await adminService.importQcmQuestions(parsed);
      setResult(r.data);
    } catch (err) {
      setParseError(err?.message || "Importation échouée");
    }
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="font-bold text-sm">Importer des questions</p>
            <p className="text-xs text-muted-foreground mt-0.5">JSON · <code className="font-mono">category</code> par nom · <code className="font-mono">tags</code> auto-créés</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!result ? (
            <>
              <div
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/10 p-8 text-center cursor-pointer transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">{file ? file.name : "Cliquer pour sélectionner un fichier"}</p>
                <p className="text-xs text-muted-foreground mt-1">JSON ou TSV</p>
                <input ref={inputRef} type="file" accept=".json,.tsv,.txt" className="hidden"
                  onChange={e => handleFile(e.target.files[0])} />
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground/70 mb-1.5">Format JSON attendu :</p>
                <pre className="font-mono text-[10px] leading-relaxed overflow-x-auto whitespace-pre-wrap">{`[{
  "content": "Question ?",
  "category": "JavaScript",   ← nom exact d'une catégorie existante
  "level": "EASY",
  "tags": ["react", "hooks"], ← créés auto en minuscules si absents
  "answers": [
    { "content": "Réponse A", "isCorrect": true },
    { "content": "Réponse B", "isCorrect": false }
  ],
  "hint": "...",        ← optionnel
  "explanation": "..."  ← optionnel
}]`}</pre>
              </div>

              {parseError && (
                <div className="flex items-start gap-2 text-red-400 text-xs rounded-xl border border-red-500/20 bg-red-500/8 p-3">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {parsed && !parseError && (
                <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1">
                  <p className="text-sm font-semibold">{parsed.length} question{parsed.length !== 1 ? 's' : ''} détectée{parsed.length !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-muted-foreground">
                    Les lignes JSON valides seront importées. Les lignes avec des champs manquants seront ignorées.
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted transition-colors">
                  Annuler
                </button>
                <button
                  disabled={!parsed || importing}
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {importing ? "Importation..." : `Importer ${parsed?.length ?? 0}`}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-4 text-center">
                <p className="text-2xl font-black text-emerald-400">{result.imported}</p>
                <p className="text-sm text-muted-foreground mt-1">question{result.imported !== 1 ? 's' : ''} importée{result.imported !== 1 ? 's' : ''}</p>
              </div>
              {result.errors?.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-3 space-y-1">
                  <p className="text-xs font-semibold text-red-400">{result.errors.length} erreur{result.errors.length !== 1 ? 's' : ''} :</p>
                  {result.errors.map((e, i) => <p key={i} className="text-xs text-muted-foreground">{e}</p>)}
                </div>
              )}
              <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
                Terminé
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminQcmQuestions() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const load = () => {
    setLoading(true);
    const params = {};
    if (categoryFilter) params.categoryId = categoryFilter;
    if (levelFilter) params.level = levelFilter;
    if (statusFilter) params.status = statusFilter;
    Promise.all([
      adminService.getQcmQuestions(params),
      adminService.getQcmCategories(),
    ])
      .then(([qRes, cRes]) => {
        setQuestions(qRes.data ?? []);
        setCategories(cRes.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [categoryFilter, levelFilter, statusFilter]);

  const handleStatusToggle = async (q) => {
    const newStatus = q.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    try {
      await adminService.updateQcmQuestionStatus(q.id, newStatus);
      setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, status: newStatus } : x));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteQcmQuestion(id);
      setQuestions(prev => prev.filter(x => x.id !== id));
    } catch (e) {
      alert(e?.message ?? "Impossible de supprimer");
    }
    setConfirmDelete(null);
  };

  const handleExport = () => {
    const toExport = filtered.map(q => ({
      content: q.content,
      level: q.level,
      categoryId: q.categoryId,
      categoryName: q.categoryName,
      status: q.status,
    }));
    const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qcm-questions-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = questions.filter(q =>
    !search || q.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Filters + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 w-44" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40">
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40">
            <option value="">All levels</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Review</option>
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-border bg-card hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-border bg-card hover:bg-muted transition-colors">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <Link to="/admin/qcm/questions/new"
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" /> New
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 4 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No questions found</td></tr>
              ) : (
                filtered.map(q => (
                  <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium truncate" title={q.content}>{q.content}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {q.answersCount > 0 && <span className="text-xs text-muted-foreground">{q.answersCount} answers</span>}
                        {q.tagsCount > 0 && <span className="text-xs text-muted-foreground">{q.tagsCount} tags</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{q.categoryName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${LEVEL_COLORS[q.level] ?? "bg-muted text-muted-foreground"}`}>{q.level}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[q.status] ?? "bg-muted text-muted-foreground"}`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => handleStatusToggle(q)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          {q.status === "ACTIVE" ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                        <Link to={`/admin/qcm/questions/${q.id}/edit`} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => setConfirmDelete(q)} className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500">
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
      <p className="text-xs text-muted-foreground">{filtered.length} question{filtered.length !== 1 ? 's' : ''}</p>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
          <div className="bg-card w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl border border-border p-6 space-y-4">
            <h3 className="font-bold">Delete question?</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{confirmDelete.content}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2.5 text-sm rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)} className="px-4 py-2.5 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <ImportModal
          categories={categories}
          onClose={() => { setShowImport(false); load(); }}
        />
      )}
    </div>
  );
}
