import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import adminService from "@/services/admin.service";

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const empty = { name: "", slug: "", description: "", categoryId: "", isActive: true };

export default function AdminQcmTags() {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminService.getQcmTags(categoryFilter ? { categoryId: categoryFilter } : {}),
      adminService.getQcmCategories(),
    ])
      .then(([tagsRes, catsRes]) => {
        setTags(tagsRes.data ?? []);
        setCategories(catsRes.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [categoryFilter]);

  const openCreate = () => { setForm(empty); setError(""); setModal({ mode: "create" }); };
  const openEdit = (tag) => {
    setForm({ name: tag.name, slug: tag.slug ?? "", description: tag.description ?? "", categoryId: tag.categoryId ?? "", isActive: tag.isActive });
    setError("");
    setModal({ mode: "edit", id: tag.id });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Le nom est obligatoire"); return; }
    setSaving(true); setError("");
    try {
      const payload = { ...form, categoryId: form.categoryId ? Number(form.categoryId) : null };
      if (modal.mode === "create") await adminService.createQcmTag(payload);
      else await adminService.updateQcmTag(modal.id, payload);
      setModal(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Une erreur est survenue");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteQcmTag(id);
      setTags(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message ?? "Impossible de supprimer le tag");
    }
    setConfirmDelete(null);
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
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Tag
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Questions</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 4 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
              ))
            ) : tags.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No tags yet</td></tr>
            ) : (
              tags.map(tag => (
                <tr key={tag.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{tag.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{tag.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{tag.categoryName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{tag.questionCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tag.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                      {tag.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(tag)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setConfirmDelete(tag)} className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{tags.length} tag{tags.length !== 1 ? "s" : ""}</p>

      {modal && (
        <Modal title={modal.mode === "create" ? "New Tag" : "Edit Tag"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Algebra" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="tagActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
              <label htmlFor="tagActive" className="text-sm">Active</label>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
              <button disabled={saving} onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Tag?" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-muted-foreground mb-4">Delete <strong>{confirmDelete.name}</strong>? This may affect questions using this tag.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
            <button onClick={() => handleDelete(confirmDelete.id)} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
