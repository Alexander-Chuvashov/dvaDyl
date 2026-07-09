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
                <div className="text-gold animate-pulse">
                    Загрузка статистики...
                </div>
            </div>
        );
    }

    const totalLessons = completedLessonIds.length;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <AnimatedWrapper animation="slideUp">
                <h1 className="text-3xl font-bold text-primary">
                    📊 Статистика
                </h1>
                <p className="mt-1 text-secondary">Твой прогресс в цифрах</p>
            </AnimatedWrapper>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="text-center card"
                >
                    <Star className="w-8 h-8 mx-auto mb-1 text-gold" />
                    <div className="text-2xl font-bold text-primary">{xp}</div>
                    <div className="text-sm text-secondary">Всего XP</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
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
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-center card"
                >
                    <BookOpen className="w-8 h-8 mx-auto mb-1 text-gold" />
                    <div className="text-2xl font-bold text-primary">
                        {totalLessons}
                    </div>
                    <div className="text-sm text-secondary">
                        Пройдено уроков
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="text-center card"
                >
                    <TrendingUp className="w-8 h-8 mx-auto mb-1 text-gold" />
                    <div className="text-2xl font-bold text-primary">
                        {dailyGoal}
                    </div>
                    <div className="text-sm text-secondary">Цель на день</div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card"
            >
                <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-primary">
                    <Calendar className="w-5 h-5 text-gold" />
                    Активность за 7 дней
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyActivity}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border-color)"
                        />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-secondary)"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            stroke="var(--text-secondary)"
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--gold)',
                                borderRadius: '12px',
                                color: 'var(--text-primary)',
                            }}
                            labelStyle={{ color: 'var(--text-primary)' }}
                        />
                        <Bar
                            dataKey="xp"
                            fill="var(--gold)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card"
            >
                <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-primary">
                    <Award className="w-5 h-5 text-gold" />
                    Прогресс по уровням
                </h2>
                <div className="flex flex-col items-center gap-6 md:flex-row">
                    <ResponsiveContainer width={200} height={200}>
                        <PieChart>
                            <Pie
                                data={levelStats}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, value }) => `${name}: ${value}`}
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
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--gold)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                        {levelStats.map((level, index) => (
                            <div
                                key={level.name}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{
                                        backgroundColor:
                                            COLORS[index % COLORS.length],
                                    }}
                                />
                                <span className="text-primary">
                                    {level.name}
                                </span>
                                <span className="ml-auto text-secondary">
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
