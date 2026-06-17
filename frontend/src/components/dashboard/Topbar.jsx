import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";

const PAGE_TITLES = {
  "/dashboard/play":        "Play",
  "/dashboard/performance": "Performance",
  "/dashboard/leaderboard": "Leaderboard",
  "/dashboard/settings":    "Paramètres",
  "/dashboard/about":       "À propos",
};

const Topbar = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const title = PAGE_TITLES[pathname]
    ?? (pathname.includes("/smatch/") ? "Smatch"
      : pathname.includes("/qcm/") ? "QCM"
      : "Dashboard");

  const initials = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    return user?.username?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[240px] z-20 h-16 px-5 backdrop-blur-xl border-b border-white/6 flex items-center justify-between"
      style={{ background: "rgba(8,8,8,0.92)" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-white/35 hover:text-white/70 hover:bg-white/6 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-black tracking-tight text-white/90">{title}</h1>
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard/settings')}
        className="flex items-center gap-2.5 group"
      >
        <span className="hidden sm:block text-xs font-semibold text-white/35 group-hover:text-white/70 transition-colors">
          {user?.username}
        </span>
        <Avatar className="h-8 w-8 ring-1 ring-white/10 group-hover:ring-primary/40 transition-all">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback className="text-xs font-black bg-primary/20 text-primary">{initials()}</AvatarFallback>
        </Avatar>
      </button>
    </header>
  );
};

export default Topbar;
