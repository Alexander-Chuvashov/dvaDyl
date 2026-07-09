// src/components/Exercises/OrderExercise.tsx
import React, { useState, useEffect } from 'react';
import type { Exercise } from '../../types/content';
import { shuffle } from '../../utils/array';
import ClickableWord from '../UI/ClickableWord';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    exercise: Exercise;
    onAnswer: (
        isCorrect: boolean,
        userAnswer?: string,
        correctAnswer?: string,
    ) => void;
}

const OrderExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
    const [available, setAvailable] = useState<string[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [showReset, setShowReset] = useState(false);

    useEffect(() => {
        if (exercise.orderItems) {
            setAvailable(shuffle(exercise.orderItems));
            setSelected([]);
            setIsCorrect(null);
            setSubmitted(false);
            setShowReset(false);
        }
    }, [exercise]);

    useEffect(() => {
        if (available.length === 0 && selected.length > 0 && !submitted) {
            const correct =
                JSON.stringify(selected) === JSON.stringify(exercise.correct);
            setIsCorrect(correct);
            setSubmitted(true);
            setShowReset(!correct);
            const userAnswer = selected.join(' ');
            const correctAnswer = Array.isArray(exercise.correct)
                ? exercise.correct.join(' ')
                : exercise.correct;
            onAnswer(correct, userAnswer, correctAnswer);
        }
    }, [available, selected, exercise.correct, onAnswer, submitted]);

    const handleSelect = (item: string) => {
        if (submitted) return;
        setSelected([...selected, item]);
        setAvailable(available.filter(i => i !== item));
    };

    const handleRemove = (item: string) => {
        if (submitted) return;
        setSelected(selected.filter(i => i !== item));
        setAvailable([...available, item]);
    };

    const handleReset = () => {
        setAvailable(shuffle(exercise.orderItems || []));
        setSelected([]);
        setIsCorrect(null);
        setSubmitted(false);
        setShowReset(false);
    };

    const getItemClass = (item: string) => {
        if (!submitted) {
            return 'bg-card border-border text-primary hover:border-gold hover:bg-card-hover';
        }
        if (isCorrect) {
            return 'bg-success/10 border-success/30 text-success';
        }
        return 'bg-error/10 border-error/30 text-error';
    };

    return (
        <div className="space-y-4 card">
            <p className="text-lg font-medium text-primary">
                <ClickableWord word={exercise.question} />
            </p>
            {exercise.hint && (
                <p className="text-sm text-secondary">💡 {exercise.hint}</p>
            )}

            {/* Выбранные элементы (порядок) */}
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-primary/30 rounded-xl border-2 border-dashed border-border">
                {selected.length === 0 && (
                    <span className="text-sm text-secondary/50">
                        Кликни на слова ниже, чтобы составить предложение
                    </span>
                )}
                {selected.map((item, index) => (
                    <motion.button
                        key={index}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={() => handleRemove(item)}
                        className={`px-3 py-2 rounded-xl border transition-all duration-200 hover:shadow-gold ${getItemClass(item)}`}
                    >
                        <ClickableWord word={item} />
                        <span className="ml-1 text-xs text-secondary/50">
                            ✕
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* Доступные элементы */}
            <div className="flex flex-wrap gap-2">
                {available.map(item => (
                    <motion.button
                        key={item}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleSelect(item)}
                        className="px-4 py-2 transition-all duration-200 border rounded-xl border-border bg-card hover:border-gold hover:bg-card-hover text-primary"
                    >
                        <ClickableWord word={item} />
                    </motion.button>
                ))}
            </div>

            {/* Результат */}
            <AnimatePresence>
                {submitted && !isCorrect && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 border rounded-xl border-error/30 bg-error/10 text-error"
                    >
                        <p>
                            ❌ Неправильный порядок. Правильный порядок:{' '}
                            <span className="font-bold">
                                {Array.isArray(exercise.correct)
                                    ? exercise.correct.join(' ')
                                    : exercise.correct}
                            </span>
                        </p>
                        {showReset && (
                            <button
                                onClick={handleReset}
                                className="mt-2 text-sm btn-secondary"
                            >
                                Перемешать и начать заново
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {submitted && isCorrect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="p-4 font-semibold text-center border rounded-xl border-success/30 bg-success/10 text-success"
                    >
                        ✅ Правильно!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Кнопка сброса (всегда доступна) */}
            {!submitted && (
                <button
                    onClick={handleReset}
                    className="text-sm transition-colors text-secondary hover:text-primary"
                >
                    Сбросить всё
                </button>
            )}
        </div>
    );
};

export default OrderExercise;
