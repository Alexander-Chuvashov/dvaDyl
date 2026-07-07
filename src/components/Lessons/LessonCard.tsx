// src/components/Lessons/LessonCard.tsx
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Lesson } from '../../types/content';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface Props {
    lesson: Lesson;
}

const LessonCard: React.FC<Props> = ({ lesson }) => {
    const { selectLesson, completedLessonIds } = useAppStore();
    const isCompleted = completedLessonIds.includes(lesson.id);

    return (
        <button
            onClick={() => selectLesson(lesson)}
            className={`w-full text-left card hover:shadow-lg transition-all duration-200 flex items-center justify-between ${
                isCompleted ? 'border-olive/30 bg-olive/5' : ''
            }`}
        >
            <div className="flex items-center gap-4">
                {isCompleted && (
                    <CheckCircle className="flex-shrink-0 w-6 h-6 text-olive" />
                )}
                <div>
                    <h2 className="text-xl font-semibold text-dark">
                        {lesson.title}
                        <span className="ml-2 text-sm font-medium text-terracotta">
                            {lesson.titleTuvan}
                        </span>
                    </h2>
                    {lesson.description && (
                        <p className="mt-1 text-sm text-dark/70">
                            {lesson.description}
                        </p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-cream text-dark/60">
                            ⚡ {lesson.exercises.length} упражнений
                        </span>
                        <span className="px-2 py-1 rounded-full bg-cream text-dark/60">
                            ⏱ {lesson.estimatedTime || 10} мин
                        </span>
                        {isCompleted && (
                            <span className="px-2 py-1 font-medium rounded-full bg-olive/20 text-olive">
                                ✓ Пройден
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <ArrowRight className="w-5 h-5 text-terracotta" />
        </button>
    );
};

export default LessonCard;
