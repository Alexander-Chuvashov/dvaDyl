// src/components/Chapters/ChapterList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { loadAllChapters } from '../../services/ContentService';
import type { Chapter } from '../../types/content';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import ChapterCard from './ChapterCard';
import Skeleton from '../UI/Skeleton';
import LevelTabs from '../Leveltabs';
import Character from '../UI/Character';
import { motion } from 'framer-motion';
import {
    Star,
    Flame,
    BookOpen,
    ChevronRight,
    Sparkles,
    MapPin,
} from 'lucide-react';

const ChapterList: React.FC = () => {
    const navigate = useNavigate();
    const [allChapters, setAllChapters] = useState<Chapter[]>([]);
    const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
    const [activeLevel, setActiveLevel] = useState('A1');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { completedLessonIds, xp, streak } = useAppStore();

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

    // Находим следующий урок для кнопки "Продолжить"
    const [nextLesson, setNextLesson] = useState<{
        chapterId: string;
        lesson: any;
    } | null>(null);

    useEffect(() => {
        loadAllChapters()
            .then(data => {
                setAllChapters(data);
                setFilteredChapters(
                    data.filter(ch => ch.level === activeLevel),
                );
                // Ищем следующий урок (первый не пройденный)
                const allLessons: { chapterId: string; lesson: any }[] = [];
                data.forEach(ch => {
                    const lessons =
                        ch.lessons?.filter(item => item.type === 'lesson') ||
                        [];
                    lessons.forEach(l => {
                        allLessons.push({ chapterId: ch.id, lesson: l });
                    });
                });
                const next = allLessons.find(
                    ({ lesson }) => !completedLessonIds.includes(lesson.id),
                );
                setNextLesson(next || null);
            })
            .catch(err => {
                console.error(err);
                setError('Не удалось загрузить главы');
            })
            .finally(() => setLoading(false));
    }, [activeLevel, completedLessonIds]);

    const handleLevelChange = (level: string) => {
        setActiveLevel(level);
        setFilteredChapters(allChapters.filter(ch => ch.level === level));
    };

    const isChapterCompleted = (chapter: Chapter) => {
        const lessons =
            chapter.lessons?.filter(item => item.type === 'lesson') || [];
        return (
            lessons.length > 0 &&
            lessons.every(lesson => completedLessonIds.includes(lesson.id))
        );
    };

    const isChapterLocked = (
        chapter: Chapter,
        index: number,
        list: Chapter[],
    ) => {
        if (index === 0) return false;
        const prevChapter = list[index - 1];
        return !isChapterCompleted(prevChapter);
    };

    // Статистика
    const totalChapters = allChapters.length;
    const totalLessons = allChapters.reduce(
        (acc, ch) =>
            acc + (ch.lessons?.filter(l => l.type === 'lesson').length || 0),
        0,
    );

    if (error) {
        return <div className="py-10 text-center text-error">{error}</div>;
    }

    return (
        <div className="max-w-4xl p-6 mx-auto space-y-8">
            {/* ===== НОВЫЙ ПРИВЕТСТВЕННЫЙ БАННЕР ===== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative p-8 overflow-hidden border shadow-2xl rounded-3xl border-gold/20 md:p-12"
                style={{
                    background: 'var(--bg-gradient)',
                    backgroundColor: 'var(--bg-card)',
                }}
            >
                {/* Декоративные элементы */}
                <div className="absolute top-0 right-0 rounded-full w-96 h-96 bg-gold/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-500/5 blur-2xl" />
                <div className="absolute w-full h-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-gradient-to-r from-gold/5 via-transparent to-gold/5 blur-2xl" />

                {/* Парящие частицы (золотые, без изменений) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-gold/40"
                            initial={{
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%',
                                opacity: Math.random() * 0.5 + 0.2,
                            }}
                            animate={{
                                y: ['0%', '30%', '0%'],
                                opacity: [0.2, 0.6, 0.2],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 6,
                                repeat: Infinity,
                                delay: Math.random() * 4,
                            }}
                            style={{
                                width: Math.random() * 4 + 2 + 'px',
                                height: Math.random() * 4 + 2 + 'px',
                            }}
                        />
                    ))}
                </div>

                <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-gold" />
                            <h1 className="text-4xl font-bold md:text-5xl text-primary">
                                Добро пожаловать в{' '}
                                <span className="text-gold">дваДЫЛ</span>!
                            </h1>
                        </div>
                        <p className="max-w-2xl text-lg text-secondary">
                            Изучай тувинский язык с увлекательными уроками,
                            геймификацией и системой повторений.
                        </p>

                        <div className="flex flex-wrap gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-gold/10">
                                    <BookOpen className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary">
                                        {totalChapters}
                                    </div>
                                    <div className="text-xs text-secondary">
                                        глав
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-gold/10">
                                    <MapPin className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary">
                                        {totalLessons}
                                    </div>
                                    <div className="text-xs text-secondary">
                                        уроков
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-gold/10">
                                    <Star className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary">
                                        {xp}
                                    </div>
                                    <div className="text-xs text-secondary">
                                        XP
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-gold/10">
                                    <Flame className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary">
                                        {streak}
                                    </div>
                                    <div className="text-xs text-secondary">
                                        дней
                                    </div>
                                </div>
                            </div>
                        </div>

                        {nextLesson && (
                            <button
                                onClick={() =>
                                    navigate(
                                        `/chapter/${nextLesson.chapterId}/lesson/${nextLesson.lesson.id}`,
                                    )
                                }
                                className="flex items-center gap-2 mt-2 text-base btn-primary"
                            >
                                🚀 Продолжить обучение{' '}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Персонаж (без изменений) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="shrink-0"
                    >
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 3, -3, 0],
                            }}
                            transition={{
                                y: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                },
                                rotate: {
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                },
                            }}
                        >
                            <Character state="happy" size="lg" />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ===== УРОВНИ И КАРТОЧКИ ГЛАВ ===== */}
            <LevelTabs
                levels={levels}
                activeLevel={activeLevel}
                onLevelChange={handleLevelChange}
            />

            <div className="grid gap-4">
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} variant="card" className="h-24" />
                      ))
                    : filteredChapters.map((chapter, index) => {
                          const locked = isChapterLocked(
                              chapter,
                              index,
                              filteredChapters,
                          );
                          return (
                              <AnimatedWrapper
                                  key={chapter.id}
                                  animation="fadeIn"
                                  delay={index * 80}
                              >
                                  <ChapterCard
                                      chapter={chapter}
                                      isLocked={locked}
                                  />
                              </AnimatedWrapper>
                          );
                      })}
            </div>

            {!loading && filteredChapters.length === 0 && (
                <div className="py-10 text-center text-text-secondary">
                    Нет уроков для этого уровня
                </div>
            )}
        </div>
    );
};

export default ChapterList;
