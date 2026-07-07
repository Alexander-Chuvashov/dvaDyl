import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(() => {
        // Проверяем localStorage и системные настройки
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') return true;
        if (saved === 'light') return false;
        // Если нет сохранённой темы, проверяем системные настройки
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <button
            onClick={toggleTheme}
            className="p-2 transition-colors rounded-full hover:bg-cream/20"
            title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-gold" />
            ) : (
                <Moon className="w-5 h-5 text-dark/60" />
            )}
        </button>
    );
};

export default ThemeToggle;
