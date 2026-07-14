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
    Sparkles,
    MapPin,
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { xp, streak, completedLessonIds, dailyGoal } =
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
    const totalChapters = chapters.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-gold animate-pulse">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* ===== ПРИВЕТСТВЕННЫЙ БАННЕР ===== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A0F1C] via-[#121A2E] to-[#1A2744] border border-gold/20 p-8 md:p-12 shadow-2xl"
            >
                {/* Декоративные элементы */}
                <div className="absolute top-0 right-0 rounded-full w-96 h-96 bg-gold/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-500/5 blur-2xl" />
                <div className="absolute w-full h-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-gradient-to-r from-gold/5 via-transparent to-gold/5 blur-2xl" />

                {/* Парящие частицы */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-gold/40"
                            initial={{
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%',
                                opacity: Math.random() * 0.5 + 0.2,
                            }}
                            animate={{
                                y: ['0%', '30%', '0%'],
                                opacity: [0.2, 0.6, 0.2],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 6,
                                repeat: Infinity,
                                delay: Math.random() * 4,
                            }}
                            style={{
                                width: Math.random() * 4 + 2 + 'px',
                                height: Math.random() * 4 + 2 + 'px',
                            }}
                        />
                    ))}
                </div>

                <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-gold" />
                            <h1 className="text-4xl font-bold md:text-5xl text-text-primary">
                                Добро пожаловать в{' '}
                                <span className="text-gold">DVA-DYL</span>!
                            </h1>
                        </div>
                        <p className="max-w-2xl text-lg text-text-secondary">
                            Изучай тувинский язык с увлекательными уроками,
                            геймификацией и системой повторений.
                        </p>

                        <div className="flex flex-wrap gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-gold/10">
                                    <BookOpen className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-text-primary">
                                        {totalChapters}
                                    </div>
                                    <div className="text-xs text-text-secondary">
                                        глав
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-gold/10">
                                    <MapPin className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-text-primary">
                                        {totalLessons}
                                    </div>
                                    <div className="text-xs text-text-secondary">
                                        уроков
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-gold/10">
                                    <Star className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-text-primary">
                                        {xp}
                                    </div>
                                    <div className="text-xs text-text-secondary">
                                        XP
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-gold/10">
                                    <Flame className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-text-primary">
                                        {streak}
                                    </div>
                                    <div className="text-xs text-text-secondary">
                                        дней
                                    </div>
                                </div>
                            </div>
                        </div>

                        {nextLesson && (
                            <button
                                onClick={() =>
                                    navigate(
                                        `/chapter/${nextLesson.chapterId}/lesson/${nextLesson.lesson.id}`,
                                    )
                                }
                                className="flex items-center gap-2 mt-2 text-base btn-primary"
                            >
                                🚀 Продолжить обучение{' '}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Персонаж с анимацией */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="shrink-0"
                    >
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 3, -3, 0],
                            }}
                            transition={{
                                y: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                },
                                rotate: {
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                },
                            }}
                        >
                            <Character state="happy" size="sm" />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ===== Блок цели и графика ===== */}
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

            {/* ===== Продолжить урок (дублируем на случай, если nextLesson есть, но баннер уже содержит кнопку) ===== */}
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

            {/* ===== Карта уровней ===== */}
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

            {/* ===== Прогресс по главам ===== */}
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

            {/* ===== Статистика (4 карточки) ===== */}
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
