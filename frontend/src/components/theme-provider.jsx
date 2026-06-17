import { createContext, useContext, useEffect } from "react";

const ThemeProviderContext = createContext({ theme: "dark", setTheme: () => null });

export function ThemeProvider({ children, ...props }) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "system");
    root.classList.add("dark");
    localStorage.setItem("vite-ui-theme", "dark");
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme: "dark", setTheme: () => null }} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeProviderContext);
}
