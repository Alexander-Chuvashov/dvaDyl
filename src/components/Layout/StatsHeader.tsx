import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Flame, Star, BookOpen } from 'lucide-react';
import LevelProgressBar from '../UI/LevelProgressBar';
import DailyGoalProgress from '../UI/DailyGoalProgress';

const StatsHeader: React.FC = () => {
    const { xp, completedLessonIds, streak } = useAppStore();

    return (
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-2 text-sm rounded-full bg-cream/60">
                <div className="flex items-center gap-1 text-dark">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="font-bold">{xp}</span>
                    <span className="text-gray-600">XP</span>
                </div>
                <div className="flex items-center gap-1 text-dark">
                    <BookOpen className="w-4 h-4 text-olive" />
                    <span className="font-bold">
                        {completedLessonIds.length}
                    </span>
                    <span className="text-gray-600">уроков</span>
                </div>
                <div className="flex items-center gap-1 text-dark">
                    <Flame className="w-4 h-4 text-terracotta" />
                    <span className="font-bold text-terracotta">{streak}</span>
                    <span className="text-gray-600">дней</span>
                </div>
                <DailyGoalProgress />
            </div>
            {/* Прогресс-бар уровня */}
            <div className="w-32 min-w-[100px]">
                <LevelProgressBar xp={xp} showLevel={false} />
            </div>
        </div>
    );
};

export default StatsHeader;
