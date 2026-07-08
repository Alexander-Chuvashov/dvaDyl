// src/components/Layout/StatsSummary.tsx
import React from 'react';
import { useAppStore } from '../../store/useAppStore';

const StatsSummary: React.FC = () => {
    const { xp, completedLessonIds, streak, dailyGoal } = useAppStore();

    return (
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
            <div className="text-center card">
                <div className="text-2xl font-bold text-dark">{xp}</div>
                <div className="text-sm text-dark/60">Всего XP</div>
            </div>
            <div className="text-center card">
                <div className="text-2xl font-bold text-dark">
                    {completedLessonIds.length}
                </div>
                <div className="text-sm text-dark/60">Пройдено уроков</div>
            </div>
            <div className="text-center card">
                <div className="text-2xl font-bold text-terracotta">
                    {streak}
                </div>
                <div className="text-sm text-dark/60">Дней подряд</div>
            </div>
            <div className="text-center card">
                <div className="text-2xl font-bold text-gold">{dailyGoal}</div>
                <div className="text-sm text-dark/60">Цель на день</div>
            </div>
        </div>
    );
};

export default StatsSummary;
