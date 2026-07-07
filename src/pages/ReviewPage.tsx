import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { loadVocabulary } from '../services/LessonServices';
import type { VocabularyWord } from '../types/content';
import { DatabaseService } from '../services/DatabaseService';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import AudioButton from '../components/UI/AudioButton';

const ReviewPage: React.FC = () => {
    const { userId, dbUserWords, syncWordProgress } = useAppStore();
    const [words, setWords] = useState<VocabularyWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<{
        correct: boolean;
        message: string;
    } | null>(null);

    useEffect(() => {
        const loadReviewWords = async () => {
            if (!userId) return;
            setLoading(true);

            try {
                // Загружаем все слова из словаря
                const allWords = await loadVocabulary();
                // Фильтруем слова, которые нужно повторить
                const today = new Date().toISOString().split('T')[0];
                const dueWords = allWords.filter(word => {
                    const userWord = dbUserWords[word.id];
                    if (!userWord) return false; // если слово ещё не встречалось, не показываем
                    return userWord.next_review <= today;
                });

                // Перемешиваем для разнообразия
                setWords(dueWords.sort(() => Math.random() - 0.5));
            } catch (error) {
                console.error('Ошибка загрузки слов для повторения:', error);
            } finally {
                setLoading(false);
            }
        };

        loadReviewWords();
    }, [userId, dbUserWords]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentWord = words[currentIndex];
        if (!currentWord) return;

        const isCorrect =
            answer.trim().toLowerCase() ===
            currentWord.wordRussian.toLowerCase();
        setFeedback({
            correct: isCorrect,
            message: isCorrect
                ? '✅ Правильно!'
                : `❌ Неправильно. Правильный ответ: ${currentWord.wordRussian}`,
        });

        // Обновляем SRS в БД
        if (userId) {
            await syncWordProgress(userId, currentWord.id, isCorrect);
        }

        // Через 1.5 секунды переходим к следующему слову
        setTimeout(() => {
            setFeedback(null);
            setAnswer('');
            if (currentIndex < words.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                // Все слова повторены
                setWords([]);
                setCurrentIndex(0);
            }
        }, 1500);
    };

    if (loading) {
        return (
            <div className="max-w-2xl p-6 mx-auto text-center">
                <div className="animate-pulse text-dark/60">
                    Загрузка слов для повторения...
                </div>
            </div>
        );
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Введите перевод на русский..."
                        className="input-field"
                        disabled={!!feedback}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!!feedback || !answer.trim()}
                        className="w-full btn-primary disabled:opacity-50"
                    >
                        Проверить
                    </button>
                </form>

                {feedback && (
                    <div
                        className={`mt-4 p-3 rounded-lg ${
                            feedback.correct
                                ? 'bg-olive/10 border border-olive text-olive'
                                : 'bg-terracotta/10 border border-terracotta text-terracotta'
                        }`}
                    >
                        {feedback.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewPage;
