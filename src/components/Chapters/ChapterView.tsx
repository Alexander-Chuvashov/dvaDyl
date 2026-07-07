// src/components/Chapters/ChapterView.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadAllChapters } from '../../services/ContentService';
import type { Chapter, Lesson, Theory } from '../../types/content';
import TheoryView from './TheoryView';
import LessonView from '../Lessons/LessonView';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import Skeleton from '../UI/Skeleton';
import ErrorBoundary from '../ErrorBoundary';

const ChapterView: React.FC = () => {
    const { chapterId } = useParams();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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
            <div className="py-10 text-center text-red-500">
                {error || 'Глава не найдена'}
            </div>
        );
    }

    return (
        <div className="max-w-4xl p-6 mx-auto">
            <h1 className="text-3xl font-bold text-dark">{chapter.title}</h1>
            <p className="mb-6 text-dark/70">{chapter.description}</p>

            <div className="space-y-6">
                {chapter.lessons?.map((item, index) => (
                    <AnimatedWrapper
                        key={item.id}
                        animation="fadeIn"
                        delay={index * 80}
                    >
                        {item.type === 'theory' ? (
                            <TheoryView theory={item as Theory} />
                        ) : (
                            <ErrorBoundary
                                fallback={<div>Не удалось загрузить урок</div>}
                            >
                                <LessonView
                                    key={item.id}
                                    lesson={item as Lesson}
                                    onComplete={() => {
                                        navigate('/'); // или на страницу со списком глав, если у тебя другой путь
                                    }}
                                />
                            </ErrorBoundary>
                        )}
                    </AnimatedWrapper>
                ))}
            </div>
        </div>
    );
};

export default ChapterView;
