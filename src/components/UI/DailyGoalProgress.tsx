import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Target } from 'lucide-react';

interface DailyGoalProgressProps {
    className?: string;
}

const DailyGoalProgress: React.FC<DailyGoalProgressProps> = ({
    className = '',
}) => {
    const { xp, dailyGoal } = useAppStore();
    const [todayXp, setTodayXp] = useState(0);

    // В реальном приложении нужно получать XP за сегодня из БД
    // Пока используем общий XP (для демонстрации, но лучше считать с date)
    // Для простоты будем считать, что весь XP накоплен сегодня (заглушка)
    // В будущем нужно добавить поле "daily_xp" в БД или считать из логов

    useEffect(() => {
        // Здесь можно было бы загружать XP за сегодня из БД (user_xp_log)
        // Пока используем общий XP, но это не совсем правильно
        // Для демонстрации просто берём процент от общего XP
        const today = new Date().toISOString().split('T')[0];
        // Заглушка: считаем, что весь XP накоплен сегодня (для теста)
        setTodayXp(xp);
    }, [xp]);

    const progress = Math.min(100, Math.round((todayXp / dailyGoal) * 100));

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <Target className="w-4 h-4 text-gold" />
            <div className="flex-1 min-w-[100px]">
                <div className="flex justify-between mb-1 text-xs text-dark/60">
                    <span>Дневная цель</span>
                    <span>
                        {todayXp} / {dailyGoal} XP
                    </span>
                </div>
                <div className="w-full h-2 overflow-hidden rounded-full bg-cream">
                    <div
                        className="h-full transition-all duration-700 rounded-full bg-gold"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DailyGoalProgress;
