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
import TheoryView from './TheoryView';
import {
    BookOpen,
    ChevronRight,
    CheckCircle,
    Lock,
    Clock,
    FileText,
    X,
} from 'lucide-react';

const ChapterView: React.FC = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const { completedLessonIds } = useAppStore();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTheory, setShowTheory] = useState(false);

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
            <div className="max-w-4xl p-6 mx-auto">
                <Skeleton variant="text" className="w-3/4 h-10 mb-4" />
                <Skeleton variant="text" className="w-1/2 h-6 mb-8" />
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} variant="card" className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !chapter) {
        return (
            <div className="py-10 text-center text-error">
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
        <div className="max-w-4xl p-6 mx-auto space-y-8">
            <Breadcrumbs items={[{ label: chapter.title }]} />

            {/* Заголовок главы с CSS-переменными */}
            <div
                className="relative p-8 overflow-hidden border rounded-3xl border-gold/10"
                style={{
                    background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)`,
                }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/5 blur-3xl" />
                <div className="relative">
                    <h1 className="text-3xl font-bold md:text-4xl text-primary">
                        {chapter.title}
                    </h1>
                    <p className="mt-2 text-lg text-secondary">
                        {chapter.titleTuvan}
                    </p>
                    <p className="mt-1 text-secondary/70">
                        {chapter.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                        <span className="tag">📚 {totalLessons} уроков</span>
                        <span className="tag">📖 {theories.length} теорий</span>
                        <span className="tag-success">
                            ✅ {completedCount} пройдено
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between mb-1 text-sm text-secondary">
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
                <div className="card">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-gold" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-primary">
                                Теория
                            </h3>
                            <p className="text-sm text-secondary">
                                {theories.length} теоретических блоков доступно
                            </p>
                        </div>
                        <button
                            onClick={() => setShowTheory(true)}
                            className="text-sm btn-secondary"
                        >
                            Открыть теорию →
                        </button>
                    </div>
                </div>
            )}

            {/* Список уроков */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-primary">Уроки</h2>
                {lessons.map((lesson, index) => {
                    const completed = isLessonCompleted(lesson.id);
                    const unlocked = isLessonUnlocked(index);

                    return (
                        <AnimatedWrapper
                            key={lesson.id}
                            animation="fadeIn"
                            delay={index * 80}
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
                                className={`card cursor-pointer transition-all duration-300 ${
                                    !unlocked
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                } ${completed ? 'border-success/30' : 'border-gold/10'}`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center flex-1 gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 text-xl rounded-full bg-gold/10">
                                            {completed ? (
                                                <CheckCircle className="w-6 h-6 text-success" />
                                            ) : !unlocked ? (
                                                <Lock className="w-6 h-6 text-secondary/50" />
                                            ) : (
                                                <span className="text-gold">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-sm text-secondary">
                                                {lesson.description}
                                            </p>
                                            <div className="flex flex-wrap gap-3 mt-1 text-xs">
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
                                                    <span className="text-success">
                                                        ✅ Пройден
                                                    </span>
                                                )}
                                                {!unlocked && !completed && (
                                                    <span className="text-secondary/50">
                                                        🔒 Заблокирован
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {unlocked && (
                                        <ChevronRight className="w-5 h-5 text-gold shrink-0" />
                                    )}
                                </div>
                            </motion.div>
                        </AnimatedWrapper>
                    );
                })}
            </div>
            {showTheory && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md"
                    onClick={() => setShowTheory(false)}
                >
                    <div
                        className="bg-card rounded-3xl border border-gold/10 shadow-card-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowTheory(false)}
                            className="absolute transition-colors top-4 right-4 text-secondary hover:text-primary"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="mb-6 text-2xl font-bold text-primary">
                            📖 Теория
                        </h2>
                        <div className="space-y-8">
                            {theories.map(theory => (
                                <TheoryView key={theory.id} theory={theory} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChapterView;
