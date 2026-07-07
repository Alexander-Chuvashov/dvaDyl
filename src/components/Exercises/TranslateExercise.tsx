// src/components/Exercises/TranslateExercise.tsx
import React, { useState } from 'react';
import type { Exercise } from '../../types/content';
import AudioButton from '../UI/AudioButton';

interface Props {
    exercise: Exercise;
    onAnswer: (isCorrect: boolean, userAnswer?: string) => void;
}

const TranslateExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userInput = userAnswer.trim();
        const correct =
            userInput.toLowerCase() ===
            exercise.correct?.toString().toLowerCase();
        setIsCorrect(correct);
        setSubmitted(true);
        if (correct) {
            onAnswer(true);
        }
        onAnswer(correct, userInput);
    };

    if (submitted) {
        return (
            <div
                className={`card ${isCorrect ? 'border-olive' : 'border-terracotta'} ${
                    isCorrect ? 'animate-bounce-success' : 'animate-shake'
                }`}
            >
                <p className="text-lg">{exercise.question}</p>
                {isCorrect ? (
                    <div className="p-3 mt-4 border rounded-lg bg-olive/10 border-olive text-olive">
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
                    className="mt-4 btn-secondary"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="card">
            <p className="text-lg font-medium text-dark">{exercise.question}</p>
            {exercise.hint && (
                <p className="mt-1 text-sm text-dark/60">💡 {exercise.hint}</p>
            )}
            <input
                type="text"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Введи перевод..."
                className="mt-3 input-field"
                autoFocus
            />
            <button type="submit" className="mt-3 btn-primary">
                Проверить
            </button>
            <div className="flex items-center gap-2 text-lg font-medium text-dark">
                {exercise.question}
                {exercise.audioUrl ? (
                    <span className="text-xs text-gray-400">
                        (аудио не реализовано для файлов)
                    </span>
                ) : (
                    // Если нет — используем синтез
                    <AudioButton
                        text={exercise.question}
                        lang="ru-RU"
                        size="sm"
                    />
                )}
            </div>
        </form>
    );
};

export default TranslateExercise;
