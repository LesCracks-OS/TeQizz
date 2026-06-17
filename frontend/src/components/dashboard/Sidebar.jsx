import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Play, BarChart3, Trophy, Settings, Info, LogOut, X, Shield, PenLine } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { to: "/dashboard/play",        icon: Play,     label: "Jouer" },
  { to: "/dashboard/performance", icon: BarChart3, label: "Performance" },
  { to: "/dashboard/leaderboard", icon: Trophy,    label: "Classement" },
  { to: "/dashboard/contribute",  icon: PenLine,  label: "Contribuer" },
];

const NAV_SECONDARY_ITEMS = [
  { to: "/dashboard/settings", icon: Settings, label: "Paramètres" },
  { to: "/dashboard/about",    icon: Info,     label: "À propos" },
];

const link = (active) =>
  `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
    active
      ? "bg-white/[0.06] text-white"
      : "text-white/40 hover:text-white/75 hover:bg-white/[0.03]"
  }`;

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();

  const initials = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    return user?.username?.slice(0, 2).toUpperCase() || "U";
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-[240px] flex flex-col border-r border-white/[0.06] transition-transform duration-300 ease-in-out overflow-hidden
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      style={{ background: "#080808" }}
    >
      {/* Ambient top glow */}
      <div className="pointer-events-none absolute -top-16 -left-8 w-48 h-48 rounded-full bg-primary/[0.12] blur-3xl" />

      {/* Logo + mobile close */}
      <div className="relative flex items-center justify-between h-16 px-5 border-b border-white/[0.06] shrink-0">
        <span className="text-xl font-black tracking-tighter text-white">
          TeQizz<span className="text-primary">.</span>
        </span>
        <button
          onClick={onClose}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main nav */}
      <nav className="relative flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-3 mb-3">
          Navigation
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) => link(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
                )}
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Secondary nav */}
      <div className="relative border-t border-white/[0.06] px-3 py-4 space-y-0.5">
        {NAV_SECONDARY_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) => link(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
                )}
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
        {user?.roleName === "ADMIN" && (
          <a href="/admin" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-primary/70 hover:text-primary hover:bg-primary/[0.07] transition-all duration-200">
            <Shield className="h-4 w-4 shrink-0" />
            Admin panel
          </a>
        )}
      </div>

      {/* User */}
      <div className="relative border-t border-white/[0.06] px-3 py-4 space-y-1 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/10">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="text-xs font-black bg-primary/20 text-primary">{initials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/80 truncate">{user?.username || "User"}</p>
            <p className="text-xs text-white/30 truncate">{user?.email || ""}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/30 hover:text-red-400 hover:bg-red-500/[0.07] transition-all duration-200">
          <LogOut className="h-4 w-4 shrink-0" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
