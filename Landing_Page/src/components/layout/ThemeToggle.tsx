"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9" />; // Placeholder
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
        </button>
    );
}
