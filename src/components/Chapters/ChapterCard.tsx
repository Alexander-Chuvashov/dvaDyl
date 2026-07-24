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
            className={`group w-full card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 flex items-center justify-between ${
                isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-[1.01] sm:hover:scale-[1.02]'
            } ${isFullyCompleted ? 'border-success/30 bg-success/5' : ''}`}
        >
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-1 sm:gap-3">
                    {isLocked ? (
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-secondary/40" />
                    ) : isFullyCompleted ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success animate-bounce-success" />
                    ) : (
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gold group-hover:rotate-[-5deg] transition-transform" />
                    )}
                    <h2 className="text-base font-semibold truncate sm:text-xl text-primary">
                        {chapter.title}
                        <span className="ml-1 text-xs font-medium sm:ml-2 sm:text-sm text-gold">
                            {chapter.titleTuvan}
                        </span>
                    </h2>
                </div>
                <p className="mb-2 text-xs truncate sm:text-sm text-secondary/70">
                    {chapter.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-4 sm:text-sm text-secondary/50">
                    <span className="flex items-center gap-1">
                        <span className="text-sm sm:text-base">📖</span>{' '}
                        {totalLessons} уроков
                    </span>
                    {totalLessons > 0 && (
                        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-[80px] max-w-[120px] sm:max-w-[200px]">
                            <div className="w-full h-1.5 sm:h-2 bg-cream rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-1000 ease-out rounded-full bg-gold-gradient"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium sm:text-sm">
                                {progress}%
                            </span>
                        </div>
                    )}
                    {isLocked && (
                        <span className="flex items-center gap-1 text-xs text-secondary/40">
                            🔒 заблокировано
                        </span>
                    )}
                    {isFullyCompleted && !isLocked && (
                        <span className="flex items-center gap-1 text-xs text-success">
                            ✅ пройдено
                        </span>
                    )}
                </div>
            </div>
            <div
                className={`text-2xl sm:text-3xl text-gold transition-transform shrink-0 ${isLocked ? 'opacity-30' : 'group-hover:translate-x-1'}`}
            >
                {isLocked ? '' : '→'}
            </div>
        </div>
    );
};

export default ChapterCard;
