// src/components/Chapters/ChapterList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { loadAllChapters } from '../../services/ContentService';
import type { Chapter } from '../../types/content';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import ChapterCard from './ChapterCard';
import Skeleton from '../UI/Skeleton';
import LevelTabs from '../LevelTabs';
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

    const isChapterLocked = (_: Chapter, index: number, list: Chapter[]) => {
        if (index === 0) return false;
        const prevChapter = list[index - 1];
        return !isChapterCompleted(prevChapter);
    };

    const levelProgress = levels.map(level => {
        const chapters = allChapters.filter(ch => ch.level === level);
        const totalLessons = chapters.reduce(
            (acc, ch) =>
                acc +
                (ch.lessons?.filter(item => item.type === 'lesson').length ||
                    0),
            0,
        );
        const completedLessons = chapters.reduce((acc, ch) => {
            const lessons =
                ch.lessons?.filter(item => item.type === 'lesson') || [];
            const completed = lessons.filter(l =>
                completedLessonIds.includes(l.id),
            ).length;
            return acc + completed;
        }, 0);
        const percent =
            totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;
        return { level, totalLessons, completedLessons, percent };
    });

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
        <div className="max-w-4xl p-4 mx-auto space-y-6 sm:p-6 sm:space-y-8">
            {/* ===== ПРИВЕТСТВЕННЫЙ БАННЕР (АДАПТИВ) ===== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0A0F1C] via-[#121A2E] to-[#1A2744] border border-gold/20 p-6 md:p-8 lg:p-12 shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full sm:w-64 sm:h-64 bg-gold/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full sm:w-64 sm:h-64 bg-blue-500/5 blur-2xl" />
                <div className="absolute w-full h-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-gradient-to-r from-gold/5 via-transparent to-gold/5 blur-2xl" />

                <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center sm:gap-8">
                    <div className="flex-1 space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
                            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl text-primary">
                                🌍 Добро пожаловать в{' '}
                                <span className="text-gold">DVA-DYL</span>!
                            </h1>
                        </div>
                        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-secondary">
                            Изучай тувинский язык с увлекательными уроками,
                            геймификацией и системой повторений.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-1 sm:gap-4 sm:pt-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <div className="p-1 rounded-full sm:p-2 bg-gold/10">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold sm:text-xl md:text-2xl text-primary">
                                        {totalChapters}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-secondary">
                                        глав
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <div className="p-1 rounded-full sm:p-2 bg-gold/10">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold sm:text-xl md:text-2xl text-primary">
                                        {totalLessons}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-secondary">
                                        уроков
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <div className="p-1 rounded-full sm:p-2 bg-gold/10">
                                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold sm:text-xl md:text-2xl text-primary">
                                        {xp}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-secondary">
                                        XP
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <div className="p-1 rounded-full sm:p-2 bg-gold/10">
                                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold sm:text-xl md:text-2xl text-primary">
                                        {streak}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-secondary">
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
                                className="flex items-center gap-2 mt-1 text-sm sm:mt-2 btn-primary sm:text-base"
                            >
                                🚀 Продолжить обучение{' '}
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        )}
                    </div>

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

            {/* ===== БЛОК ПРОГРЕССА ПО УРОВНЯМ (АДАПТИВ) ===== */}
            <div className="p-4 card">
                <h3 className="mb-2 text-sm font-semibold text-primary">
                    📊 Прогресс по уровням
                </h3>
                <div className="flex flex-wrap gap-2">
                    {levelProgress.map(item => (
                        <div
                            key={item.level}
                            className="flex items-center gap-2"
                        >
                            <span className="w-4 text-xs font-bold text-primary">
                                {item.level}
                            </span>
                            <div className="w-16 sm:w-24 h-1.5 bg-card-hover rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500 rounded-full bg-gold-gradient"
                                    style={{ width: `${item.percent}%` }}
                                />
                            </div>
                            <span className="text-xs text-secondary">
                                {item.percent}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== УРОВНИ И КАРТОЧКИ ГЛАВ ===== */}
            <LevelTabs
                levels={levels}
                activeLevel={activeLevel}
                onLevelChange={handleLevelChange}
            />

            <div className="grid gap-3 sm:gap-4">
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton
                              key={i}
                              variant="card"
                              className="h-20 sm:h-24"
                          />
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
                                  delay={0.14}
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
                <div className="py-10 text-center text-secondary">
                    Нет уроков для этого уровня
                </div>
            )}
        </div>
    );
};

export default ChapterList;
