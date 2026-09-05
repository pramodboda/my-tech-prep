// ThemeToggle.tsx

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode((prev) => !prev)}
      className="
        rounded-lg
        bg-gray-200
        px-4 py-2
        text-gray-900
        hover:bg-gray-300
        dark:bg-gray-800
        dark:text-white
        dark:hover:bg-gray-700
      "
    >
      {darkMode ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
