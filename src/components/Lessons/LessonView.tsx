// src/components/Lessons/LessonView.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import ExerciseRenderer from '../Exercises/ExerciseRenderer';
import ProgressBar from '../Progress/ProgressBar';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import Character from '../UI/Character';
import type { Lesson } from '../../types/content';

type CharacterState = 'idle' | 'happy' | 'sad' | 'celebrate' | 'thinking';

interface LessonViewProps {
    lesson: Lesson;
    onComplete?: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onComplete }) => {
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [completedExercises, setCompletedExercises] = useState<
        Record<string, boolean>
    >({});
    const [attemptedExercises, setAttemptedExercises] = useState<
        Record<string, boolean>
    >({});
    const [wrongExerciseIds, setWrongExerciseIds] = useState<string[]>([]);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [reviewCompleted, setReviewCompleted] = useState<
        Record<string, boolean>
    >({});
    const [feedback, setFeedback] = useState<{
        type: 'correct' | 'incorrect';
        message: string;
        explanation?: string;
    } | null>(null);
    const [characterState, setCharacterState] =
        useState<CharacterState>('idle');
    const isProcessingRef = useRef(false);
    const isLessonCompletedRef = useRef(false);

    const {
        userId,
        answerExercise,
        syncAnswer,
        syncStreak,
        syncProgress,
        completedLessonIds,
        checkAndUnlockAchievements,
        xp,
        streak,
    } = useAppStore();

    const exercises = lesson.exercises;
    const currentExercise = exercises[exerciseIndex];
    const isLast = exerciseIndex === exercises.length - 1;

    // Режим повторения – только ошибочные упражнения
    const reviewExercises = exercises.filter(ex =>
        wrongExerciseIds.includes(ex.id),
    );
    const currentReviewExercise = reviewExercises[exerciseIndex] || null;

    // Все ли упражнения были попытаны
    const allAttempted = exercises.every(
        ex => attemptedExercises[ex.id] === true,
    );
    // Все ли упражнения выполнены правильно
    const allCompleted = exercises.every(
        ex => completedExercises[ex.id] === true,
    );
    // Все ли ошибки исправлены
    const allReviewCompleted = reviewExercises.every(
        ex => reviewCompleted[ex.id] === true,
    );

    // Завершение урока (единая функция)
    const completeLesson = useCallback(async () => {
        if (isLessonCompletedRef.current) return;
        isLessonCompletedRef.current = true;
        setCharacterState('celebrate');
        try {
            if (!userId) return;
            await syncProgress(userId, lesson.id, 'completed', 100, 50);
            await syncStreak(userId);
            const stats = {
                lessonsCompleted: completedLessonIds.length + 1,
                streak: streak + 1,
                xp: xp + 50,
            };
            const newAchievements = await checkAndUnlockAchievements(
                userId,
                stats,
            );
            if (newAchievements.length > 0) {
                newAchievements.forEach(ach => {
                    alert(`🎉 Новое достижение: ${ach.icon} ${ach.name}`);
                });
            }
            setTimeout(() => {
                setCharacterState('idle');
                onComplete?.();
            }, 1200);
        } catch (error) {
            console.error('Ошибка завершения урока:', error);
            alert('Ошибка сохранения прогресса. Попробуйте ещё раз.');
            isLessonCompletedRef.current = false;
            setCharacterState('idle');
        }
    }, [
        userId,
        lesson.id,
        syncProgress,
        syncStreak,
        completedLessonIds,
        streak,
        xp,
        checkAndUnlockAchievements,
        onComplete,
    ]);

    // Эффект: проверка завершения основного прохода
    useEffect(() => {
        if (!userId) return;
        if (isLessonCompletedRef.current) return;
        if (completedLessonIds.includes(lesson.id)) return;
        if (!allAttempted) return;

        // Если есть ошибки – переходим в режим повторения
        if (wrongExerciseIds.length > 0) {
            setIsReviewMode(true);
            setExerciseIndex(0);
            setReviewCompleted({});
            setFeedback(null);
            setCharacterState('thinking');
            return;
        }

        // Ошибок нет – завершаем урок
        completeLesson();
    }, [
        allAttempted,
        wrongExerciseIds,
        userId,
        lesson.id,
        completedLessonIds,
        completeLesson,
    ]);

    // Эффект: завершение режима повторения
    useEffect(() => {
        if (!userId) return;
        if (!isReviewMode) return;
        if (isLessonCompletedRef.current) return;
        if (completedLessonIds.includes(lesson.id)) return;
        if (!allReviewCompleted) return;
        completeLesson();
    }, [
        allReviewCompleted,
        isReviewMode,
        userId,
        lesson.id,
        completedLessonIds,
        completeLesson,
    ]);

    // Обработка ответа
    const handleAnswer = useCallback(
        async (isCorrect: boolean, userAnswer?: string) => {
            if (isProcessingRef.current) return;
            const exerciseId = currentExercise.id;

            if (isReviewMode && reviewCompleted[exerciseId] === true) return;
            if (!isReviewMode && completedExercises[exerciseId] === true)
                return;

            isProcessingRef.current = true;

            if (userId && userAnswer !== undefined) {
                try {
                    await syncAnswer(userId, exerciseId, userAnswer, isCorrect);
                } catch (e) {
                    console.error('Ошибка сохранения ответа:', e);
                }
            }

            answerExercise(exerciseId, isCorrect, lesson);
            setAttemptedExercises(prev => ({ ...prev, [exerciseId]: true }));

            if (isCorrect) {
                if (isReviewMode) {
                    setReviewCompleted(prev => ({
                        ...prev,
                        [exerciseId]: true,
                    }));
                    setWrongExerciseIds(prev =>
                        prev.filter(id => id !== exerciseId),
                    );
                } else {
                    setCompletedExercises(prev => ({
                        ...prev,
                        [exerciseId]: true,
                    }));
                    setWrongExerciseIds(prev =>
                        prev.filter(id => id !== exerciseId),
                    );
                }
                setFeedback({ type: 'correct', message: '✅ Правильно!' });
                setCharacterState('happy');

                setTimeout(() => {
                    setFeedback(null);
                    setCharacterState('idle');
                    const list = isReviewMode ? reviewExercises : exercises;
                    if (exerciseIndex < list.length - 1) {
                        setExerciseIndex(prev => prev + 1);
                    }
                    isProcessingRef.current = false;
                }, 700);
            } else {
                if (!isReviewMode) {
                    if (!wrongExerciseIds.includes(exerciseId)) {
                        setWrongExerciseIds(prev => [...prev, exerciseId]);
                    }
                }

                const correctAnswer = Array.isArray(currentExercise.correct)
                    ? currentExercise.correct.join(' ')
                    : currentExercise.correct || '';

                setFeedback({
                    type: 'incorrect',
                    message: `❌ Неправильно. Правильный ответ: ${correctAnswer}`,
                    explanation: currentExercise.explanation,
                });
                setCharacterState('sad');
                isProcessingRef.current = false;
            }
        },
        [
            currentExercise,
            isReviewMode,
            reviewExercises,
            exercises,
            userId,
            syncAnswer,
            answerExercise,
            lesson,
            completedExercises,
            reviewCompleted,
            wrongExerciseIds,
        ],
    );

    const handleContinueAfterError = () => {
        setFeedback(null);
        setCharacterState('idle');
        const list = isReviewMode ? reviewExercises : exercises;
        if (exerciseIndex < list.length - 1) {
            setExerciseIndex(prev => prev + 1);
        }
    };

    // Если урок уже пройден
    if (completedLessonIds.includes(lesson.id)) {
        return (
            <div className="text-center card">
                <p className="font-semibold text-success">
                    ✅ Урок уже пройден!
                </p>
                <button onClick={onComplete} className="mt-3 btn-primary">
                    Вернуться к списку
                </button>
            </div>
        );
    }

    const activeExercise = isReviewMode
        ? currentReviewExercise
        : currentExercise;
    if (!activeExercise) {
        return (
            <div className="py-10 text-center text-text-secondary">
                {isReviewMode
                    ? 'Все ошибки исправлены!'
                    : 'Загрузка упражнения...'}
            </div>
        );
    }

    const isCompleted = isReviewMode
        ? reviewCompleted[activeExercise.id] === true
        : completedExercises[activeExercise.id] === true;

    const total = isReviewMode ? reviewExercises.length : exercises.length;
    const completedCount = isReviewMode
        ? Object.values(reviewCompleted).filter(Boolean).length
        : Object.values(completedExercises).filter(Boolean).length;

    return (
        <div className="max-w-2xl p-6 mx-auto space-y-6">
            {/* Заголовок и Character */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">
                        {isReviewMode ? '🔁 Повторение ошибок' : lesson.title}
                    </h2>
                    <span className="text-sm text-text-secondary">
                        {exerciseIndex + 1} / {total}
                    </span>
                </div>
                <Character state={characterState} size="md" />
            </div>

            {isReviewMode && (
                <p className="text-sm text-gold">
                    Осталось ошибок: {wrongExerciseIds.length}
                </p>
            )}

            <ProgressBar
                current={exerciseIndex + 1}
                total={total}
                correctCount={completedCount}
            />

            <AnimatedWrapper key={exerciseIndex} animation="scaleIn">
                {isCompleted ? (
                    <div className="text-center card">
                        <p className="font-semibold text-success">
                            ✅ Уже отвечено правильно!
                        </p>
                        <button
                            onClick={() => {
                                const list = isReviewMode
                                    ? reviewExercises
                                    : exercises;
                                if (exerciseIndex < list.length - 1) {
                                    setExerciseIndex(prev => prev + 1);
                                }
                            }}
                            className="mt-3 btn-primary"
                        >
                            {exerciseIndex < total - 1
                                ? 'Следующее упражнение →'
                                : 'Завершить урок'}
                        </button>
                    </div>
                ) : (
                    <div className="card">
                        <ExerciseRenderer
                            exercise={activeExercise}
                            onAnswer={handleAnswer}
                        />
                        {feedback && (
                            <div
                                className={`mt-4 text-center font-semibold ${
                                    feedback.type === 'correct'
                                        ? 'text-success'
                                        : 'text-error'
                                }`}
                            >
                                {feedback.message}
                                {feedback.explanation && (
                                    <div className="p-3 mt-2 text-sm border text-text-primary bg-dark-bg/50 border-gold/10 rounded-xl">
                                        💡 {feedback.explanation}
                                    </div>
                                )}
                                {feedback.type === 'incorrect' && (
                                    <button
                                        onClick={handleContinueAfterError}
                                        className="mt-3 btn-secondary"
                                    >
                                        Продолжить →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </AnimatedWrapper>
        </div>
    );
};

export default LessonView;
