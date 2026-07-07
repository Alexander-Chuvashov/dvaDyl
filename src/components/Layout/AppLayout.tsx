import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import StatsHeader from './StatsHeader';
import { supabase } from '../../lib/supabaseClient';
import { LogOut, Moon, Sun, Settings } from 'lucide-react';

import { Link } from 'react-router-dom';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, resetAll } = useAppStore();
    const [isDark, setIsDark] = useState(() => {
        // Читаем тему из localStorage
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        // Применяем тему к html
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        resetAll();
    };

    return (
        <div className="min-h-screen bg-cream">
            <header className="px-6 py-4 border-b bg-surface shadow-card border-cream">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🐴</span>
                        <div>
                            <h1 className="text-2xl font-bold text-dark">
                                DVA-DYL
                            </h1>
                            <span className="text-sm font-medium text-terracotta">
                                Тувинский язык
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/review"
                                    className="p-2 transition-colors rounded-full hover:bg-cream"
                                    title="Повторение"
                                >
                                    <span className="text-xl">🔄</span>
                                </Link>
                                <Link
                                    to="/achievements"
                                    className="p-2 transition-colors rounded-full hover:bg-cream"
                                    title="Достижения"
                                >
                                    <span className="text-xl">🏆</span>
                                </Link>
                                <Link
                                    to="/settings"
                                    className="p-2 transition-colors rounded-full hover:bg-cream"
                                    title="Настройки"
                                >
                                    <Settings className="w-5 h-5 text-dark/60" />
                                </Link>
                                <StatsHeader />
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 transition-colors rounded-full hover:bg-cream"
                                    title={
                                        isDark ? 'Светлая тема' : 'Тёмная тема'
                                    }
                                >
                                    {isDark ? (
                                        <Sun className="w-5 h-5 text-gold" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-dark/60" />
                                    )}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 transition-colors rounded-full hover:bg-cream"
                                    title="Выйти"
                                >
                                    <LogOut className="w-5 h-5 text-dark/60" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main className="max-w-6xl px-4 py-8 mx-auto">{children}</main>
        </div>
    );
};

export default AppLayout;
