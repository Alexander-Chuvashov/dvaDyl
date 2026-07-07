import React, { useState } from 'react';
import type { Exercise } from '../../types/content';
import AudioButton from '../UI/AudioButton';

interface Props {
    exercise: Exercise;
    onAnswer: (isCorrect: boolean, userAnswer?: string) => void;
}

const ListenExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
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
        if (correct) onAnswer(true);
    };

    // Сначала прослушиваем слово — оно в exercise.question (на тувинском)
    // А варианты — переводы на русский
    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-dark">
                    Прослушай слово и выбери правильный перевод:
                </p>
                <AudioButton text={exercise.question} lang="ru-RU" size="lg" />
            </div>
            {exercise.hint && (
                <p className="mt-1 text-sm text-dark/60">💡 {exercise.hint}</p>
            )}
            <div className="mt-4 space-y-2">
                {exercise.options?.map(option => (
                    <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                            !submitted
                                ? selected === option
                                    ? 'border-terracotta bg-terracotta/10 ring-2 ring-terracotta'
                                    : 'border-cream hover:border-terracotta/30'
                                : option === exercise.correct
                                  ? 'border-olive bg-olive/10'
                                  : selected === option &&
                                      option !== exercise.correct
                                    ? 'border-terracotta bg-terracotta/10'
                                    : 'border-cream opacity-60'
                        }`}
                        disabled={submitted}
                    >
                        {option}
                        {submitted && option === exercise.correct && ' ✅'}
                        {submitted &&
                            selected === option &&
                            option !== exercise.correct &&
                            ' ❌'}
                    </button>
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
                    ❌ Неправильно. Правильный ответ: {exercise.correct}
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
        </div>
    );
};

export default ListenExercise;
