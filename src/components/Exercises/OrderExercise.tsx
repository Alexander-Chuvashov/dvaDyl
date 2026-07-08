// src/components/Exercises/OrderExercise.tsx
import React, { useState, useEffect } from 'react';
import type { Exercise } from '../../types/content';
import { shuffle } from '../../utils/array';
import ClickableWord from '../UI/ClickableWord';

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

    useEffect(() => {
        if (exercise.orderItems) {
            setAvailable(shuffle(exercise.orderItems));
            setSelected([]);
            setIsCorrect(null);
            setSubmitted(false);
        }
    }, [exercise]);

    useEffect(() => {
        if (available.length === 0 && selected.length > 0 && !submitted) {
            const correct =
                JSON.stringify(selected) === JSON.stringify(exercise.correct);
            setIsCorrect(correct);
            setSubmitted(true);
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
    };

    const getItemColor = (item: string) => {
        if (!submitted)
            return 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300';
        if (isCorrect) return 'bg-green-100 text-green-800 border-green-300';
        return 'bg-red-100 text-red-800 border-red-300';
    };

    return (
        <div
            className={`p-4 bg-white rounded-xl shadow ${submitted && !isCorrect ? 'animate-shake' : ''}`}
        >
            <p className="mb-4 text-lg font-medium">
                <ClickableWord word={exercise.question} />
            </p>
            {exercise.hint && (
                <p className="mb-4 text-sm text-gray-400">💡 {exercise.hint}</p>
            )}

            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                {selected.length === 0 && (
                    <span className="text-sm text-gray-400">
                        Кликни на слова ниже, чтобы составить предложение
                    </span>
                )}
                {selected.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleRemove(item)}
                        className={`px-3 py-2 rounded-lg border-2 ${getItemColor(item)} transition-all duration-200 cursor-pointer hover:shadow-md`}
                    >
                        <ClickableWord word={item} />
                        <span className="ml-1 text-xs text-gray-500">✕</span>
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {available.map(item => (
                    <button
                        key={item}
                        onClick={() => handleSelect(item)}
                        className="px-4 py-2 transition-all duration-200 bg-gray-200 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-300 hover:shadow-md"
                    >
                        <ClickableWord word={item} />
                    </button>
                ))}
            </div>

            {submitted && !isCorrect && (
                <div className="p-3 mt-4 border border-red-300 rounded-lg bg-red-50">
                    <p className="text-red-600">
                        ❌ Неправильный порядок. Правильный порядок:{' '}
                        <span className="font-bold">
                            {Array.isArray(exercise.correct)
                                ? exercise.correct.join(' ')
                                : exercise.correct}
                        </span>
                    </p>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 mt-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                        Перемешать и начать заново
                    </button>
                </div>
            )}

            {submitted && isCorrect && (
                <div className="p-3 mt-4 border border-green-300 rounded-lg bg-green-50 animate-bounce-success">
                    <p className="text-green-600">✅ Правильно!</p>
                </div>
            )}
        </div>
    );
};

export default OrderExercise;
