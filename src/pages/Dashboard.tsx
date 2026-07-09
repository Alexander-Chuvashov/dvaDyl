// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { loadAllChapters } from '../services/ContentService';
import type { Chapter, Lesson } from '../types/content';
import Character from '../components/UI/Character';
import { motion } from 'framer-motion';
import {
    Star,
    Flame,
    BookOpen,
    TrendingUp,
    Lock,
    ChevronRight,
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { xp, streak, completedLessonIds, username, dailyGoal } =
        useAppStore();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextLesson, setNextLesson] = useState<{
        chapterId: string;
        lesson: Lesson;
    } | null>(null);

    useEffect(() => {
        loadAllChapters()
            .then(data => {
                setChapters(data);
                const allLessons: { chapterId: string; lesson: Lesson }[] = [];
                data.forEach(ch => {
                    const lessons =
                        (ch.lessons?.filter(
                            item => item.type === 'lesson',
                        ) as Lesson[]) || [];
                    lessons.forEach(l => {
                        allLessons.push({ chapterId: ch.id, lesson: l });
                    });
                });
                const next = allLessons.find(
                    ({ lesson }) => !completedLessonIds.includes(lesson.id),
                );
                setNextLesson(next || null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [completedLessonIds]);

    // Статистика за неделю (заглушка)
    const weeklyXP = [12, 18, 8, 25, 30, 15, 20];
    const maxXP = Math.max(...weeklyXP, 1);

    // Прогресс по уровням
    const levelProgress = chapters.reduce(
        (acc, ch) => {
            const total =
                ch.lessons?.filter(item => item.type === 'lesson').length || 0;
            const completed =
                ch.lessons?.filter(
                    item =>
                        item.type === 'lesson' &&
                        completedLessonIds.includes(item.id),
                ).length || 0;
            const percent =
                total > 0 ? Math.round((completed / total) * 100) : 0;
            acc[ch.level] = percent;
            return acc;
        },
        {} as Record<string, number>,
    );

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const totalLessons = chapters.reduce(
        (acc, ch) =>
            acc +
            (ch.lessons?.filter(item => item.type === 'lesson').length || 0),
        0,
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-gold animate-pulse">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Приветственный блок */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative p-8 overflow-hidden border rounded-3xl bg-gradient-to-br from-card to-card-hover border-gold/10 md:p-12"
            >
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/5 blur-3xl" />
                <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold md:text-4xl text-primary">
                            🌅 Добро пожаловать, {username || 'Путник'}!
                        </h1>
                        <p className="mt-2 text-lg text-secondary">
                            Продолжим изучение тувинского языка
                        </p>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <span className="tag">
                                📚 {totalLessons} уроков
                            </span>
                            <span className="tag">⭐ {xp} XP</span>
                            <span className="tag-success">
                                🔥 {streak} дней
                            </span>
                        </div>
                    </div>
                    <Character state="idle" size="lg" className="shrink-0" />
                </div>
            </motion.div>

            {/* Блок цели и графика */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-primary">
                            🎯 Ежедневная цель
                        </h3>
                        <span className="text-sm text-secondary">
                            {xp} / {dailyGoal} XP
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${Math.min(100, (xp / dailyGoal) * 100)}%`,
                            }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-secondary">
                        {xp >= dailyGoal
                            ? '✅ Цель выполнена!'
                            : `Осталось ${dailyGoal - xp} XP`}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="card"
                >
                    <h3 className="mb-3 text-lg font-semibold text-primary">
                        📊 Твоя неделя
                    </h3>
                    <div className="flex items-end justify-between h-16 gap-1">
                        {weeklyXP.map((xp, i) => {
                            const height = Math.max(4, (xp / maxXP) * 100);
                            const dayNames = [
                                'Пн',
                                'Вт',
                                'Ср',
                                'Чт',
                                'Пт',
                                'Сб',
                                'Вс',
                            ];
                            return (
                                <div
                                    key={i}
                                    className="flex flex-col items-center flex-1"
                                >
                                    <div
                                        className="w-full max-w-[32px] bg-gold-gradient rounded-t transition-all duration-500 hover:scale-y-110"
                                        style={{ height: `${height}%` }}
                                    />
                                    <span className="text-[10px] text-secondary mt-1">
                                        {dayNames[i]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Продолжить урок */}
            {nextLesson && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="transition-all duration-300 cursor-pointer card-glow hover:border-gold/30"
                    onClick={() =>
                        navigate(
                            `/chapter/${nextLesson.chapterId}/lesson/${nextLesson.lesson.id}`,
                        )
                    }
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-full bg-gold/10">
                                ▶
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary">
                                    Продолжить урок
                                </h3>
                                <p className="text-secondary">
                                    {nextLesson.lesson.title} •{' '}
                                    {nextLesson.lesson.exercises.length}{' '}
                                    упражнений
                                </p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 btn-primary">
                            Продолжить <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Карта уровней */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="card"
            >
                <h3 className="mb-4 text-lg font-semibold text-primary">
                    🗺 Карта глав
                </h3>
                <div className="flex flex-wrap gap-4">
                    {levels.map(level => {
                        const progress = levelProgress[level] || 0;
                        const isLocked = progress === 0 && level !== 'A1';
                        return (
                            <div
                                key={level}
                                className="flex flex-col items-center w-16 gap-1"
                            >
                                <div
                                    className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                                        isLocked
                                            ? 'bg-card-hover text-secondary/30 border border-card-hover'
                                            : progress === 100
                                              ? 'bg-gold-gradient text-primary shadow-gold'
                                              : 'bg-card-hover border border-gold/30 text-gold'
                                    }`}
                                >
                                    {isLocked ? (
                                        <Lock className="w-5 h-5" />
                                    ) : progress > 0 ? (
                                        progress + '%'
                                    ) : (
                                        level
                                    )}
                                </div>
                                <span className="text-xs text-secondary">
                                    {level}
                                </span>
                                {!isLocked && (
                                    <div className="w-full h-1 overflow-hidden rounded-full bg-card-hover">
                                        <div
                                            className="h-full transition-all duration-500 rounded-full bg-gold-gradient"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Прогресс по главам */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card"
            >
                <h3 className="mb-4 text-lg font-semibold text-primary">
                    📖 Прогресс по главам
                </h3>
                <div className="space-y-3">
                    {chapters.map(chapter => {
                        const total =
                            chapter.lessons?.filter(
                                item => item.type === 'lesson',
                            ).length || 0;
                        const completed =
                            chapter.lessons?.filter(
                                item =>
                                    item.type === 'lesson' &&
                                    completedLessonIds.includes(item.id),
                            ).length || 0;
                        const progress =
                            total > 0
                                ? Math.round((completed / total) * 100)
                                : 0;

                        return (
                            <div
                                key={chapter.id}
                                className="flex items-center gap-3 p-3 transition-colors cursor-pointer rounded-xl hover:bg-card-hover"
                                onClick={() =>
                                    navigate(`/chapter/${chapter.id}`)
                                }
                            >
                                <span className="text-xl">{chapter.level}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between text-sm">
                                        <span className="truncate text-primary">
                                            {chapter.title}
                                        </span>
                                        <span className="text-secondary">
                                            {progress}%
                                        </span>
                                    </div>
                                    <div className="mt-1 progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Статистика (4 карточки) */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="text-center card"
                >
                    <Star className="w-8 h-8 mx-auto mb-1 text-gold" />
                    <div className="text-2xl font-bold text-primary">{xp}</div>
                    <div className="text-sm text-secondary">Всего XP</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center card"
                >
                    <Flame className="w-8 h-8 mx-auto mb-1 text-gold" />
                    <div className="text-2xl font-bold text-primary">
                        {streak}
                    </div>
                    <div className="text-sm text-secondary">Дней подряд</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                    className="text-center card"
                >
                    <BookOpen className="w-8 h-8 mx-auto mb-1 text-gold" />
                    <div className="text-2xl font-bold text-primary">
                        {completedLessonIds.length}
                    </div>
                    <div className="text-sm text-secondary">
                        Пройдено уроков
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center card"
                >
                    <TrendingUp className="w-8 h-8 mx-auto mb-1 text-gold" />
                    <div className="text-2xl font-bold text-primary">
                        {totalLessons > 0
                            ? Math.round(
                                  (completedLessonIds.length / totalLessons) *
                                      100,
                              )
                            : 0}
                        %
                    </div>
                    <div className="text-sm text-secondary">Активность</div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
