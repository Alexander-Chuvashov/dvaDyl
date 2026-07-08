// src/components/Chapters/ChapterList.tsx
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { loadAllChapters } from '../../services/ContentService';
import type { Chapter } from '../../types/content';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import ChapterCard from './ChapterCard';
import Skeleton from '../UI/Skeleton';
import LevelTabs from '../Leveltabs';
import StatsSummary from '../Layout/StatsSummary';

const ChapterList: React.FC = () => {
    const [allChapters, setAllChapters] = useState<Chapter[]>([]);
    const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
    const [activeLevel, setActiveLevel] = useState('A1');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { completedLessonIds } = useAppStore();

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

    useEffect(() => {
        loadAllChapters()
            .then(data => {
                setAllChapters(data);
                setFilteredChapters(
                    data.filter(ch => ch.level === activeLevel),
                );
            })
            .catch(err => {
                console.error(err);
                setError('Не удалось загрузить главы');
            })
            .finally(() => setLoading(false));
    }, []);

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

    if (error) {
        return <div className="py-10 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-4xl p-6 mx-auto">
            <AnimatedWrapper animation="slideUp">
                <div className="p-8 mb-8 border bg-surface rounded-2xl shadow-card border-cream">
                    <h1 className="text-4xl font-bold text-dark">
                        🌍 Добро пожаловать в дваДЫЛ!
                    </h1>
                    <p className="mt-2 text-lg text-dark/70">
                        Изучай тувинский язык с увлекательными уроками,
                        геймификацией и системой повторений.
                    </p>
                    <div className="flex gap-4 mt-4 text-sm text-dark/50">
                        <span>📚 {allChapters.length} глав</span>
                        <span>•</span>
                        <span>
                            📖{' '}
                            {allChapters.reduce(
                                (acc, ch) =>
                                    acc +
                                    (ch.lessons?.filter(
                                        l => l.type === 'lesson',
                                    ).length || 0),
                                0,
                            )}{' '}
                            уроков
                        </span>
                    </div>
                </div>
            </AnimatedWrapper>

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
                <div className="py-10 text-center text-dark/60">
                    Нет уроков для этого уровня
                </div>
            )}
            <StatsSummary />
        </div>
    );
};

export default ChapterList;
