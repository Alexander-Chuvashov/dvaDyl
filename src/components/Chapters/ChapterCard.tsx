import React from 'react';
import type { Chapter } from '../../types/content';
import { useAppStore } from '../../store/useAppStore';
import { useNavigate } from 'react-router-dom';

interface ChapterCardProps {
    chapter: Chapter;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ chapter }) => {
    const navigate = useNavigate();
    const { dbProgress } = useAppStore();

    // Рассчитываем прогресс главы (позже)
    const completedLessons =
        chapter.lessons?.filter(
            item =>
                item.type === 'lesson' &&
                dbProgress[item.id]?.status === 'completed',
        ).length || 0;
    const totalLessons =
        chapter.lessons?.filter(item => item.type === 'lesson').length || 0;
    const progress =
        totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

    return (
        <button
            onClick={() => navigate(`/chapter/${chapter.id}`)}
            className="flex items-center justify-between w-full transition-all card hover:shadow-lg"
        >
            <div className="flex-1 text-left">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">📖</span>
                    <h2 className="text-xl font-semibold text-dark">
                        {chapter.title}
                        <span className="ml-2 text-sm font-medium text-terracotta">
                            {chapter.titleTuvan}
                        </span>
                    </h2>
                </div>
                <p className="mb-2 text-sm text-dark/70">
                    {chapter.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-dark/50">
                    <span>{chapter.lessons?.length || 0} уроков</span>
                    {totalLessons > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-2 overflow-hidden rounded-full bg-cream">
                                <div
                                    className="h-full transition-all duration-500 rounded-full bg-olive"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span>{progress}%</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="text-2xl text-terracotta">→</div>
        </button>
    );
};

export default ChapterCard;
