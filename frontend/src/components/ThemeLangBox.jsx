import { Sun, Moon } from "lucide-react"; // Standard 2026
import { useTheme } from "./theme-provider";

const ThemeLangBox = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center p-1 bg-muted/30 backdrop-blur-md border border-border/50 rounded-full">
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-background shadow-sm text-foreground transition-all hover:scale-110 active:scale-95"
      >
        {theme === "light" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
};

export default ThemeLangBox;
