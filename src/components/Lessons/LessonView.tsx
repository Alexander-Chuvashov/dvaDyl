// src/components/Lessons/LessonView.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import ExerciseRenderer from '../Exercises/ExerciseRenderer';
import ProgressBar from '../Progress/ProgressBar';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import type { Lesson } from '../../types/content';

interface LessonViewProps {
    lesson: Lesson;
    onComplete?: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onComplete }) => {
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [completedExercises, setCompletedExercises] = useState<
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
    const isProcessingRef = useRef(false);

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

    // Режим повторения – берём только ошибочные упражнения
    const reviewExercises = exercises.filter(ex =>
        wrongExerciseIds.includes(ex.id),
    );
    const currentReviewExercise = reviewExercises[exerciseIndex] || null;
    const isReviewLast = exerciseIndex === reviewExercises.length - 1;

    // Все ли упражнения пройдены правильно в основном режиме
    const allCompleted = exercises.every(
        ex => completedExercises[ex.id] === true,
    );
    // Все ли ошибки исправлены
    const allReviewCompleted = reviewExercises.every(
        ex => reviewCompleted[ex.id] === true,
    );

    // Эффект: переход в режим повторения или завершение
    useEffect(() => {
        if (!userId) return;
        if (!allCompleted) return;
        if (isReviewMode) return; // уже в режиме повторения
        if (completedLessonIds.includes(lesson.id)) return;

        // Если есть ошибки → включаем режим повторения
        if (wrongExerciseIds.length > 0) {
            setIsReviewMode(true);
            setExerciseIndex(0);
            setReviewCompleted({});
            setFeedback(null);
            return;
        }

        // Ошибок нет → завершаем урок
        completeLesson();
    }, [
        allCompleted,
        userId,
        lesson.id,
        completedLessonIds,
        isReviewMode,
        wrongExerciseIds,
    ]);

    // Эффект: завершение урока из режима повторения
    useEffect(() => {
        if (!userId) return;
        if (!isReviewMode) return;
        if (!allReviewCompleted) return;
        if (completedLessonIds.includes(lesson.id)) return;
        completeLesson();
    }, [
        allReviewCompleted,
        isReviewMode,
        userId,
        lesson.id,
        completedLessonIds,
    ]);

    const completeLesson = async () => {
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
            onComplete?.();
        } catch (error) {
            console.error('Ошибка завершения урока:', error);
            alert('Ошибка сохранения прогресса. Попробуйте ещё раз.');
        }
    };

    // Обработка ответа
    const handleAnswer = useCallback(
        async (isCorrect: boolean, userAnswer?: string) => {
            if (isProcessingRef.current) return;
            const exerciseId = currentExercise.id;

            // Если уже правильно отвечено – не обрабатываем повторно
            if (completedExercises[exerciseId] === true && !isReviewMode)
                return;
            if (isReviewMode && reviewCompleted[exerciseId] === true) return;

            isProcessingRef.current = true;

            // Сохраняем ответ в БД (если есть userId и ответ)
            if (userId && userAnswer !== undefined) {
                try {
                    await syncAnswer(userId, exerciseId, userAnswer, isCorrect);
                } catch (e) {
                    console.error('Ошибка сохранения ответа:', e);
                }
            }

            // Обновляем локальный прогресс (в сторе)
            answerExercise(exerciseId, isCorrect, lesson);

            // --- Обработка правильного ответа ---
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
                }
                setFeedback({ type: 'correct', message: '✅ Правильно!' });

                // Автоматический переход через 700 мс
                setTimeout(() => {
                    setFeedback(null);
                    const list = isReviewMode ? reviewExercises : exercises;
                    if (exerciseIndex < list.length - 1) {
                        setExerciseIndex(prev => prev + 1);
                    }
                    isProcessingRef.current = false;
                }, 700);
            }

            // --- Обработка неправильного ответа ---
            else {
                // Запоминаем ошибку (если ещё не запомнена)
                if (!wrongExerciseIds.includes(exerciseId)) {
                    setWrongExerciseIds(prev => [...prev, exerciseId]);
                }
                const correctAnswer = Array.isArray(currentExercise.correct)
                    ? currentExercise.correct.join(' ')
                    : currentExercise.correct || '';

                setFeedback({
                    type: 'incorrect',
                    message: `❌ Неправильно. Правильный ответ: ${correctAnswer}`,
                    explanation: currentExercise.explanation,
                });
                // Не переходим автоматически – ждём кнопку "Продолжить"
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
        ],
    );

    // Кнопка "Продолжить" после ошибки
    const handleContinueAfterError = () => {
        setFeedback(null);
        const list = isReviewMode ? reviewExercises : exercises;
        if (exerciseIndex < list.length - 1) {
            setExerciseIndex(prev => prev + 1);
        }
        // Если это было последнее упражнение и это не режим повторения – завершение произойдёт через useEffect
    };

    // Если урок уже пройден
    if (completedLessonIds.includes(lesson.id)) {
        return (
            <div className="text-center card">
                <p className="font-semibold text-olive">✅ Урок уже пройден!</p>
                <button onClick={onComplete} className="mt-3 btn-primary">
                    Вернуться к списку
                </button>
            </div>
        );
    }

    // Определяем активное упражнение
    const activeExercise = isReviewMode
        ? currentReviewExercise
        : currentExercise;
    if (!activeExercise) {
        return (
            <div className="py-10 text-center text-dark/60">
                Упражнение не найдено
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
        <div className="max-w-2xl p-6 mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-dark">
                    {isReviewMode ? '🔁 Повторение ошибок' : lesson.title}
                </h2>
                <span className="text-sm text-dark/60">
                    {exerciseIndex + 1} / {total}
                </span>
            </div>
            {isReviewMode && (
                <p className="mb-2 text-sm text-terracotta">
                    Осталось ошибок: {wrongExerciseIds.length}
                </p>
            )}
            <ProgressBar
                current={exerciseIndex + 1}
                total={total}
                correctCount={completedCount}
            />
            <div className="mt-6">
                <AnimatedWrapper key={exerciseIndex} animation="scaleIn">
                    {isCompleted ? (
                        <div className="text-center card">
                            <p className="font-semibold text-olive">
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
                        <>
                            <ExerciseRenderer
                                exercise={activeExercise}
                                onAnswer={handleAnswer}
                            />
                            {feedback && (
                                <div
                                    className={`mt-3 text-center font-semibold ${feedback.type === 'correct' ? 'text-olive' : 'text-terracotta'}`}
                                >
                                    {feedback.message}
                                    {feedback.explanation && (
                                        <div className="p-3 mt-2 text-sm text-blue-800 border border-blue-200 rounded-lg bg-blue-50">
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
                        </>
                    )}
                </AnimatedWrapper>
            </div>
        </div>
    );
};

export default LessonView;
