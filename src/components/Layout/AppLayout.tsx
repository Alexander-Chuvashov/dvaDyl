// src/components/Layout/AppLayout.tsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabaseClient';
import {
    Home,
    BarChart3,
    Trophy,
    BookOpen,
    LogOut,
    User,
    Flame,
    Star,
    Settings,
    Sun,
    Moon,
} from 'lucide-react';
// import Tooltip from '../UI/Tooltip';

interface NavLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, badge }) => {
    return (
        <Link
            to={to}
            className="flex flex-col items-center gap-0.5 text-secondary hover:text-gold transition-colors relative"
            title={label}
        >
            <div className="relative">
                {icon}
                {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-error text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {badge}
                    </span>
                )}
            </div>
            <span className="text-[10px] font-medium hidden sm:block">
                {label}
            </span>
        </Link>
    );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        isAuthenticated,
        resetAll,
        xp,
        streak,
        username,
        theme,
        toggleTheme,
        dbUserWords,
    } = useAppStore();
    const learnedCount = Object.keys(dbUserWords).length;
    const navigate = useNavigate();

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, [theme]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        resetAll();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-primary">
                <header className="px-4 py-3 border-b border-gold/10 bg-card">
                    <div className="flex items-center max-w-6xl gap-3 mx-auto">
                        <Link to="/" className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt="DVA-DYL"
                                className="w-auto h-8 sm:h-10"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-primary sm:text-xl">
                                    DVA-DYL
                                </h1>
                                <span className="text-xs font-medium text-gold sm:text-sm">
                                    Тувинский язык
                                </span>
                            </div>
                        </Link>
                    </div>
                </header>
                <main className="max-w-6xl px-4 py-6 mx-auto sm:py-8">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary">
            <header className="sticky top-0 z-50 px-3 py-2 border-b border-gold/10 bg-card shadow-card sm:py-3 sm:px-4">
                <div className="flex items-center justify-between max-w-6xl gap-2 mx-auto sm:gap-4">
                    {/* Логотип */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 shrink-0 sm:gap-3"
                    >
                        <img
                            src="/images/logo.png"
                            alt="DVA-DYL"
                            className="w-auto h-8 sm:h-10"
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-base font-bold leading-tight text-primary sm:text-lg">
                                DVA-DYL
                            </h1>
                            <span className="text-xs font-medium text-gold">
                                Тувинский язык
                            </span>
                        </div>
                    </Link>

                    {/* Навигация */}
                    <nav className="flex items-center gap-1 sm:gap-3 md:gap-4">
                        <NavLink
                            to="/"
                            icon={<Home className="w-5 h-5" />}
                            label="Главная"
                        />
                        <NavLink
                            to="/stats"
                            icon={<BarChart3 className="w-5 h-5" />}
                            label="Статистика"
                        />
                        <NavLink
                            to="/achievements"
                            icon={<Trophy className="w-5 h-5" />}
                            label="Достижения"
                        />
                        <NavLink
                            to="/learned-words"
                            icon={<BookOpen className="w-5 h-5" />}
                            label="Слова"
                            badge={learnedCount}
                        />
                        <NavLink
                            to="/settings"
                            icon={<Settings className="w-5 h-5" />}
                            label="Настройки"
                        />
                    </nav>

                    {/* Профиль и управление */}
                    <div className="flex items-center gap-1 shrink-0 sm:gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 rounded-full border border-gold/10 bg-primary sm:px-3 sm:py-1.5">
                            <Star className="w-4 h-4 text-gold fill-gold" />
                            <span className="hidden font-bold text-primary sm:inline">
                                {xp}
                            </span>
                            <Flame className="w-4 h-4 text-gold" />
                            <span className="hidden font-bold text-gold sm:inline">
                                {streak}
                            </span>
                            <User className="hidden w-4 h-4 text-secondary md:inline" />
                            <span className="hidden font-medium text-primary md:inline">
                                {username || 'Путник'}
                            </span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-full hover:bg-primary/10 transition-colors text-secondary hover:text-gold sm:p-2"
                            title={
                                theme === 'dark'
                                    ? 'Светлая тема'
                                    : 'Тёмная тема'
                            }
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-full hover:bg-primary/10 transition-colors text-secondary hover:text-gold sm:p-2"
                            title="Выйти"
                        >
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl px-4 py-6 mx-auto sm:py-8">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;
