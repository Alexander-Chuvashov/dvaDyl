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
    LineChart,
    Line,
} from 'recharts';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import { loadAllChapters } from '../services/ContentService';
import type { Chapter } from '../types/content';

const StatsPage: React.FC = () => {
    const { userId, xp, streak, completedLessonIds, dailyGoal } = useAppStore();
    const [dailyActivity, setDailyActivity] = useState<
        { date: string; xp: number }[]
    >([]);
    const [levelStats, setLevelStats] = useState<
        { name: string; value: number }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [totalLessons, setTotalLessons] = useState(0);

    useEffect(() => {
        if (!userId) return;
        const loadStats = async () => {
            try {
                // Загружаем XP за последние 7 дней
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

                // Группируем по дням
                const dailyMap: Record<string, number> = {};
                logs?.forEach(log => {
                    const date = new Date(log.created_at)
                        .toISOString()
                        .split('T')[0];
                    dailyMap[date] = (dailyMap[date] || 0) + log.amount;
                });

                // Заполняем пропущенные дни нулями
                const today = new Date();
                const dates: string[] = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    dates.push(d.toISOString().split('T')[0]);
                }
                const dailyData = dates.map(date => ({
                    date,
                    xp: dailyMap[date] || 0,
                }));

                setDailyActivity(dailyData);

                // Статистика по уровням
                const chapters = await loadAllChapters();
                const allLessons = chapters.flatMap(
                    ch =>
                        ch.lessons?.filter(item => item.type === 'lesson') ||
                        [],
                );
                setTotalLessons(allLessons.length);

                const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
                const levelData = levels.map(level => {
                    const levelChapters = chapters.filter(
                        ch => ch.level === level,
                    );
                    const lessonIds = levelChapters.flatMap(
                        ch =>
                            ch.lessons
                                ?.filter(item => item.type === 'lesson')
                                .map(l => l.id) || [],
                    );
                    const completed = lessonIds.filter(id =>
                        completedLessonIds.includes(id),
                    ).length;
                    return { name: level, value: completed };
                });
                setLevelStats(levelData);
            } catch (error) {
                console.error('Ошибка загрузки статистики:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [userId, completedLessonIds]);

    const COLORS = ['#B8734A', '#C9A961', '#556B4A', '#8B5A3A', '#A8884A'];
    const totalCompleted = completedLessonIds.length;

    if (loading) {
        return <div className="py-10 text-center">Загрузка статистики...</div>;
    }

    return (
        <div className="max-w-4xl p-6 mx-auto">
            <AnimatedWrapper animation="slideUp">
                <h1 className="mb-6 text-3xl font-bold text-dark">
                    📊 Статистика
                </h1>
            </AnimatedWrapper>

            {/* Общая статистика */}
            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                <div className="text-center card">
                    <div className="text-2xl font-bold text-dark">{xp}</div>
                    <div className="text-sm text-dark/60">Всего XP</div>
                </div>
                <div className="text-center card">
                    <div className="text-2xl font-bold text-dark">
                        {totalCompleted}
                    </div>
                    <div className="text-sm text-dark/60">Пройдено уроков</div>
                    <div className="text-xs text-dark/40">
                        из {totalLessons}
                    </div>
                </div>
                <div className="text-center card">
                    <div className="text-2xl font-bold text-terracotta">
                        {streak}
                    </div>
                    <div className="text-sm text-dark/60">Дней подряд</div>
                </div>
                <div className="text-center card">
                    <div className="text-2xl font-bold text-gold">
                        {dailyGoal}
                    </div>
                    <div className="text-sm text-dark/60">Цель на день</div>
                </div>
            </div>

            {/* График активности */}
            <div className="mb-6 card">
                <h2 className="mb-4 text-xl font-semibold text-dark">
                    Активность за последние 7 дней
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                        <XAxis
                            dataKey="date"
                            stroke="#2C241B"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis stroke="#2C241B" tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#F5EFE4',
                                borderColor: '#E8DCC8',
                            }}
                            labelStyle={{ color: '#2C241B' }}
                        />
                        <Bar
                            dataKey="xp"
                            fill="#B8734A"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Прогресс по уровням */}
            <div className="mb-6 card">
                <h2 className="mb-4 text-xl font-semibold text-dark">
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
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1">
                        {levelStats.map((level, index) => (
                            <div
                                key={level.name}
                                className="flex items-center gap-3 mb-2"
                            >
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: COLORS[index] }}
                                />
                                <span className="text-dark">{level.name}</span>
                                <span className="ml-auto text-dark/70">
                                    {level.value} уроков
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Прогресс по главам */}
            <div className="card">
                <h2 className="mb-4 text-xl font-semibold text-dark">
                    Прогресс по главам
                </h2>
                <div className="space-y-2">
                    {levelStats.map((level, index) => (
                        <div key={level.name}>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">
                                    {level.name}
                                </span>
                                <span>{level.value} уроков</span>
                            </div>
                            <div className="w-full h-2 mt-1 overflow-hidden rounded-full bg-cream">
                                <div
                                    className="h-full transition-all duration-500 rounded-full"
                                    style={{
                                        width: `${Math.min(100, Math.round((level.value / 10) * 100))}%`,
                                        backgroundColor:
                                            COLORS[index % COLORS.length],
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
