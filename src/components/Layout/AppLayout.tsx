// src/components/Layout/AppLayout.tsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabaseClient';
import {
    Home,
    BarChart3,
    Trophy,
    Repeat,
    LogOut,
    User,
    Flame,
    Star,
    Settings,
    Sun,
    Moon,
} from 'lucide-react';

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
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        isAuthenticated,
        resetAll,
        xp,
        streak,
        errorExercises,
        username,
        theme,
        toggleTheme,
    } = useAppStore();
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
                <header className="px-6 py-4 border-b border-gold/10 bg-card">
                    <div className="flex items-center max-w-6xl gap-3 mx-auto">
                        <Link to="/" className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt="DVA-DYL"
                                className="w-auto h-10"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-primary">
                                    DVA-DYL
                                </h1>
                                <span className="text-sm font-medium text-gold">
                                    Тувинский язык
                                </span>
                            </div>
                        </Link>
                    </div>
                </header>
                <main className="max-w-6xl px-4 py-8 mx-auto">{children}</main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary">
            <header className="sticky top-0 z-50 px-4 py-3 border-b border-gold/10 bg-card shadow-card">
                <div className="flex items-center justify-between max-w-6xl gap-4 mx-auto">
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <img
                            src="/images/logo.png"
                            alt="DVA-DYL"
                            className="w-auto h-10"
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold leading-tight text-primary">
                                DVA-DYL
                            </h1>
                            <span className="text-xs font-medium text-gold">
                                Тувинский язык
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-2 md:gap-4">
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
                            to="/repeat-errors"
                            icon={<Repeat className="w-5 h-5" />}
                            label="Ошибки"
                            badge={errorExercises.length}
                        />
                        <NavLink
                            to="/settings"
                            icon={<Settings className="w-5 h-5" />}
                            label="Настройки"
                        />
                    </nav>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-3 text-sm px-3 py-1.5 rounded-full border border-gold/10 bg-primary">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-gold fill-gold" />
                                <span className="font-bold text-primary">
                                    {xp}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4 text-gold" />
                                <span className="font-bold text-gold">
                                    {streak}
                                </span>
                            </div>
                            <div className="items-center hidden gap-1 sm:flex">
                                <User className="w-4 h-4 text-secondary" />
                                <span className="font-medium text-primary">
                                    {username || 'Путник'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 transition-colors rounded-full hover:bg-primary/10 text-secondary hover:text-gold"
                            title={
                                theme === 'dark'
                                    ? 'Светлая тема'
                                    : 'Тёмная тема'
                            }
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 transition-colors rounded-full hover:bg-primary/10 text-secondary hover:text-gold"
                            title="Выйти"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl px-4 py-8 mx-auto">{children}</main>
        </div>
    );
};

export default AppLayout;
