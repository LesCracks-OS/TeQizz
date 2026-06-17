import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, ChevronLeft, Upload } from "lucide-react";
import adminService from "@/services/admin.service";

const emptyDeck = {
  name: "",
  description: "",
  categoryId: "",
  difficulty: "EASY",
  isActive: true,
};

const emptyPair = { term: "", definition: "", hint: "", isActive: true };

export default function AdminSmatchDeckEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [deck, setDeck] = useState(emptyDeck);
  const [pairs, setPairs] = useState([{ ...emptyPair }]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("deck"); // 'deck' | 'pairs'

  useEffect(() => {
    adminService.getQcmCategories().then(r => setCategories(r.data ?? [])).catch(() => {});
    if (isEdit) {
      adminService.getSmatchDeck(id)
        .then(r => {
          const d = r.data;
          setDeck({
            name: d.name,
            description: d.description ?? "",
            categoryId: d.categoryId ?? "",
            difficulty: d.difficulty ?? "EASY",
            isActive: d.isActive,
          });
          setPairs(d.pairs?.length
            ? d.pairs.map(p => ({ id: p.id, term: p.term, definition: p.definition, hint: p.hint ?? "", isActive: p.isActive }))
            : [{ ...emptyPair }]
          );
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const addPair = () => setPairs(p => [...p, { ...emptyPair }]);

  const removePair = (idx) => {
    if (pairs.length === 1) return;
    setPairs(p => p.filter((_, i) => i !== idx));
  };

  const setPairField = (idx, field, value) => {
    setPairs(p => p.map((pair, i) => i === idx ? { ...pair, [field]: value } : pair));
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n").filter(l => l.trim());
      const parsed = lines.map(line => {
        const parts = line.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
        return { term: parts[0] ?? "", definition: parts[1] ?? "", hint: parts[2] ?? "", isActive: true };
      }).filter(p => p.term && p.definition);
      if (parsed.length > 0) {
        setPairs(prev => [...prev.filter(p => p.term), ...parsed]);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!deck.name.trim()) { setError("Deck name is required"); return; }
    const validPairs = pairs.filter(p => p.term.trim() && p.definition.trim());
    if (validPairs.length === 0) { setError("At least one pair with term and definition is required"); return; }

    setSaving(true); setError("");
    try {
      let deckId = id;
      const deckPayload = {
        ...deck,
        categoryId: deck.categoryId ? Number(deck.categoryId) : null,
      };

      if (isEdit) {
        await adminService.updateSmatchDeck(id, deckPayload);
        await adminService.replaceSmatchPairs(id, validPairs.map(p => ({
          term: p.term, definition: p.definition, hint: p.hint || null, isActive: p.isActive,
        })));
      } else {
        const res = await adminService.createSmatchDeck(deckPayload);
        deckId = res.data?.id;
        if (deckId && validPairs.length > 0) {
          await adminService.createSmatchPairsBulk(deckId, validPairs.map(p => ({
            term: p.term, definition: p.definition, hint: p.hint || null, isActive: p.isActive,
          })));
        }
      }
      navigate("/admin/smatch/decks");
    } catch (e) {
      setError(e?.response?.data?.message ?? "An error occurred");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => navigate("/admin/smatch/decks")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to decks
      </button>

      <h2 className="text-lg font-bold">{isEdit ? `Edit: ${deck.name}` : "New Deck"}</h2>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[{ id: "deck", label: "Deck Info" }, { id: "pairs", label: `Pairs (${pairs.filter(p => p.term).length})` }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "deck" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Name *</label>
            <input value={deck.name} onChange={e => setDeck(d => ({ ...d, name: e.target.value }))} placeholder="e.g. French Vocabulary" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <textarea value={deck.description} onChange={e => setDeck(d => ({ ...d, description: e.target.value }))} rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select value={deck.categoryId} onChange={e => setDeck(d => ({ ...d, categoryId: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Difficulty</label>
              <select value={deck.difficulty} onChange={e => setDeck(d => ({ ...d, difficulty: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="deckActive" checked={deck.isActive} onChange={e => setDeck(d => ({ ...d, isActive: e.target.checked }))} className="rounded" />
            <label htmlFor="deckActive" className="text-sm">Active</label>
          </div>
        </div>
      )}

      {tab === "pairs" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{pairs.filter(p => p.term).length} pair{pairs.filter(p => p.term).length !== 1 ? "s" : ""}</p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Import CSV
                <input type="file" accept=".csv,.txt" onChange={handleCSVImport} className="hidden" />
              </label>
              <p className="text-xs text-muted-foreground hidden sm:block">term,definition,hint (one per line)</p>
            </div>
          </div>

          <div className="space-y-2">
            {pairs.map((pair, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Pair {i + 1}</span>
                  <button onClick={() => removePair(i)} disabled={pairs.length === 1} className="text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={pair.term}
                    onChange={e => setPairField(i, "term", e.target.value)}
                    placeholder="Term"
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={pair.definition}
                    onChange={e => setPairField(i, "definition", e.target.value)}
                    placeholder="Definition"
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <input
                  value={pair.hint}
                  onChange={e => setPairField(i, "hint", e.target.value)}
                  placeholder="Hint (optional)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ))}
          </div>

          <button onClick={addPair} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-3 rounded-lg border border-dashed border-border hover:border-primary/50">
            <Plus className="h-4 w-4" /> Add pair
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button onClick={() => navigate("/admin/smatch/decks")} className="px-5 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
        <button disabled={saving} onClick={handleSave} className="px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create deck"}
        </button>
      </div>
    </div>
  );
}
