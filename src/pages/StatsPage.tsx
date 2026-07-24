// src/pages/StatsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabaseClient';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import { motion } from 'framer-motion';
import {
    Star,
    Flame,
    BookOpen,
    TrendingUp,
    Calendar,
    Award,
} from 'lucide-react';

const COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6'];

const StatsPage: React.FC = () => {
    const { userId, xp, streak, completedLessonIds, dailyGoal } = useAppStore();
    const [dailyActivity, setDailyActivity] = useState<
        { date: string; xp: number }[]
    >([]);
    const [levelStats, setLevelStats] = useState<
        { name: string; value: number }[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const loadStats = async () => {
            try {
                const { data: logs, error } = await supabase
                    .from('user_xp_log')
                    .select('amount, created_at')
                    .eq('user_id', userId)
                    .gte(
                        'created_at',
                        new Date(
                            Date.now() - 7 * 24 * 60 * 60 * 1000,
                        ).toISOString(),
                    );

                if (error) throw error;

                const dailyMap: Record<string, number> = {};
                logs?.forEach(log => {
                    const date = new Date(log.created_at)
                        .toISOString()
                        .split('T')[0];
                    dailyMap[date] = (dailyMap[date] || 0) + log.amount;
                });

                const dailyData = Object.entries(dailyMap)
                    .map(([date, xp]) => ({ date, xp }))
                    .sort((a, b) => a.date.localeCompare(b.date));

                setDailyActivity(dailyData);

                const allLessons = completedLessonIds.length;
                const levelData = [
                    { name: 'A1', value: Math.min(allLessons, 24) },
                    {
                        name: 'A2',
                        value: Math.max(0, Math.min(allLessons - 24, 21)),
                    },
                    { name: 'B1', value: Math.max(0, allLessons - 45) },
                ];
                setLevelStats(levelData);
            } catch (error) {
                console.error('Ошибка загрузки статистики:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [userId, completedLessonIds]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-sm text-gold animate-pulse sm:text-base">
                    Загрузка статистики...
                </div>
            </div>
        );
    }

    const totalLessons = completedLessonIds.length;

    return (
        <div className="max-w-4xl p-4 mx-auto space-y-6 sm:p-6 sm:space-y-8">
            <AnimatedWrapper animation="slideUp">
                <h1 className="text-2xl font-bold sm:text-3xl text-primary">
                    📊 Статистика
                </h1>
                <p className="mt-1 text-sm sm:text-base text-secondary">
                    Твой прогресс в цифрах
                </p>
            </AnimatedWrapper>

            {/* Основные показатели */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="p-3 text-center card sm:p-4"
                >
                    <Star className="w-6 h-6 mx-auto mb-1 sm:w-8 sm:h-8 text-gold" />
                    <div className="text-lg font-bold sm:text-2xl text-primary">
                        {xp}
                    </div>
                    <div className="text-xs sm:text-sm text-secondary">
                        Всего XP
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="p-3 text-center card sm:p-4"
                >
                    <Flame className="w-6 h-6 mx-auto mb-1 sm:w-8 sm:h-8 text-gold" />
                    <div className="text-lg font-bold sm:text-2xl text-primary">
                        {streak}
                    </div>
                    <div className="text-xs sm:text-sm text-secondary">
                        Дней подряд
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="p-3 text-center card sm:p-4"
                >
                    <BookOpen className="w-6 h-6 mx-auto mb-1 sm:w-8 sm:h-8 text-gold" />
                    <div className="text-lg font-bold sm:text-2xl text-primary">
                        {totalLessons}
                    </div>
                    <div className="text-xs sm:text-sm text-secondary">
                        Пройдено уроков
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="p-3 text-center card sm:p-4"
                >
                    <TrendingUp className="w-6 h-6 mx-auto mb-1 sm:w-8 sm:h-8 text-gold" />
                    <div className="text-lg font-bold sm:text-2xl text-primary">
                        {dailyGoal}
                    </div>
                    <div className="text-xs sm:text-sm text-secondary">
                        Цель на день
                    </div>
                </motion.div>
            </div>

            {/* График активности за 7 дней */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-4 card sm:p-6"
            >
                <h2 className="flex items-center gap-2 mb-3 text-base font-bold sm:text-xl text-primary sm:mb-4">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                    Активность за 7 дней
                </h2>
                <div className="h-40 sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyActivity}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#1A2744"
                            />
                            <XAxis
                                dataKey="date"
                                stroke="#94A3B8"
                                tick={{ fontSize: 10, dy: 5 }}
                            />
                            <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#121A2E',
                                    borderColor: '#F59E0B',
                                    borderRadius: '12px',
                                    color: '#E2E8F0',
                                    fontSize: '12px',
                                }}
                                labelStyle={{ color: '#E2E8F0' }}
                            />
                            <Bar
                                dataKey="xp"
                                fill="#F59E0B"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Распределение по уровням */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="p-4 card sm:p-6"
            >
                <h2 className="flex items-center gap-2 mb-3 text-base font-bold sm:text-xl text-primary sm:mb-4">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                    Прогресс по уровням
                </h2>
                <div className="flex flex-col items-center gap-4 md:flex-row sm:gap-6">
                    <div className="w-40 h-40 sm:w-48 sm:h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={levelStats}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    label={({ name, value }) =>
                                        `${name}: ${value}`
                                    }
                                >
                                    {levelStats.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#121A2E',
                                        borderColor: '#F59E0B',
                                        borderRadius: '12px',
                                        color: '#E2E8F0',
                                        fontSize: '12px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        {levelStats.map((level, index) => (
                            <div
                                key={level.name}
                                className="flex items-center gap-2 sm:gap-3"
                            >
                                <div
                                    className="w-3 h-3 rounded-full sm:w-4 sm:h-4 shrink-0"
                                    style={{
                                        backgroundColor:
                                            COLORS[index % COLORS.length],
                                    }}
                                />
                                <span className="text-sm sm:text-base text-primary">
                                    {level.name}
                                </span>
                                <span className="ml-auto text-xs sm:text-sm text-secondary">
                                    {level.value} уроков
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StatsPage;
