import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/users": "Utilisateurs",
  "/admin/qcm/categories": "QCM · Catégories",
  "/admin/qcm/tags": "QCM · Tags",
  "/admin/qcm/questions/new": "QCM · Nouvelle question",
  "/admin/qcm/questions": "QCM · Questions",
  "/admin/qcm/contributions": "QCM · Contributions",
  "/admin/qcm/sessions": "QCM · Sessions",
  "/admin/smatch/decks/new": "Smatch · Nouveau deck",
  "/admin/smatch/decks": "Smatch · Decks",
  "/admin/smatch/sessions": "Smatch · Sessions",
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const title = Object.entries(pageTitles)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path))?.[1] ?? "Admin";

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <div className="pl-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-foreground">{title}</h1>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {user?.username?.[0]?.toUpperCase() ?? "A"}
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.username}</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
