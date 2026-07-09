// src/components/Exercises/TranslateExercise.tsx
import React, { useState, useRef } from 'react';
import type { Exercise } from '../../types/content';
// import AudioButton from '../UI/AudioButton';
import TuvanKeyboard from '../UI/TuvanKeyboard';
import ClickableWord from '../UI/ClickableWord';

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
                className={`card ${isCorrect ? 'border-olive' : 'border-terracotta'}`}
            >
                <p className="text-lg">
                    <ClickableWord word={exercise.question} />
                </p>
                {isCorrect ? (
                    <div className="p-3 mt-4 border rounded-lg bg-olive/10 border-olive text-olive animate-bounce-success">
                        ✅ Правильно!
                    </div>
                ) : (
                    <div className="p-3 mt-4 border rounded-lg bg-terracotta/10 border-terracotta text-terracotta">
                        ❌ Неправильно. Правильный ответ:{' '}
                        <span className="font-bold">{exercise.correct}</span>
                    </div>
                )}
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setUserAnswer('');
                    }}
                    className="mt-3 btn-secondary"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="flex items-center gap-2 text-lg font-medium text-dark">
                <ClickableWord word={exercise.question} />
                {/* <AudioButton text={exercise.question} lang="ru-RU" size="sm" /> */}
            </div>
            {exercise.hint && (
                <p className="mt-1 text-sm text-dark/60">💡 {exercise.hint}</p>
            )}
            <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Введи перевод..."
                className="mt-3 input-field"
                autoFocus
            />
            <TuvanKeyboard
                inputRef={inputRef}
                onInput={newValue => setUserAnswer(newValue)}
            />
            <button type="submit" className="mt-3 btn-primary">
                Проверить
            </button>
        </form>
    );
};

export default TranslateExercise;
