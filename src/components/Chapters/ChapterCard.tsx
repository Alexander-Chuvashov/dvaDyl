// src/components/Chapters/ChapterCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Chapter } from '../../types/content';
import { useAppStore } from '../../store/useAppStore';
import { Lock, CheckCircle, BookOpen } from 'lucide-react';

interface ChapterCardProps {
    chapter: Chapter;
    isLocked?: boolean;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
    chapter,
    isLocked = false,
}) => {
    const navigate = useNavigate();
    const { completedLessonIds } = useAppStore();

    const totalLessons =
        chapter.lessons?.filter(item => item.type === 'lesson').length || 0;
    const completedLessons =
        chapter.lessons?.filter(
            item =>
                item.type === 'lesson' && completedLessonIds.includes(item.id),
        ).length || 0;

    const progress =
        totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
    const isFullyCompleted =
        totalLessons > 0 && completedLessons === totalLessons;

    const handleClick = () => {
        if (isLocked) return;
        navigate(`/chapter/${chapter.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className={`group w-full card hover:shadow-card-lg transition-all duration-300 flex items-center justify-between ${
                isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-[1.02]'
            } ${isFullyCompleted ? 'border-success/30 bg-success/5' : ''}`}
        >
            <div className="flex-1 text-left">
                <div className="flex items-center gap-3 mb-1">
                    {isLocked ? (
                        <Lock className="w-6 h-6 text-secondary" />
                    ) : isFullyCompleted ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                    ) : (
                        <BookOpen className="w-6 h-6 text-gold group-hover:rotate-[-5deg] transition-transform" />
                    )}
                    <h2 className="text-xl font-semibold text-primary">
                        {chapter.title}
                        <span className="ml-2 text-sm font-medium text-gold">
                            {chapter.titleTuvan}
                        </span>
                    </h2>
                </div>
                <p className="mb-2 text-sm text-secondary">
                    {chapter.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-secondary">
                    <span className="flex items-center gap-1">
                        <span className="text-base">📖</span> {totalLessons}{' '}
                        уроков
                    </span>
                    {totalLessons > 0 && (
                        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                            <div className="w-full h-2 overflow-hidden rounded-full bg-card-hover">
                                <div
                                    className="h-full transition-all duration-1000 ease-out rounded-full bg-gold-gradient"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="font-medium text-secondary">
                                {progress}%
                            </span>
                        </div>
                    )}
                    {isLocked && (
                        <span className="text-xs text-secondary/50">
                            🔒 заблокировано
                        </span>
                    )}
                    {isFullyCompleted && !isLocked && (
                        <span className="text-xs text-success">
                            ✅ пройдено
                        </span>
                    )}
                </div>
            </div>
            <div className="text-2xl transition-transform text-gold group-hover:translate-x-1">
                {isLocked ? '' : '→'}
            </div>
        </div>
    );
};

export default ChapterCard;
