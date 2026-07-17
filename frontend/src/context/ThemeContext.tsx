import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("itemnest-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("itemnest-theme", isDark ? "dark" : "light");
  }, [isDark]);

  function toggle() {
    setIsDark((prev) => !prev);
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
