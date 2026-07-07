import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { loadAllChapters } from '../../services/ContentService';
import type { Chapter } from '../../types/content';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import ChapterCard from './ChapterCard';
import Skeleton from '../UI/Skeleton';
import LevelTabs from '../Leveltabs';

const ChapterList: React.FC = () => {
    const [allChapters, setAllChapters] = useState<Chapter[]>([]);
    const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
    const [activeLevel, setActiveLevel] = useState('A1');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

    useEffect(() => {
        loadAllChapters()
            .then(data => {
                setAllChapters(data);
                // По умолчанию показываем A1
                setFilteredChapters(data.filter(ch => ch.level === 'A1'));
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

    if (error) {
        return <div className="py-10 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-4xl p-6 mx-auto">
            <AnimatedWrapper animation="slideUp">
                <h1 className="mb-2 text-3xl font-bold text-dark">
                    📚 Уроки тувинского
                </h1>
                <p className="mb-6 text-dark/70">
                    Выбери уровень и начни изучение
                </p>
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
                    : filteredChapters.map((chapter, index) => (
                          <AnimatedWrapper
                              key={chapter.id}
                              animation="fadeIn"
                              delay={index * 80}
                          >
                              <ChapterCard chapter={chapter} />
                          </AnimatedWrapper>
                      ))}
            </div>

            {!loading && filteredChapters.length === 0 && (
                <div className="py-10 text-center text-dark/60">
                    Нет уроков для этого уровня
                </div>
            )}
        </div>
    );
};

export default ChapterList;
