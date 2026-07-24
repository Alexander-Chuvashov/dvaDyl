// src/components/Chapters/ChapterView.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { loadAllChapters } from '../../services/ContentService';
import type { Chapter, Lesson } from '../../types/content';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import Skeleton from '../UI/Skeleton';
import Breadcrumbs from '../UI/Breadcrumbs';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle, Lock, Clock, FileText } from 'lucide-react';

const ChapterView: React.FC = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const { completedLessonIds } = useAppStore();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAllChapters()
            .then(chapters => {
                const found = chapters.find(c => c.id === chapterId);
                if (found) {
                    setChapter(found);
                } else {
                    setError('Глава не найдена');
                }
            })
            .catch(err => {
                console.error(err);
                setError('Не удалось загрузить главу');
            })
            .finally(() => setLoading(false));
    }, [chapterId]);

    if (loading) {
        return (
            <div className="w-full px-4 py-6 sm:px-6">
                <Skeleton variant="text" className="w-3/4 h-8 mb-4 sm:h-10" />
                <Skeleton
                    variant="text"
                    className="w-1/2 h-5 mb-6 sm:h-6 sm:mb-8"
                />
                <div className="space-y-4 sm:space-y-6">
                    {[1, 2, 3].map(i => (
                        <Skeleton
                            key={i}
                            variant="card"
                            className="h-28 sm:h-32"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !chapter) {
        return (
            <div className="py-10 text-sm text-center text-error sm:text-base">
                {error || 'Глава не найдена'}
            </div>
        );
    }

    const lessons =
        (chapter.lessons?.filter(item => item.type === 'lesson') as Lesson[]) ||
        [];
    const theories =
        chapter.lessons?.filter(item => item.type === 'theory') || [];

    const isLessonCompleted = (lessonId: string) =>
        completedLessonIds.includes(lessonId);
    const isLessonUnlocked = (index: number) => {
        if (index === 0) return true;
        const prevLesson = lessons[index - 1];
        return prevLesson ? isLessonCompleted(prevLesson.id) : true;
    };

    const totalLessons = lessons.length;
    const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;
    const progress =
        totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

    return (
        <div className="w-full px-4 py-6 space-y-6 sm:px-6 sm:space-y-8">
            <Breadcrumbs items={[{ label: chapter.title }]} />

            {/* Заголовок главы */}
            <div className="relative p-6 overflow-hidden border rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card to-card-hover border-gold/10 sm:p-8">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full sm:w-64 sm:h-64 bg-gold/5 blur-3xl" />
                <div className="relative">
                    <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl text-primary">
                        {chapter.title}
                    </h1>
                    <p className="mt-1 text-base text-secondary sm:text-lg sm:mt-2">
                        {chapter.titleTuvan}
                    </p>
                    <p className="mt-1 text-sm text-secondary/70 sm:text-base">
                        {chapter.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3 sm:gap-4 sm:mt-4">
                        <span className="text-xs tag sm:text-sm">
                            📚 {totalLessons} уроков
                        </span>
                        <span className="text-xs tag sm:text-sm">
                            📖 {theories.length} теорий
                        </span>
                        <span className="text-xs tag-success sm:text-sm">
                            ✅ {completedCount} пройдено
                        </span>
                    </div>
                    <div className="mt-3 sm:mt-4">
                        <div className="flex justify-between mb-1 text-xs sm:text-sm text-secondary">
                            <span>Прогресс главы</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Теория (если есть) */}
            {theories.length > 0 && (
                <div className="p-4 card sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold sm:text-lg text-primary">
                                Теория
                            </h3>
                            <p className="text-xs sm:text-sm text-secondary">
                                {theories.length} теоретических блоков доступно
                            </p>
                        </div>
                        <button className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                            Открыть теорию →
                        </button>
                    </div>
                </div>
            )}

            {/* Список уроков */}
            <div className="space-y-3 sm:space-y-4">
                <h2 className="text-lg font-bold sm:text-xl text-primary">
                    Уроки
                </h2>
                {lessons.map((lesson, index) => {
                    const completed = isLessonCompleted(lesson.id);
                    const unlocked = isLessonUnlocked(index);

                    return (
                        <AnimatedWrapper
                            key={lesson.id}
                            animation="fadeIn"
                            delay={0.14}
                        >
                            <motion.div
                                whileHover={unlocked ? { scale: 1.01 } : {}}
                                onClick={() => {
                                    if (unlocked) {
                                        navigate(
                                            `/chapter/${chapterId}/lesson/${lesson.id}`,
                                            {
                                                state: {
                                                    chapterTitle: chapter.title,
                                                },
                                            },
                                        );
                                    }
                                }}
                                className={`card p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                                    !unlocked
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                } ${completed ? 'border-success/30' : 'border-gold/10'}`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center flex-1 min-w-0 gap-3 sm:gap-4">
                                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-base rounded-full sm:w-10 sm:h-10 bg-gold/10 sm:text-xl">
                                            {completed ? (
                                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                                            ) : !unlocked ? (
                                                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-secondary/50" />
                                            ) : (
                                                <span className="text-sm text-gold sm:text-base">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold truncate sm:text-lg text-primary">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-xs truncate sm:text-sm text-secondary">
                                                {lesson.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-1 text-xs sm:gap-3">
                                                <span className="flex items-center gap-1 text-secondary">
                                                    <Clock className="w-3 h-3" />{' '}
                                                    {lesson.estimatedTime || 10}{' '}
                                                    мин
                                                </span>
                                                <span className="flex items-center gap-1 text-secondary">
                                                    📝 {lesson.exercises.length}{' '}
                                                    упражнений
                                                </span>
                                                {completed && (
                                                    <span className="text-xs text-success">
                                                        ✅ Пройден
                                                    </span>
                                                )}
                                                {!unlocked && !completed && (
                                                    <span className="text-xs text-secondary/50">
                                                        🔒 Заблокирован
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {unlocked && (
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gold shrink-0" />
                                    )}
                                </div>
                            </motion.div>
                        </AnimatedWrapper>
                    );
                })}
            </div>
        </div>
    );
};

export default ChapterView;
