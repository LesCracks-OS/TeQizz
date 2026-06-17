import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Tag, Folder, FileQuestion, Play,
  BarChart3, Layers, LogOut, Zap, Inbox,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import adminService from "@/services/admin.service";

function usePendingCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    adminService.getContributionsCount()
      .then(r => setCount(r.data?.pending ?? 0))
      .catch(() => {});
    const id = setInterval(() => {
      adminService.getContributionsCount()
        .then(r => setCount(r.data?.pending ?? 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);
  return count;
}

const sections = [
  {
    label: "Plateforme",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/users", label: "Utilisateurs", icon: Users },
    ],
  },
  {
    label: "QCM",
    items: [
      { to: "/admin/qcm/categories", label: "Catégories", icon: Folder },
      { to: "/admin/qcm/tags", label: "Tags", icon: Tag },
      { to: "/admin/qcm/questions", label: "Questions", icon: FileQuestion },
      { to: "/admin/qcm/contributions", label: "Contributions", icon: Inbox, badge: true },
      { to: "/admin/qcm/sessions", label: "Sessions", icon: Play },
    ],
  },
  {
    label: "Smatch",
    items: [
      { to: "/admin/smatch/decks", label: "Decks", icon: Layers },
      { to: "/admin/smatch/sessions", label: "Sessions", icon: BarChart3 },
    ],
  },
];

function NavItem({ to, label, icon: Icon, end = false, badge = false, badgeCount = 0 }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-primary text-primary-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && badgeCount > 0 && (
        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
    </NavLink>
  );
}

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pendingCount = usePendingCount();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r border-border bg-card flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm leading-none">TeQizz</p>
          <p className="text-xs text-muted-foreground mt-0.5">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} {...item} badgeCount={item.badge ? pendingCount : 0} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
