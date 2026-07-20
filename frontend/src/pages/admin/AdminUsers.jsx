import { useEffect, useState, useCallback } from "react";
import { Shield, ShieldOff, Trash2, Search, ChevronDown } from "lucide-react";
import adminService from "@/services/admin.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/contexts/ToastContext";

function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-muted text-muted-foreground",
    admin: "bg-primary/10 text-primary",
    google: "bg-red-500/10 text-red-500",
    github: "bg-zinc-500/10 text-zinc-400",
    local: "bg-emerald-500/10 text-emerald-500",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[variant] ?? styles.default}`}>
      {children}
    </span>
  );
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getUsers({ search, role: roleFilter })
      .then(r => setUsers(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRoleToggle = async (u) => {
    const newRole = u.roleName === "ADMIN" ? "USER" : "ADMIN";
    setActionLoading(u.id);
    try {
      await adminService.updateUserRole(u.id, newRole);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, roleName: newRole } : x));
      toast.success(`Rôle mis à jour : ${u.username} → ${newRole}`);
    } catch (e) {
      toast.error(e?.message || "Échec de la mise à jour du rôle");
    }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(x => x.id !== id));
      toast.success("Utilisateur supprimé");
    } catch (e) {
      toast.error(e?.message || "Échec de la suppression");
    }
    setConfirmDelete(null);
    setActionLoading(null);
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">All roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isSelf = u.email === currentUser?.email;
                  const isActionLoading = actionLoading === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{u.username}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.roleName === "ADMIN" ? "admin" : "default"}>
                          {u.roleName}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant={u.providerName?.toLowerCase()}>
                          {u.providerName}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {!isSelf && (
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              disabled={isActionLoading}
                              onClick={() => handleRoleToggle(u)}
                              title={u.roleName === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                            >
                              {u.roleName === "ADMIN"
                                ? <ShieldOff className="h-4 w-4" />
                                : <Shield className="h-4 w-4" />}
                            </button>
                            <button
                              disabled={isActionLoading}
                              onClick={() => setConfirmDelete(u)}
                              title="Delete user"
                              className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{users.length} user{users.length !== 1 ? "s" : ""}</p>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 className="font-bold">Delete user?</h3>
            <p className="text-sm text-muted-foreground">
              This will permanently delete <strong>{confirmDelete.username}</strong> and all their data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading === confirmDelete.id}
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {actionLoading === confirmDelete.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
