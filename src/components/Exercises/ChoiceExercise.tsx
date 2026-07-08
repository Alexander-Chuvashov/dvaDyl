import React, { useState } from 'react';
import type { Exercise } from '../../types/content';
import AudioButton from '../UI/AudioButton';

interface Props {
    exercise: Exercise;
    onAnswer: (isCorrect: boolean, answer?: string) => void;
}

const ChoiceExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [animating, setAnimating] = useState(false);

    const handleSelect = (option: string) => {
        if (submitted) return;
        setSelected(option);
    };

    const handleSubmit = () => {
        if (!selected) return;
        const isAnswerCorrect = selected === exercise.correct;
        setIsCorrect(isAnswerCorrect);
        setSubmitted(true);
        setAnimating(true);
        if (isAnswerCorrect) {
            onAnswer(true, selected);
        } else {
            onAnswer(false, selected);
        }
        setTimeout(() => setAnimating(false), 600);
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
            className={`card ${animating ? (isCorrect ? 'animate-bounce-success' : 'animate-shake') : ''}`}
        >
            <p className="text-lg font-medium text-dark">{exercise.question}</p>
            <div className="mt-4 space-y-2">
                {exercise.options?.map(option => (
                    <div
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${getOptionClass(option)}`}
                    >
                        <span>{option}</span>
                        <AudioButton text={option} lang="tuv" size="sm" />
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
                    <button
                        onClick={() => {
                            setSelected(null);
                            setSubmitted(false);
                            setIsCorrect(false);
                        }}
                        className="ml-4 text-sm btn-secondary"
                    >
                        Попробовать снова
                    </button>
                </div>
            )}
            {submitted && isCorrect && (
                <div className="p-3 mt-4 border rounded-lg bg-olive/10 border-olive text-olive animate-bounce-success">
                    ✅ Правильно!
                </div>
            )}

            {/* Дополнительная информация */}
            {(exercise.translation ||
                exercise.transcription ||
                exercise.context) && (
                <div className="p-3 mt-4 border rounded-lg bg-cream/50 border-cream">
                    {exercise.translation && (
                        <p className="text-sm text-dark/80">
                            <span className="font-medium">Перевод:</span>{' '}
                            {exercise.translation}
                        </p>
                    )}
                    {exercise.transcription && (
                        <p className="text-sm text-dark/80">
                            <span className="font-medium">Транскрипция:</span>{' '}
                            {exercise.transcription}
                        </p>
                    )}
                    {exercise.context && (
                        <p className="text-sm text-dark/80">
                            <span className="font-medium">Пример:</span>{' '}
                            {exercise.context}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChoiceExercise;
