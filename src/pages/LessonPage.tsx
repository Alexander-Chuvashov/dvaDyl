// src/pages/LessonPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadAllChapters } from '../services/ContentService';
import type { Lesson } from '../types/content';
import LessonView from '../components/Lessons/LessonView';
import Skeleton from '../components/UI/Skeleton';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { useAppStore } from '../store/useAppStore';

const LessonPage: React.FC = () => {
    const { chapterId, lessonId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { completedLessonIds } = useAppStore();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [chapterTitle, setChapterTitle] = useState<string>(
        location.state?.chapterTitle || 'Глава',
    );
    const [nextLessonId, setNextLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAllChapters()
            .then(chapters => {
                const chapter = chapters.find(c => c.id === chapterId);
                if (!chapter) {
                    setError('Глава не найдена');
                    return;
                }
                // Сохраняем название главы для хлебных крошек, если не передано через state
                if (!location.state?.chapterTitle) {
                    setChapterTitle(chapter.title);
                }
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
            <div className="max-w-2xl p-6 mx-auto">
                <Skeleton variant="text" className="w-3/4 h-10 mb-4" />
                <Skeleton variant="card" className="h-96" />
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="py-10 text-center text-red-500">
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
        <div className="max-w-4xl p-6 mx-auto">
            <Breadcrumbs
                items={[
                    { label: chapterTitle, path: `/chapter/${chapterId}` },
                    { label: lesson.title },
                ]}
            />
            <LessonView lesson={lesson} onComplete={handleComplete} />
            <div className="mt-4 text-center">
                <button
                    onClick={() => navigate(`/chapter/${chapterId}`)}
                    className="text-sm text-terracotta hover:underline"
                >
                    ← Вернуться к списку уроков
                </button>
            </div>
        </div>
    );
};

export default LessonPage;
