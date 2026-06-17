import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Check, ChevronLeft } from "lucide-react";
import adminService from "@/services/admin.service";

const emptyAnswer = { content: "", isCorrect: false };

const emptyForm = {
  content: "",
  explanation: "",
  hint: "",
  categoryId: "",
  level: "EASY",
  status: "ACTIVE",
  tagIds: [],
  answers: [
    { content: "", isCorrect: true },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ],
};

export default function AdminQcmQuestionEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const catProm = adminService.getQcmCategories().then(r => setCategories(r.data ?? []));
    const tagProm = adminService.getQcmTags().then(r => setTags(r.data ?? []));

    if (isEdit) {
      Promise.all([catProm, tagProm, adminService.getQcmQuestion(id)])
        .then(([, , qRes]) => {
          const q = qRes.data;
          setForm({
            content: q.content ?? "",
            explanation: q.explanation ?? "",
            hint: q.hint ?? "",
            categoryId: q.categoryId ?? "",
            level: q.level ?? "EASY",
            status: q.status ?? "ACTIVE",
            tagIds: q.tags?.map(t => t.id) ?? [],
            answers: q.answers?.length
              ? q.answers.map(a => ({ content: a.content, isCorrect: a.isCorrect }))
              : emptyForm.answers,
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      Promise.all([catProm, tagProm]).then(() => {}).catch(() => {});
    }
  }, [id]);

  const setAnswer = (idx, field, value) => {
    setForm(f => ({
      ...f,
      answers: f.answers.map((a, i) => i === idx ? { ...a, [field]: value } : a),
    }));
  };

  const markCorrect = (idx) => {
    setForm(f => ({
      ...f,
      answers: f.answers.map((a, i) => ({ ...a, isCorrect: i === idx })),
    }));
  };

  const addAnswer = () => {
    setForm(f => ({ ...f, answers: [...f.answers, { content: "", isCorrect: false }] }));
  };

  const removeAnswer = (idx) => {
    if (form.answers.length <= 2) return;
    setForm(f => ({ ...f, answers: f.answers.filter((_, i) => i !== idx) }));
  };

  const toggleTag = (tagId) => {
    setForm(f => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter(id => id !== tagId)
        : [...f.tagIds, tagId],
    }));
  };

  const handleSave = async () => {
    if (!form.content.trim()) { setError("Question content is required"); return; }
    if (!form.categoryId) { setError("Category is required"); return; }
    if (!form.answers.some(a => a.isCorrect)) { setError("At least one answer must be marked as correct"); return; }
    if (form.answers.some(a => !a.content.trim())) { setError("All answer fields must be filled"); return; }

    setSaving(true); setError("");
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        answers: form.answers,
      };
      if (isEdit) await adminService.updateQcmQuestion(id, payload);
      else await adminService.createQcmQuestion(payload);
      navigate("/admin/qcm/questions");
    } catch (e) {
      setError(e?.response?.data?.message ?? "An error occurred");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  const filteredTags = form.categoryId
    ? tags.filter(t => !t.categoryId || String(t.categoryId) === String(form.categoryId))
    : tags;

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => navigate("/admin/qcm/questions")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to questions
      </button>

      <h2 className="text-lg font-bold">{isEdit ? "Edit Question" : "New Question"}</h2>

      {/* Question content */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Question</h3>
        <div>
          <label className="block text-xs font-medium mb-1">Content *</label>
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={3}
            placeholder="Write your question here…"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Category *</label>
            <select
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value, tagIds: [] }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Level</label>
            <select
              value={form.level}
              onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Review</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Hint</label>
          <input value={form.hint} onChange={e => setForm(f => ({ ...f, hint: e.target.value }))} placeholder="Optional hint for players" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Explanation</label>
          <textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} rows={2} placeholder="Shown after answering" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
        </div>
      </div>

      {/* Answers */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">Answers</h3>
        <p className="text-xs text-muted-foreground">Click the circle to mark the correct answer.</p>
        {form.answers.map((ans, i) => (
          <div key={i} className="flex items-center gap-3">
            <button
              onClick={() => markCorrect(i)}
              className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${ans.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-border hover:border-primary"}`}
            >
              {ans.isCorrect && <Check className="h-3 w-3 text-white" />}
            </button>
            <input
              value={ans.content}
              onChange={e => setAnswer(i, "content", e.target.value)}
              placeholder={`Answer ${i + 1}`}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button onClick={() => removeAnswer(i)} disabled={form.answers.length <= 2} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {form.answers.length < 6 && (
          <button onClick={addAnswer} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
            <Plus className="h-4 w-4" /> Add answer
          </button>
        )}
      </div>

      {/* Tags */}
      {filteredTags.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {filteredTags.map(t => (
              <button
                key={t.id}
                onClick={() => toggleTag(t.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.tagIds.includes(t.id) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button onClick={() => navigate("/admin/qcm/questions")} className="px-5 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">
          Cancel
        </button>
        <button disabled={saving} onClick={handleSave} className="px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create question"}
        </button>
      </div>
    </div>
  );
}
