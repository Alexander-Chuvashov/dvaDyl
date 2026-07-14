// src/components/Exercises/MatchExercise.tsx
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

const MatchExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
    const [leftItems, setLeftItems] = useState<string[]>([]);
    const [rightItems, setRightItems] = useState<string[]>([]);
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);
    const [matches, setMatches] = useState<{ left: string; right: string }[]>(
        [],
    );
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pairs = exercise.matchPairs || [];

    useEffect(() => {
        const leftValues = pairs.map(p => p.left);
        const rightValues = shuffle(pairs.map(p => p.right));
        setLeftItems(shuffle(leftValues));
        setRightItems(rightValues);
        setSelectedLeft(null);
        setSelectedRight(null);
        setMatches([]);
        setSubmitted(false);
        setIsCorrect(false);
        setError(null);
    }, [exercise]);

    const handleLeftClick = (left: string) => {
        if (submitted) return;
        if (matches.some(m => m.left === left)) return;
        setSelectedLeft(left);
        setSelectedRight(null);
        setError(null);
    };

    const handleRightClick = (right: string) => {
        if (submitted) return;
        if (matches.some(m => m.right === right)) return;
        if (!selectedLeft) {
            setError('Сначала выбери слово слева');
            return;
        }
        setSelectedRight(right);

        const pair = pairs.find(
            p => p.left === selectedLeft && p.right === right,
        );
        if (pair) {
            const newMatches = [
                ...matches,
                { left: selectedLeft, right: right },
            ];
            setMatches(newMatches);
            setSelectedLeft(null);
            setSelectedRight(null);
            setError(null);

            if (newMatches.length === pairs.length) {
                setSubmitted(true);
                setIsCorrect(true);
                const userAnswer = newMatches
                    .map(m => `${m.left} ↔ ${m.right}`)
                    .join(', ');
                const correctAnswer = pairs
                    .map(p => `${p.left} ↔ ${p.right}`)
                    .join(', ');
                onAnswer(true, userAnswer, correctAnswer);
            }
        } else {
            setError(`❌ Неправильная пара: "${selectedLeft}" ↔ "${right}"`);
            setSelectedLeft(null);
            setSelectedRight(null);
        }
    };

    const handleReset = () => {
        const leftValues = pairs.map(p => p.left);
        const rightValues = shuffle(pairs.map(p => p.right));
        setLeftItems(shuffle(leftValues));
        setRightItems(rightValues);
        setSelectedLeft(null);
        setSelectedRight(null);
        setMatches([]);
        setSubmitted(false);
        setIsCorrect(false);
        setError(null);
    };

    const getLeftClass = (left: string) => {
        if (matches.some(m => m.left === left))
            return 'bg-success/10 border-success/30 text-success';
        if (selectedLeft === left) return 'border-gold bg-gold/10 text-gold';
        return 'border-border bg-card hover:bg-card-hover text-primary';
    };

    const getRightClass = (right: string) => {
        if (matches.some(m => m.right === right))
            return 'bg-success/10 border-success/30 text-success';
        if (selectedRight === right) return 'border-gold bg-gold/10 text-gold';
        return 'border-border bg-card hover:bg-card-hover text-primary';
    };

    return (
        <div
            className={`card ${submitted && isCorrect ? 'border-success/30' : ''}`}
        >
            <p className="mb-4 text-lg font-medium text-primary">
                <ClickableWord word={exercise.question ?? ''} />
            </p>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase text-secondary">
                        Русский
                    </h3>
                    <div className="space-y-2">
                        {leftItems.map((left, idx) => {
                            const isMatched = matches.some(
                                m => m.left === left,
                            );
                            if (isMatched) {
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between px-4 py-2 border rounded-xl border-success/30 bg-success/10 text-success"
                                    >
                                        <ClickableWord word={left} />
                                        <span className="text-success">✓</span>
                                    </div>
                                );
                            }
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleLeftClick(left)}
                                    className={`w-full text-left px-4 py-2 rounded-xl border-2 transition-all duration-200 ${getLeftClass(left)}`}
                                >
                                    <ClickableWord word={left} />
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase text-secondary">
                        Тувинский
                    </h3>
                    <div className="space-y-2">
                        {rightItems.map((right, idx) => {
                            const isMatched = matches.some(
                                m => m.right === right,
                            );
                            if (isMatched) {
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between px-4 py-2 border rounded-xl border-success/30 bg-success/10 text-success"
                                    >
                                        <ClickableWord word={right} />
                                        <span className="text-success">✓</span>
                                    </div>
                                );
                            }
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleRightClick(right)}
                                    className={`w-full text-left px-4 py-2 rounded-xl border-2 transition-all duration-200 ${getRightClass(right)}`}
                                >
                                    <ClickableWord word={right} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 mt-4 border rounded-xl border-error/30 bg-error/10 text-error"
                    >
                        <p>{error}</p>
                        <button
                            onClick={handleReset}
                            className="mt-2 text-sm btn-secondary"
                        >
                            Начать заново
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {submitted && isCorrect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="p-3 mt-4 font-semibold text-center border rounded-xl border-success/30 bg-success/10 text-success"
                    >
                        ✅ Все пары сопоставлены верно!
                    </motion.div>
                )}
            </AnimatePresence>

            {!submitted && !error && (
                <button
                    onClick={handleReset}
                    className="mt-4 text-sm transition-colors text-secondary hover:text-primary"
                >
                    Сбросить всё
                </button>
            )}
        </div>
    );
};

export default MatchExercise;
