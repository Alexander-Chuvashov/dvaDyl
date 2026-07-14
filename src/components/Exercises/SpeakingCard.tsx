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
            onAnswer(true); // Все карточки пройдены
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
            <div className="text-center card">
                <p className="text-xl font-bold text-success">
                    🎉 Все карточки пройдены!
                </p>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 mx-auto mt-4 btn-secondary"
                >
                    <RotateCcw className="w-4 h-4" />
                    Пройти заново
                </button>
            </div>
        );
    }

    if (!currentCard) return null;

    return (
        <div className="space-y-6 card">
            {/* Прогресс */}
            <div className="flex items-center justify-between text-sm text-secondary">
                <span>
                    Карточка {currentIndex + 1} из {cards.length}
                </span>
                <span className="tag">Говорение</span>
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
            <div className="bg-primary/30 rounded-xl p-6 border border-gold/10 min-h-[160px] flex flex-col justify-center">
                <p className="text-lg font-medium text-center text-primary">
                    {currentCard.promptRu}
                </p>
                {currentCard.hint && (
                    <p className="mt-2 text-sm text-center text-secondary">
                        💡 {currentCard.hint}
                    </p>
                )}
                <AnimatePresence mode="wait">
                    {showAnswer && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 mt-4 text-center border bg-gold/10 border-gold/30 rounded-xl"
                        >
                            <p className="text-xl font-bold text-gold">
                                {currentCard.targetTuvan}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Кнопки управления */}
            <div className="flex flex-wrap justify-center gap-3">
                {!showAnswer ? (
                    <button onClick={handleShowAnswer} className="btn-primary">
                        Показать ответ
                    </button>
                ) : (
                    <button onClick={handleNext} className="btn-success">
                        {isLast ? 'Завершить' : 'Следующая →'}
                    </button>
                )}

                {currentIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="flex items-center gap-1 btn-secondary"
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
