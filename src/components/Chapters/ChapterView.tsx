// src/components/Chapters/ChapterView.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { loadAllChapters } from '../../services/ContentService';
import type { Chapter, Lesson, Theory } from '../../types/content';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import Skeleton from '../UI/Skeleton';
import Breadcrumbs from '../UI/Breadcrumbs';
import TheoryView from './TheoryView';
import {
    BookOpen,
    ChevronRight,
    CheckCircle,
    Lock,
    FileText,
} from 'lucide-react';

type TabType = 'theory' | 'lessons';

const ChapterView: React.FC = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const { completedLessonIds } = useAppStore();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('theory');

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

    // Фильтруем теорию и уроки
    const theories =
        (chapter.lessons?.filter(item => item.type === 'theory') as Theory[]) ||
        [];
    const lessons =
        (chapter.lessons?.filter(item => item.type === 'lesson') as Lesson[]) ||
        [];

    const isLessonCompleted = (lessonId: string) =>
        completedLessonIds.includes(lessonId);
    const isLessonUnlocked = (index: number) => {
        if (index === 0) return true;
        const prevLesson = lessons[index - 1];
        return prevLesson ? isLessonCompleted(prevLesson.id) : true;
    };

    return (
        <div className="max-w-4xl p-6 mx-auto">
            <Breadcrumbs items={[{ label: chapter.title }]} />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-dark">
                        {chapter.title}
                    </h1>
                    <p className="text-dark/70">{chapter.description}</p>
                </div>
            </div>

            {/* Вкладки */}
            <div className="flex gap-2 mb-6 border-b border-cream">
                <button
                    onClick={() => setActiveTab('theory')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                        activeTab === 'theory'
                            ? 'border-terracotta text-terracotta'
                            : 'border-transparent text-dark/60 hover:text-dark hover:border-dark/20'
                    }`}
                >
                    <FileText className="inline w-4 h-4 mr-2" />
                    Теория ({theories.length})
                </button>
                <button
                    onClick={() => setActiveTab('lessons')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                        activeTab === 'lessons'
                            ? 'border-terracotta text-terracotta'
                            : 'border-transparent text-dark/60 hover:text-dark hover:border-dark/20'
                    }`}
                >
                    <BookOpen className="inline w-4 h-4 mr-2" />
                    Уроки ({lessons.length})
                </button>
            </div>

            {/* Контент */}
            {activeTab === 'theory' && (
                <div className="space-y-4">
                    {theories.length === 0 ? (
                        <p className="py-10 text-center text-dark/60">
                            Теория для этой главы пока не добавлена
                        </p>
                    ) : (
                        theories.map((theory, index) => (
                            <AnimatedWrapper
                                key={theory.id}
                                animation="fadeIn"
                                delay={index * 80}
                            >
                                <TheoryView theory={theory} />
                            </AnimatedWrapper>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'lessons' && (
                <div className="space-y-4">
                    {lessons.length === 0 ? (
                        <p className="py-10 text-center text-dark/60">
                            Уроки для этой главы пока не добавлены
                        </p>
                    ) : (
                        lessons.map((lesson, index) => {
                            const completed = isLessonCompleted(lesson.id);
                            const unlocked = isLessonUnlocked(index);

                            return (
                                <AnimatedWrapper
                                    key={lesson.id}
                                    animation="fadeIn"
                                    delay={index * 80}
                                >
                                    <div
                                        onClick={() => {
                                            if (unlocked) {
                                                navigate(
                                                    `/chapter/${chapterId}/lesson/${lesson.id}`,
                                                    {
                                                        state: {
                                                            chapterTitle:
                                                                chapter.title,
                                                        },
                                                    },
                                                );
                                            }
                                        }}
                                        className={`w-full text-left card hover:shadow-lg transition-all flex items-center justify-between ${
                                            !unlocked
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer'
                                        } ${completed ? 'border-olive/30 bg-olive/5' : ''}`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                {completed ? (
                                                    <CheckCircle className="w-5 h-5 text-olive" />
                                                ) : !unlocked ? (
                                                    <Lock className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <BookOpen className="w-5 h-5 text-terracotta" />
                                                )}
                                                <h3 className="text-lg font-semibold text-dark">
                                                    {lesson.title}
                                                </h3>
                                                <span className="text-sm font-medium text-terracotta">
                                                    {lesson.titleTuvan}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-dark/60">
                                                {lesson.description}
                                            </p>
                                            <div className="flex gap-3 mt-2 text-xs text-dark/50">
                                                <span>
                                                    ⚡ {lesson.exercises.length}{' '}
                                                    упражнений
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    ⏱{' '}
                                                    {lesson.estimatedTime || 10}{' '}
                                                    мин
                                                </span>
                                                {completed && (
                                                    <span className="font-medium text-olive">
                                                        ✓ Пройден
                                                    </span>
                                                )}
                                                {!unlocked && !completed && (
                                                    <span className="font-medium text-gray-400">
                                                        🔒 Заблокирован
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight
                                            className={`w-5 h-5 ${unlocked ? 'text-terracotta' : 'text-gray-300'}`}
                                        />
                                    </div>
                                </AnimatedWrapper>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default ChapterView;
