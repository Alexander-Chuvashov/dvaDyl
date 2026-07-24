// src/components/Exercises/TranslateExercise.tsx
import React, { useState, useRef } from 'react';
import type { Exercise } from '../../types/content';
import TuvanKeyboard from '../UI/TuvanKeyboard';
import ClickableWord from '../UI/ClickableWord';
import Tooltip from '../UI/Tooltip';

interface Props {
    exercise: Exercise;
    onAnswer: (
        isCorrect: boolean,
        userAnswer?: string,
        correctAnswer?: string,
    ) => void;
}

const TranslateExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const correct =
            userAnswer.trim().toLowerCase() ===
            exercise.correct?.toString().toLowerCase();
        setIsCorrect(correct);
        setSubmitted(true);
        onAnswer(correct, userAnswer.trim(), exercise.correct?.toString());
    };

    if (submitted) {
        return (
            <div
                className={`card p-4 sm:p-6 ${isCorrect ? 'border-success/30' : 'border-error/30'}`}
            >
                <p className="text-sm font-medium sm:text-base text-primary">
                    {exercise.question && (
                        <ClickableWord word={exercise.question} />
                    )}
                </p>
                {isCorrect ? (
                    <div className="p-3 mt-3 text-sm border rounded-lg sm:mt-4 bg-success/10 border-success/30 text-success sm:text-base animate-bounce-success">
                        ✅ Правильно!
                    </div>
                ) : (
                    <div className="p-3 mt-3 text-sm border rounded-lg sm:mt-4 bg-error/10 border-error/30 text-error sm:text-base">
                        ❌ Неправильно. Правильный ответ:{' '}
                        <span className="font-bold">{exercise.correct}</span>
                    </div>
                )}
                <Tooltip text="Попробовать снова">
                    <button
                        onClick={() => {
                            setSubmitted(false);
                            setUserAnswer('');
                        }}
                        className="mt-3 text-sm btn-secondary sm:text-base"
                    >
                        Попробовать снова
                    </button>
                </Tooltip>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 space-y-3 card sm:p-6 sm:space-y-4"
        >
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium sm:text-base text-primary">
                <span>
                    {exercise.question && (
                        <ClickableWord word={exercise.question} />
                    )}
                </span>
            </div>
            {exercise.hint && (
                <p className="text-xs sm:text-sm text-secondary/60">
                    💡 {exercise.hint}
                </p>
            )}
            <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Введи перевод..."
                className="text-sm input-field sm:text-base"
                autoFocus
            />
            <TuvanKeyboard
                inputRef={inputRef}
                onInput={newValue => setUserAnswer(newValue)}
            />
            <Tooltip text="Проверить ответ">
                <button
                    type="submit"
                    className="w-full text-sm btn-primary sm:text-base"
                >
                    Проверить
                </button>
            </Tooltip>
        </form>
    );
};

export default TranslateExercise;
