// src/components/Exercises/SpeakingCard.tsx
import React, { useState } from 'react';
import type { Exercise } from '../../types/content';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw } from 'lucide-react';

interface CardItem {
    promptRu: string;
    targetTuvan: string;
    hint?: string;
}

interface SpeakingCardProps {
    exercise: Exercise & { cards?: CardItem[] };
    onAnswer: (
        isCorrect: boolean,
        userAnswer?: string,
        correctAnswer?: string,
    ) => void;
}

const SpeakingCard: React.FC<SpeakingCardProps> = ({ exercise, onAnswer }) => {
    const cards = exercise.cards || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [completed, setCompleted] = useState(false);

    const currentCard = cards[currentIndex];
    const isLast = currentIndex === cards.length - 1;

    const handleShowAnswer = () => {
        setShowAnswer(true);
    };

    const handleNext = () => {
        setShowAnswer(false);
        if (isLast) {
            setCompleted(true);
            onAnswer(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setShowAnswer(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setShowAnswer(false);
        setCompleted(false);
    };

    if (completed) {
        return (
            <div className="p-4 text-center card sm:p-6">
                <p className="text-lg font-bold text-success sm:text-xl">
                    🎉 Все карточки пройдены!
                </p>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 mx-auto mt-3 text-sm btn-secondary sm:text-base"
                >
                    <RotateCcw className="w-4 h-4" />
                    Пройти заново
                </button>
            </div>
        );
    }

    if (!currentCard) return null;

    return (
        <div className="p-4 space-y-4 card sm:p-6">
            {/* Прогресс */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-secondary">
                <span>
                    Карточка {currentIndex + 1} из {cards.length}
                </span>
                <span className="text-xs tag">Говорение</span>
            </div>

            {/* Прогресс-бар */}
            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${((currentIndex + 1) / cards.length) * 100}%`,
                    }}
                />
            </div>

            {/* Карточка */}
            <div className="bg-primary/30 rounded-xl p-4 sm:p-6 border border-gold/10 min-h-[120px] sm:min-h-[160px] flex flex-col justify-center">
                <p className="text-base font-medium text-center break-words sm:text-lg text-primary">
                    {currentCard.promptRu}
                </p>
                {currentCard.hint && (
                    <p className="mt-2 text-xs text-center sm:text-sm text-secondary">
                        💡 {currentCard.hint}
                    </p>
                )}
                <AnimatePresence mode="wait">
                    {showAnswer && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3 mt-3 text-center border sm:p-4 bg-gold/10 border-gold/30 rounded-xl"
                        >
                            <p className="text-base font-bold break-words sm:text-xl text-gold">
                                {currentCard.targetTuvan}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Кнопки управления */}
            <div className="flex flex-wrap justify-center gap-2">
                {!showAnswer ? (
                    <button
                        onClick={handleShowAnswer}
                        className="w-full text-sm btn-primary sm:w-auto sm:text-base"
                    >
                        Показать ответ
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="w-full text-sm btn-success sm:w-auto sm:text-base"
                    >
                        {isLast ? 'Завершить' : 'Следующая →'}
                    </button>
                )}

                {currentIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="flex items-center gap-1 text-sm btn-secondary sm:text-base"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Назад
                    </button>
                )}
            </div>
        </div>
    );
};

export default SpeakingCard;
