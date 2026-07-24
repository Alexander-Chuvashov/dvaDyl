// src/components/Exercises/ChoiceExercise.tsx
import React, { useState } from 'react';
import type { Exercise } from '../../types/content';
import ClickableWord from '../UI/ClickableWord';

interface Props {
    exercise: Exercise;
    onAnswer: (
        isCorrect: boolean,
        userAnswer?: string,
        correctAnswer?: string,
    ) => void;
}

const ChoiceExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSelect = (option: string) => {
        if (submitted) return;
        setSelected(option);
    };

    const handleSubmit = () => {
        if (!selected) return;
        const correct = selected === exercise.correct;
        setIsCorrect(correct);
        setSubmitted(true);
        onAnswer(correct, selected, exercise.correct?.toString());
    };

    const getOptionClass = (option: string) => {
        if (!submitted) {
            return selected === option
                ? 'border-gold bg-gold/10 ring-2 ring-gold'
                : 'border-border bg-card hover:border-gold hover:bg-card-hover';
        }
        if (option === exercise.correct)
            return 'border-success bg-success/10 text-success';
        if (selected === option && option !== exercise.correct)
            return 'border-error bg-error/10 text-error';
        return 'border-border bg-card opacity-60';
    };

    return (
        <div
            className={`card p-4 sm:p-6 space-y-3 sm:space-y-4 ${submitted && !isCorrect ? 'animate-shake' : ''}`}
        >
            <p className="text-base font-medium sm:text-lg text-primary">
                {exercise.question && (
                    <ClickableWord word={exercise.question} />
                )}
            </p>
            <div className="space-y-2 sm:space-y-3">
                {exercise.options?.map(option => (
                    <div
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all cursor-pointer text-sm sm:text-base ${getOptionClass(option)} ${
                            !submitted && selected === option
                                ? 'shadow-gold'
                                : ''
                        }`}
                    >
                        <ClickableWord word={option} />
                        {submitted && option === exercise.correct && ' ✅'}
                        {submitted &&
                            selected === option &&
                            option !== exercise.correct &&
                            ' ❌'}
                    </div>
                ))}
            </div>
            {!submitted && (
                <button
                    onClick={handleSubmit}
                    disabled={!selected}
                    className="w-full text-sm btn-primary sm:w-auto sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Проверить
                </button>
            )}
            {submitted && !isCorrect && (
                <div className="p-2 text-sm border rounded-lg sm:p-3 bg-error/10 border-error/30 text-error sm:text-base">
                    ❌ Неправильно. Правильный ответ:{' '}
                    <span className="font-bold">{exercise.correct}</span>
                </div>
            )}
            {submitted && isCorrect && (
                <div className="p-2 text-sm border rounded-lg sm:p-3 bg-success/10 border-success/30 text-success sm:text-base animate-bounce-success">
                    ✅ Правильно!
                </div>
            )}
        </div>
    );
};

export default ChoiceExercise;
