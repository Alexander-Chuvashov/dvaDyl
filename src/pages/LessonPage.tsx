// src/pages/LessonPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadAllChapters } from '../services/ContentService';
import type { Lesson, Theory } from '../types/content';
import LessonView from '../components/Lessons/LessonView';
import TheoryView from '../components/Chapters/TheoryView';
import Skeleton from '../components/UI/Skeleton';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';

const LessonPage: React.FC = () => {
    const { chapterId, lessonId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [theories, setTheories] = useState<Theory[]>([]);
    const [chapterTitle, setChapterTitle] = useState<string>(
        location.state?.chapterTitle || 'Глава',
    );
    const [nextLessonId, setNextLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTheory, setShowTheory] = useState(false);

    useEffect(() => {
        loadAllChapters()
            .then(chapters => {
                const chapter = chapters.find(c => c.id === chapterId);
                if (!chapter) {
                    setError('Глава не найдена');
                    return;
                }
                if (!location.state?.chapterTitle) {
                    setChapterTitle(chapter.title);
                }

                const theoryItems =
                    (chapter.lessons?.filter(
                        item => item.type === 'theory',
                    ) as Theory[]) || [];
                setTheories(theoryItems);

                const allLessons =
                    (chapter.lessons?.filter(
                        item => item.type === 'lesson',
                    ) as Lesson[]) || [];
                const currentIndex = allLessons.findIndex(
                    l => l.id === lessonId,
                );
                if (currentIndex === -1) {
                    setError('Урок не найден');
                    return;
                }
                setLesson(allLessons[currentIndex]);
                if (currentIndex < allLessons.length - 1) {
                    setNextLessonId(allLessons[currentIndex + 1].id);
                } else {
                    setNextLessonId(null);
                }
            })
            .catch(err => {
                console.error(err);
                setError('Не удалось загрузить урок');
            })
            .finally(() => setLoading(false));
    }, [chapterId, lessonId, location.state]);

    if (loading) {
        return (
            <div className="max-w-2xl p-4 mx-auto sm:p-6">
                <Skeleton variant="text" className="w-3/4 h-8 mb-4 sm:h-10" />
                <Skeleton variant="card" className="h-72 sm:h-96" />
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="py-10 text-sm text-center text-error sm:text-base">
                {error || 'Урок не найден'}
            </div>
        );
    }

    const handleComplete = () => {
        if (nextLessonId) {
            navigate(`/chapter/${chapterId}/lesson/${nextLessonId}`, {
                state: { chapterTitle },
            });
        } else {
            navigate(`/chapter/${chapterId}`);
        }
    };

    return (
        <div className="max-w-4xl p-4 mx-auto space-y-4 sm:p-6 sm:space-y-6">
            <Breadcrumbs
                items={[
                    { label: chapterTitle, path: `/chapter/${chapterId}` },
                    { label: lesson.title },
                ]}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                <h1 className="text-xl font-bold break-words sm:text-2xl text-primary">
                    {lesson.title}
                </h1>
                {theories.length > 0 && (
                    <button
                        onClick={() => setShowTheory(true)}
                        className="btn-secondary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Теория</span>
                        <span className="sm:hidden">📖</span>
                    </button>
                )}
            </div>

            <LessonView lesson={lesson} onComplete={handleComplete} />

            <div className="text-center">
                <button
                    onClick={() => navigate(`/chapter/${chapterId}`)}
                    className="text-xs transition-colors sm:text-sm text-secondary hover:text-primary"
                >
                    ← Вернуться к списку уроков
                </button>
            </div>

            {/* Модальное окно с теорией */}
            {showTheory && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md"
                    onClick={() => setShowTheory(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-card rounded-2xl sm:rounded-3xl border border-gold/10 shadow-card-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowTheory(false)}
                            className="absolute p-1 transition-colors top-2 right-2 sm:top-4 sm:right-4 text-secondary hover:text-primary"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <h2 className="mb-4 text-xl font-bold sm:text-2xl text-primary sm:mb-6">
                            📖 Теория
                        </h2>
                        <div className="space-y-6 sm:space-y-8">
                            {theories.map(theory => (
                                <TheoryView key={theory.id} theory={theory} />
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default LessonPage;
