// src/components/Layout/AppLayout.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabaseClient';
import Mascot from '../UI/Mascot';
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
            className="flex flex-col items-center gap-0.5 text-dark/60 hover:text-terracotta transition-colors relative"
            title={label}
        >
            <div className="relative">
                {icon}
                {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {badge}
                    </span>
                )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, resetAll, xp, streak, errorExercises, username } =
        useAppStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        resetAll();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-cream">
                <header className="px-6 py-4 border-b bg-surface shadow-card border-cream">
                    <div className="flex items-center max-w-6xl gap-3 mx-auto">
                        <Link to="/" className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt="дваДЫЛ"
                                className="w-auto h-20"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-dark">
                                    дваДЫЛ
                                </h1>
                                <span className="text-sm font-medium text-terracotta">
                                    Тувинский язык
                                </span>
                            </div>
                            <Mascot state="idle" size="sm" className="ml-2" />
                        </Link>
                    </div>
                </header>
                <main className="max-w-6xl px-4 py-8 mx-auto">{children}</main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream">
            <header className="sticky top-0 z-40 px-4 py-3 border-b bg-surface shadow-card border-cream">
                <div className="flex items-center justify-between max-w-6xl gap-4 mx-auto">
                    {/* Левая часть: логотип + название (ссылка на главную) */}
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <img
                            src="/images/logo.png"
                            alt="DVA-DYL"
                            className="w-auto h-10"
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold leading-tight text-dark">
                                DVA-DYL
                            </h1>
                            <span className="text-xs font-medium text-terracotta">
                                Тувинский язык
                            </span>
                        </div>
                    </Link>

                    {/* Центр: навигация */}
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

                    {/* Правая часть: профиль и статистика */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-3 text-sm bg-cream/60  px-3 py-1.5 rounded-full">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-gold fill-gold" />
                                <span className="font-bold text-dark">
                                    {xp}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4 text-terracotta" />
                                <span className="font-bold text-terracotta">
                                    {streak}
                                </span>
                            </div>
                            <div className="items-center hidden gap-1 sm:flex">
                                <User className="w-4 h-4 text-dark/60" />
                                <span className="font-medium text-dark/80">
                                    {username || 'Пользователь'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 transition-colors rounded-full hover:bg-cream text-dark/60 hover:text-terracotta"
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
