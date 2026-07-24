// src/pages/LearnedWordsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { loadVocabulary } from '../services/LessonServices';
import type { VocabularyWord } from '../types/content';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import { Search, BookOpen } from 'lucide-react';

const LearnedWordsPage: React.FC = () => {
    const { userId, dbUserWords } = useAppStore();
    const [allWords, setAllWords] = useState<VocabularyWord[]>([]);
    const [filteredWords, setFilteredWords] = useState<VocabularyWord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadWords = async () => {
            if (!userId) return;
            try {
                const vocabulary = await loadVocabulary();
                // Берём только те слова, которые есть в dbUserWords (т.е. встречались в уроках)
                const learned = vocabulary.filter(word => dbUserWords[word.id]);
                setAllWords(learned);
                setFilteredWords(learned);
            } catch (error) {
                console.error('Ошибка загрузки слов:', error);
            } finally {
                setLoading(false);
            }
        };
        loadWords();
    }, [userId, dbUserWords]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        setFilteredWords(
            allWords.filter(
                w =>
                    w.wordTuvan.toLowerCase().includes(value) ||
                    w.wordRussian.toLowerCase().includes(value),
            ),
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-gold animate-pulse">Загрузка слов...</div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-6 space-y-6 sm:px-6">
            <AnimatedWrapper animation="slideUp">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl text-primary">
                            📚 Выученные слова
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-secondary">
                            {filteredWords.length} слов изучено
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={search}
                            onChange={handleSearch}
                            className="w-40 text-sm input-field pl-9 sm:text-base sm:w-60"
                        />
                    </div>
                </div>
            </AnimatedWrapper>

            {filteredWords.length === 0 ? (
                <div className="py-10 text-center text-secondary">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gold/30" />
                    <p>
                        Ты ещё не выучил ни одного слова. Начни проходить уроки!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                    {filteredWords.map(word => (
                        <div
                            key={word.id}
                            className="p-4 transition-all duration-200 card hover:shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">
                                    {word.wordTuvan}
                                </span>
                            </div>
                            <div className="mt-1 text-base text-gold">
                                {word.wordRussian}
                            </div>
                            {word.exampleSentence && (
                                <div className="mt-2 text-xs italic text-secondary/60">
                                    {word.exampleSentence}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LearnedWordsPage;
