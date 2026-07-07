import React, { useState, useEffect } from 'react';
import type { Exercise } from '../../types/content';
import { shuffle } from '../../utils/array';

interface Props {
    exercise: Exercise;
    onAnswer: (isCorrect: boolean, userAnswer?: string) => void;
}

const MatchExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
    const [leftItems, setLeftItems] = useState<string[]>([]);
    const [rightItems, setRightItems] = useState<string[]>([]);
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);
    const [matches, setMatches] = useState<{ left: string; right: string }[]>(
        [],
    );
    const [isDone, setIsDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pairs = exercise.matchPairs || [];

    // Инициализация: перемешиваем обе колонки
    useEffect(() => {
        const leftValues = pairs.map(p => p.left);
        const rightValues = shuffle(pairs.map(p => p.right));
        setLeftItems(shuffle(leftValues));
        setRightItems(rightValues);
        setSelectedLeft(null);
        setSelectedRight(null);
        setMatches([]);
        setIsDone(false);
        setError(null);
    }, [exercise]);

    const handleLeftClick = (left: string) => {
        if (isDone) return;
        if (matches.some(m => m.left === left)) return; // уже сопоставлено
        setSelectedLeft(left);
        setSelectedRight(null);
        setError(null);
    };

    const handleRightClick = (right: string) => {
        if (isDone) return;
        if (matches.some(m => m.right === right)) return; // уже сопоставлено
        if (!selectedLeft) {
            setError('Сначала выбери слово слева');
            return;
        }
        setSelectedRight(right);

        // Проверяем пару
        const pair = pairs.find(
            p => p.left === selectedLeft && p.right === right,
        );
        if (pair) {
            // Правильно
            setMatches([...matches, { left: selectedLeft, right: right }]);
            setSelectedLeft(null);
            setSelectedRight(null);
            setError(null);

            // Проверяем, все ли сопоставлены
            if (matches.length + 1 === pairs.length) {
                setIsDone(true);
                onAnswer(true);
            }
        } else {
            // Неправильно
            setError(`❌ Неправильная пара: "${selectedLeft}" ↔ "${right}"`);
            setSelectedLeft(null);
            setSelectedRight(null);
        }
    };

    const handleReset = () => {
        // Сбрасываем всё
        const leftValues = pairs.map(p => p.left);
        const rightValues = shuffle(pairs.map(p => p.right));
        setLeftItems(shuffle(leftValues));
        setRightItems(rightValues);
        setSelectedLeft(null);
        setSelectedRight(null);
        setMatches([]);
        setIsDone(false);
        setError(null);
    };

    const getLeftClass = (left: string) => {
        if (matches.some(m => m.left === left))
            return 'bg-green-100 border-green-400 text-green-800';
        if (selectedLeft === left)
            return 'bg-yellow-100 border-yellow-400 text-yellow-800';
        return 'bg-white hover:bg-gray-50 border-gray-300';
    };

    const getRightClass = (right: string) => {
        if (matches.some(m => m.right === right))
            return 'bg-green-100 border-green-400 text-green-800';
        if (selectedRight === right)
            return 'bg-yellow-100 border-yellow-400 text-yellow-800';
        return 'bg-white hover:bg-gray-50 border-gray-300';
    };

    return (
        <div className="p-4 bg-white shadow rounded-xl">
            <p className="mb-4 text-lg font-medium">{exercise.question}</p>

            <div className="grid grid-cols-2 gap-8">
                {/* Левая колонка */}
                <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">
                        Русский
                    </h3>
                    <div className="space-y-2">
                        {leftItems.map(left => {
                            const isMatched = matches.some(
                                m => m.left === left,
                            );
                            if (isMatched) {
                                // Показываем сопоставленные серыми, но с галочкой
                                return (
                                    <div
                                        key={left}
                                        className="flex items-center justify-between px-4 py-2 text-gray-500 bg-gray-100 border-2 border-gray-200 rounded-lg"
                                    >
                                        <span>{left}</span>
                                        <span className="text-green-500">
                                            ✓
                                        </span>
                                    </div>
                                );
                            }
                            return (
                                <button
                                    key={left}
                                    onClick={() => handleLeftClick(left)}
                                    className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-all duration-200 ${getLeftClass(
                                        left,
                                    )}`}
                                >
                                    {left}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Правая колонка */}
                <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">
                        Тувинский
                    </h3>
                    <div className="space-y-2">
                        {rightItems.map(right => {
                            const isMatched = matches.some(
                                m => m.right === right,
                            );
                            if (isMatched) {
                                return (
                                    <div
                                        key={right}
                                        className="flex items-center justify-between px-4 py-2 text-gray-500 bg-gray-100 border-2 border-gray-200 rounded-lg"
                                    >
                                        <span>{right}</span>
                                        <span className="text-green-500">
                                            ✓
                                        </span>
                                    </div>
                                );
                            }
                            return (
                                <button
                                    key={right}
                                    onClick={() => handleRightClick(right)}
                                    className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-all duration-200 ${getRightClass(
                                        right,
                                    )}`}
                                >
                                    {right}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Ошибка */}
            {error && (
                <div className="p-3 mt-4 border border-red-300 rounded-lg bg-red-50">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 mt-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                        Начать заново
                    </button>
                </div>
            )}

            {/* Успех */}
            {isDone && (
                <div className="p-3 mt-4 border border-green-300 rounded-lg bg-green-50">
                    <p className="text-green-600">
                        ✅ Все пары сопоставлены верно!
                    </p>
                </div>
            )}

            {/* Кнопка сброса (для удобства) */}
            {!isDone && (
                <button
                    onClick={handleReset}
                    className="mt-4 text-sm text-gray-400 underline hover:text-gray-600"
                >
                    Сбросить всё
                </button>
            )}
        </div>
    );
};

export default MatchExercise;
