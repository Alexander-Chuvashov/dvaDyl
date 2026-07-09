// src/components/Exercises/ChoiceExercise.tsx
import React, { useState } from 'react';
import type { Exercise } from '../../types/content';
// import AudioButton from '../UI/AudioButton';
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
                ? 'border-terracotta bg-terracotta/10 ring-2 ring-terracotta'
                : 'border-cream hover:border-terracotta/30';
        }
        if (option === exercise.correct) return 'border-olive bg-olive/10';
        if (selected === option && option !== exercise.correct)
            return 'border-terracotta bg-terracotta/10';
        return 'border-cream opacity-60';
    };

    return (
        <div
            className={`card ${submitted && !isCorrect ? 'animate-shake' : ''}`}
        >
            <p className="text-lg font-medium text-dark">
                <ClickableWord word={exercise.question} />
            </p>
            <div className="mt-4 space-y-2">
                {exercise.options?.map(option => (
                    <div
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${getOptionClass(option)}`}
                    >
                        <ClickableWord word={option} />
                        {/* {!submitted && (
                            <AudioButton
                                text={option}
                                lang="tuv"
                                size="sm"
                                className="float-right"
                            />
                        )} */}
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
                    className="mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Проверить
                </button>
            )}
            {submitted && !isCorrect && (
                <div className="p-3 mt-4 border rounded-lg bg-terracotta/10 border-terracotta text-terracotta">
                    ❌ Неправильно. Правильный ответ:{' '}
                    <span className="font-bold">{exercise.correct}</span>
                </div>
            )}
            {submitted && isCorrect && (
                <div className="p-3 mt-4 border rounded-lg bg-olive/10 border-olive text-olive animate-bounce-success">
                    ✅ Правильно!
                </div>
            )}
        </div>
    );
};

export default ChoiceExercise;
