import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "oled" | "midnight" | "nord" | "mocha";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lifeos-theme") as Theme;
      if (stored) return stored;
      // Default to dark mode regardless of system preference if no stored preference exists
      return "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "theme-oled", "theme-midnight", "theme-nord", "theme-mocha");
    
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.add("dark");
      if (theme !== "dark") {
        root.classList.add(`theme-${theme}`);
      }
    }
    
    localStorage.setItem("lifeos-theme", theme);

    // Update status bar color to match current theme
    const themeColor = theme === "light" ? "#E8F2F8" : 
                       theme === "oled" ? "#000000" :
                       theme === "midnight" ? "#0A0B12" :
                       theme === "nord" ? "#181C25" :
                       theme === "mocha" ? "#1A1918" :
                       "#0A0E1A"; // default dark

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, setTheme, toggleTheme };
}
