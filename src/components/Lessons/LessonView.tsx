// src/components/Lessons/LessonView.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import ExerciseRenderer from '../Exercises/ExerciseRenderer';
import AnimatedWrapper from '../UI/AnimatedWrapper';
import Character from '../UI/Character';
import type { Lesson } from '../../types/content';
import Tooltip from '../UI/Tooltip';
import { useToastStore } from '../../store/useToastStore';
import { TranslationService } from '../../services/TranslationService';

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
    const isCompletingRef = useRef(false);
    const { addToast } = useToastStore();

    const {
        userId,
        answerExercise,
        syncAnswer,
        syncStreak,
        syncProgress,
        syncWordProgress,
        addXpLog,
        completedLessonIds,
        checkAndUnlockAchievements,
        streak,
        markLessonCompleted,
    } = useAppStore();

    const exercises = lesson.exercises;
    const currentExercise = exercises[exerciseIndex];

    const reviewExercises = exercises.filter(ex =>
        wrongExerciseIds.includes(ex.id),
    );
    const currentReviewExercise = reviewExercises[exerciseIndex] || null;

    const allAttempted = exercises.every(
        ex => attemptedExercises[ex.id] === true,
    );
    const allCompleted = exercises.every(
        ex => completedExercises[ex.id] === true,
    );
    const allReviewCompleted = reviewExercises.every(
        ex => reviewCompleted[ex.id] === true,
    );

    // ---------- Функция для сохранения слова ----------
    const saveWordIfExists = useCallback(
        async (word: string) => {
            if (!userId || !word) return;
            const wordId = TranslationService.getWordId(word);
            if (wordId) {
                await syncWordProgress(userId, wordId, true);
            }
        },
        [userId, syncWordProgress],
    );

    const completeLesson = useCallback(async () => {
        console.log('🚀 completeLesson вызван для урока:', lesson.id);
        if (isLessonCompletedRef.current) return;
        isLessonCompletedRef.current = true;
        setCharacterState('celebrate');

        try {
            if (!userId) {
                console.warn('❌ userId отсутствует, завершение невозможно');
                return;
            }

            // Вычисляем общий XP за урок (10 XP за каждое правильное упражнение + 50 бонус)
            const correctCount =
                Object.values(completedExercises).filter(Boolean).length;
            const exercisesXp = correctCount * 10;
            const bonusXp = 50;
            const totalXpForLesson = exercisesXp + bonusXp;

            // Единственный вызов syncProgress
            await syncProgress(
                userId,
                lesson.id,
                'completed',
                100,
                totalXpForLesson,
            );
            markLessonCompleted(lesson.id);
            await syncStreak(userId);
            await addXpLog(
                userId,
                50,
                'lesson_complete',
                `Завершён урок: ${lesson.title}`,
            );

            const stats = {
                lessonsCompleted: completedLessonIds.length + 1,
                streak: streak + 1,
                xp: totalXpForLesson,
            };
            const newAchievements = await checkAndUnlockAchievements(
                userId,
                stats,
            );
            if (newAchievements.length > 0) {
                newAchievements.forEach(ach => {
                    addToast({
                        type: 'success',
                        title: '🎉 Новое достижение!',
                        message: `${ach.icon} ${ach.name}`,
                        duration: 10000,
                    });
                });
            }

            setTimeout(() => {
                setCharacterState('idle');
                onComplete?.();
            }, 1200);
        } catch (error) {
            console.error('❌ Ошибка завершения урока:', error);
            addToast({
                type: 'error',
                title: 'Ошибка',
                message: 'Не удалось сохранить прогресс. Попробуйте ещё раз.',
            });
            isLessonCompletedRef.current = false;
            setCharacterState('idle');
        }
    }, [
        userId,
        lesson.id,
        syncProgress,
        syncStreak,
        addXpLog,
        completedLessonIds,
        streak,
        checkAndUnlockAchievements,
        onComplete,
        completedExercises,
        markLessonCompleted,
        addToast,
    ]);

    const tryComplete = useCallback(() => {
        if (isCompletingRef.current) return;
        if (isLessonCompletedRef.current) return;
        if (!userId) return;
        if (completedLessonIds.includes(lesson.id)) return;

        if (isReviewMode) {
            if (allReviewCompleted) {
                if (reviewExercises.length === 0) {
                    const newCompleted = { ...completedExercises };
                    Object.keys(reviewCompleted).forEach(id => {
                        if (reviewCompleted[id]) {
                            newCompleted[id] = true;
                        }
                    });
                    setCompletedExercises(newCompleted);
                    setIsReviewMode(false);
                    setExerciseIndex(0);
                    setReviewCompleted({});
                    setTimeout(() => tryComplete(), 100);
                    return;
                } else {
                    completeLesson();
                }
            }
        } else {
            if (allAttempted && allCompleted && wrongExerciseIds.length === 0) {
                isCompletingRef.current = true;
                completeLesson();
            }
        }
    }, [
        isReviewMode,
        allReviewCompleted,
        reviewExercises,
        reviewCompleted,
        completedExercises,
        allAttempted,
        allCompleted,
        wrongExerciseIds,
        userId,
        lesson.id,
        completedLessonIds,
        completeLesson,
    ]);

    // Автоматическое завершение (эффект)
    useEffect(() => {
        if (isReviewMode) return;
        if (!allAttempted) return;
        if (!allCompleted) return;
        if (wrongExerciseIds.length > 0) return;
        if (completedLessonIds.includes(lesson.id)) return;
        if (isLessonCompletedRef.current) return;
        if (isCompletingRef.current) return;
        console.log(
            '✅ Все упражнения выполнены правильно (эффект), завершаем урок',
        );
        tryComplete();
    }, [
        allAttempted,
        allCompleted,
        wrongExerciseIds,
        isReviewMode,
        completedLessonIds,
        lesson.id,
        tryComplete,
    ]);

    // Переход в режим повторения
    useEffect(() => {
        if (isReviewMode) return;
        if (!allAttempted) return;
        if (isLessonCompletedRef.current) return;
        if (completedLessonIds.includes(lesson.id)) return;

        if (wrongExerciseIds.length > 0) {
            console.log('🔄 Переход в режим повторения ошибок');
            setIsReviewMode(true);
            setExerciseIndex(0);
            setReviewCompleted({});
            setFeedback(null);
            setCharacterState('thinking');
        }
    }, [
        allAttempted,
        isReviewMode,
        wrongExerciseIds,
        completedLessonIds,
        lesson.id,
    ]);

    // Завершение при пустом списке ошибок (повторение)
    useEffect(() => {
        if (!isReviewMode) return;
        if (wrongExerciseIds.length === 0) {
            console.log(
                '✅ Все ошибки исправлены (wrongExerciseIds пуст), завершаем урок',
            );
            completeLesson();
        }
    }, [isReviewMode, wrongExerciseIds, completeLesson]);

    const handleAnswer = useCallback(
        async (isCorrect: boolean, userAnswer?: string) => {
            if (isProcessingRef.current) return;
            const exerciseId = isReviewMode
                ? currentReviewExercise?.id
                : currentExercise?.id;
            if (!exerciseId) return;

            if (isReviewMode && isCorrect) {
                // В режиме повторения при правильном ответе
                console.log(
                    '🟢 Режим повторения: правильный ответ, exerciseId:',
                    exerciseId,
                );
                console.log('🟢 wrongExerciseIds до:', wrongExerciseIds);
                setReviewCompleted(prev => ({ ...prev, [exerciseId]: true }));
                setWrongExerciseIds(prev => {
                    const filtered = prev.filter(id => id !== exerciseId);
                    console.log('🟢 wrongExerciseIds после:', filtered);
                    return filtered;
                });

                // Сохраняем слово, если есть
                const correctWord = currentExercise.correct;
                if (correctWord && typeof correctWord === 'string') {
                    const wordId = TranslationService.getWordId(correctWord);
                    if (wordId && userId) {
                        await syncWordProgress(userId, wordId, true);
                    }
                }
                // Выходим, чтобы не дублировать логику
                isProcessingRef.current = false;
                // Переход к следующему будет в setTimeout ниже
                setTimeout(() => {
                    const list = reviewExercises;
                    if (exerciseIndex < list.length - 1) {
                        setExerciseIndex(prev => prev + 1);
                    }
                    setTimeout(() => tryComplete(), 100);
                }, 1700);
                return;
            }

            if (isReviewMode && reviewCompleted[exerciseId] === true) return;
            if (!isReviewMode && attemptedExercises[exerciseId] === true)
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
                    // Сохраняем слово в основном режиме
                    const correctWord = currentExercise.correct;
                    if (correctWord && typeof correctWord === 'string') {
                        await saveWordIfExists(correctWord);
                    }
                }
                setFeedback({ type: 'correct', message: '✅ Правильно!' });
                setCharacterState('celebrate');

                setTimeout(() => {
                    setFeedback(null);
                    setCharacterState('idle');
                    const list = isReviewMode ? reviewExercises : exercises;
                    if (exerciseIndex < list.length - 1) {
                        setExerciseIndex(prev => prev + 1);
                    }
                    isProcessingRef.current = false;
                    setTimeout(() => tryComplete(), 100);
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
            attemptedExercises,
            reviewCompleted,
            wrongExerciseIds,
            tryComplete,
            saveWordIfExists,
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

    // Пропустить упражнение в режиме повторения
    const handleSkipInReview = () => {
        const exerciseId = currentExercise.id;
        setWrongExerciseIds(prev => prev.filter(id => id !== exerciseId));
        setReviewCompleted(prev => ({ ...prev, [exerciseId]: true }));
        const list = reviewExercises;
        if (exerciseIndex < list.length - 1) {
            setExerciseIndex(prev => prev + 1);
        } else {
            // Если это было последнее, завершаем режим повторения
            setIsReviewMode(false);
            // После выхода из режима повторения проверяем завершение
            setTimeout(() => tryComplete(), 100);
        }
    };

    if (completedLessonIds.includes(lesson.id)) {
        return (
            <div className="p-4 text-center card sm:p-6">
                <p className="text-sm font-semibold text-success sm:text-base">
                    ✅ Урок уже пройден!
                </p>
                <Tooltip text="Вернуться к списку уроков">
                    <button
                        onClick={onComplete}
                        className="mt-3 text-sm btn-primary sm:text-base"
                    >
                        Вернуться к списку
                    </button>
                </Tooltip>
            </div>
        );
    }

    const activeExercise = isReviewMode
        ? currentReviewExercise
        : currentExercise;
    if (!activeExercise) {
        return (
            <div className="py-10 text-sm text-center text-secondary sm:text-base">
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
        <div className="max-w-2xl p-4 mx-auto space-y-4 sm:p-6 sm:space-y-6">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-bold truncate sm:text-2xl text-primary">
                        {isReviewMode ? '🔁 Повторение ошибок' : lesson.title}
                    </h2>
                    <span className="text-xs sm:text-sm text-secondary">
                        {exerciseIndex + 1} / {total}
                    </span>
                </div>
                <Character state={characterState} size="md" />
            </div>

            {isReviewMode && (
                <button
                    onClick={handleSkipInReview}
                    className="text-xs transition-colors text-secondary/50 hover:text-secondary"
                >
                    Пропустить
                </button>
            )}

            <div className="w-full">
                <div className="flex justify-between mb-1 text-xs sm:text-sm text-secondary">
                    <span>Прогресс</span>
                    <span>
                        {completedCount} / {total} верно
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${Math.min(100, (exerciseIndex / total) * 100)}%`,
                        }}
                    />
                </div>
            </div>

            {isReviewMode && allReviewCompleted && (
                <div className="p-3 text-center border sm:p-4 bg-success/10 border-success/30 rounded-xl">
                    <p className="text-base font-bold sm:text-lg text-success">
                        🎉 Все ошибки исправлены!
                    </p>
                    <Tooltip text="Завершить урок">
                        <button
                            onClick={() => {
                                if (window.confirm('Завершить урок?')) {
                                    completeLesson();
                                }
                            }}
                            className="mt-2 text-sm sm:mt-3 btn-primary sm:text-base"
                        >
                            Завершить урок
                        </button>
                    </Tooltip>
                </div>
            )}

            <div className="text-center">
                <button
                    onClick={() => {
                        if (
                            window.confirm(
                                'Вы уверены, что хотите завершить урок? Неисправленные ошибки не будут засчитаны.',
                            )
                        ) {
                            completeLesson();
                        }
                    }}
                    className="text-xs transition-colors text-secondary/50 hover:text-secondary"
                >
                    [Завершить урок вручную]
                </button>
            </div>

            <AnimatedWrapper key={exerciseIndex} animation="scaleIn">
                {isCompleted ? (
                    <div className="p-4 text-center card sm:p-6">
                        <p className="text-sm font-semibold text-success sm:text-base">
                            ✅ Уже отвечено правильно!
                        </p>
                        <Tooltip text="Перейти к следующему упражнению">
                            <button
                                onClick={() => {
                                    const list = isReviewMode
                                        ? reviewExercises
                                        : exercises;
                                    if (exerciseIndex < list.length - 1) {
                                        setExerciseIndex(prev => prev + 1);
                                    }
                                }}
                                className="mt-3 text-sm btn-primary sm:text-base"
                            >
                                {exerciseIndex < total - 1
                                    ? 'Следующее упражнение →'
                                    : 'Завершить урок'}
                            </button>
                        </Tooltip>
                    </div>
                ) : (
                    <div className="p-4 card sm:p-6">
                        <ExerciseRenderer
                            exercise={activeExercise}
                            onAnswer={handleAnswer}
                        />
                        {feedback && (
                            <div
                                className={`mt-4 text-center font-semibold text-sm sm:text-base ${
                                    feedback.type === 'correct'
                                        ? 'text-success'
                                        : 'text-error'
                                }`}
                            >
                                {feedback.message}
                                {feedback.explanation && (
                                    <div className="p-2 mt-2 text-xs border sm:p-3 sm:text-sm text-primary bg-primary/30 border-gold/10 rounded-xl">
                                        💡 {feedback.explanation}
                                    </div>
                                )}
                                {feedback.type === 'incorrect' && (
                                    <Tooltip text="Продолжить →">
                                        <button
                                            onClick={handleContinueAfterError}
                                            className="mt-3 text-sm btn-secondary sm:text-base"
                                        >
                                            Продолжить →
                                        </button>
                                    </Tooltip>
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
