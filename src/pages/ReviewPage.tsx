// src/pages/ReviewPage.tsx
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { loadVocabulary } from '../services/LessonServices';
import type { VocabularyWord } from '../types/content';
import { AudioService } from '../services/AudioService';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import AudioButton from '../components/UI/AudioButton';

const ReviewPage: React.FC = () => {
    const { userId, dbUserWords, syncWordProgress } = useAppStore();
    const [words, setWords] = useState<VocabularyWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showTranslation, setShowTranslation] = useState(false);

    useEffect(() => {
        const loadReviewWords = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const allWords = await loadVocabulary();
                const today = new Date().toISOString().split('T')[0];
                const dueWords = allWords.filter(word => {
                    const userWord = dbUserWords[word.id];
                    if (!userWord) return false;
                    return userWord.next_review <= today;
                });
                // Перемешиваем
                setWords(dueWords.sort(() => Math.random() - 0.5));
            } catch (error) {
                console.error('Ошибка загрузки слов для повторения:', error);
            } finally {
                setLoading(false);
            }
        };
        loadReviewWords();
    }, [userId, dbUserWords]);

    const handleKnow = async () => {
        const word = words[currentIndex];
        await syncWordProgress(userId!, word.id, true);
        AudioService.correct();
        setShowTranslation(false);
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setWords([]);
            setCurrentIndex(0);
        }
    };

    const handleDontKnow = async () => {
        const word = words[currentIndex];
        await syncWordProgress(userId!, word.id, false);
        AudioService.incorrect();
        setShowTranslation(false);
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setWords([]);
            setCurrentIndex(0);
        }
    };

    if (loading) {
        return <div className="py-10 text-center">Загрузка...</div>;
    }

    if (words.length === 0) {
        return (
            <div className="max-w-2xl p-6 mx-auto text-center">
                <h2 className="mb-4 text-2xl font-bold text-dark">
                    🎉 Повторять нечего!
                </h2>
                <p className="text-dark/70">
                    Все слова повторены. Возвращайся завтра!
                </p>
            </div>
        );
    }

    const currentWord = words[currentIndex];

    return (
        <div className="max-w-2xl p-6 mx-auto">
            <AnimatedWrapper animation="slideUp">
                <h2 className="mb-2 text-2xl font-bold text-dark">
                    Повторение слов
                </h2>
                <p className="mb-6 text-dark/70">
                    {currentIndex + 1} из {words.length} слов
                </p>
            </AnimatedWrapper>

            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2 text-lg font-medium text-dark">
                        {currentWord.wordTuvan}
                        <AudioButton
                            text={currentWord.wordTuvan}
                            lang="tuv"
                            size="sm"
                        />
                    </span>
                    <span className="text-sm text-dark/50">
                        #{currentIndex + 1}
                    </span>
                </div>

                {showTranslation ? (
                    <div className="mt-4">
                        <p className="text-xl font-semibold text-olive">
                            {currentWord.wordRussian}
                        </p>
                        {currentWord.exampleSentence && (
                            <p className="mt-2 text-sm text-dark/60">
                                Пример: {currentWord.exampleSentence}
                            </p>
                        )}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleDontKnow}
                                className="flex-1 btn-secondary"
                            >
                                ❌ Не знаю
                            </button>
                            <button
                                onClick={handleKnow}
                                className="flex-1 btn-primary"
                            >
                                ✅ Знаю
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setShowTranslation(true);
                            AudioService.open();
                        }}
                        className="w-full py-4 transition-colors rounded-lg bg-cream hover:bg-cream/80 text-dark/70"
                    >
                        👆 Нажми, чтобы увидеть перевод
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReviewPage;
