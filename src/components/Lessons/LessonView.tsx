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
    const [feedback, setFeedback] = useState<{
        type: 'correct' | 'incorrect';
        message?: string;
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

    const allCompleted = exercises.every(
        ex => completedExercises[ex.id] === true,
    );

    // Эффект завершения урока
    useEffect(() => {
        if (!userId) return;
        if (!allCompleted) return;
        if (completedLessonIds.includes(lesson.id)) return;

        const completeLesson = async () => {
            try {
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

        completeLesson();
    }, [allCompleted, userId, lesson.id, completedLessonIds, onComplete]);

    const handleAnswer = useCallback(
        async (isCorrect: boolean, userAnswer?: string) => {
            if (isProcessingRef.current) {
                console.warn('⚠️ Уже обрабатывается ответ, пропускаем');
                return;
            }
            if (!currentExercise) {
                console.warn('⚠️ Нет текущего упражнения');
                return;
            }

            const exerciseId = currentExercise.id;

            if (completedExercises[exerciseId] === true) {
                console.warn(`⚠️ Упражнение ${exerciseId} уже пройдено`);
                return;
            }

            isProcessingRef.current = true;

            // Показываем фидбек
            if (isCorrect) {
                setFeedback({ type: 'correct', message: '✅ Правильно!' });
            } else {
                setFeedback({
                    type: 'incorrect',
                    message: '❌ Неправильно. Попробуй ещё раз.',
                });
            }

            try {
                // Сохраняем ответ в БД (только если есть ответ пользователя)
                if (userId && userAnswer !== undefined) {
                    await syncAnswer(userId, exerciseId, userAnswer, isCorrect);
                }

                // Обновляем локальный прогресс
                answerExercise(exerciseId, isCorrect, lesson);

                // Если правильно – отмечаем и планируем переход
                if (isCorrect) {
                    setCompletedExercises(prev => ({
                        ...prev,
                        [exerciseId]: true,
                    }));
                    // Задержка перед переходом
                    setTimeout(() => {
                        setFeedback(null);
                        isProcessingRef.current = false;
                        if (!isLast) {
                            setExerciseIndex(prev => prev + 1);
                        }
                        // если последнее – завершение произойдёт через useEffect
                    }, 700);
                } else {
                    // Неправильно – задержка и сброс фидбека, остаёмся на месте
                    setTimeout(() => {
                        setFeedback(null);
                        isProcessingRef.current = false;
                        // Можно дополнительно подсветить правильный ответ, но пока просто сбрасываем
                    }, 700);
                }
            } catch (error) {
                console.error('Ошибка обработки ответа:', error);
                setFeedback(null);
                isProcessingRef.current = false;
            }
        },
        [
            currentExercise,
            completedExercises,
            userId,
            isLast,
            syncAnswer,
            answerExercise,
            lesson,
        ],
    );

    // Защита
    if (!currentExercise) {
        return (
            <div className="py-10 text-center text-dark/60">
                Упражнение не найдено
            </div>
        );
    }

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

    const isCurrentCompleted = completedExercises[currentExercise.id] === true;

    // Определяем класс анимации для карточки упражнения
    let feedbackClass = '';
    if (feedback) {
        feedbackClass =
            feedback.type === 'correct'
                ? 'animate-bounce-success border-olive'
                : 'animate-shake border-terracotta';
    }

    return (
        <div className="max-w-2xl p-6 mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-dark">{lesson.title}</h2>
                <span className="text-sm text-dark/60">
                    {exerciseIndex + 1} / {exercises.length}
                </span>
            </div>
            <ProgressBar
                current={exerciseIndex + 1}
                total={exercises.length}
                correctCount={
                    Object.values(completedExercises).filter(Boolean).length
                }
            />
            <div className="mt-6">
                <AnimatedWrapper key={exerciseIndex} animation="scaleIn">
                    {isCurrentCompleted ? (
                        <div className="text-center card">
                            <p className="font-semibold text-olive">
                                ✅ Уже отвечено правильно!
                            </p>
                            <button
                                onClick={() => {
                                    if (isLast) {
                                        // ничего
                                    } else {
                                        setExerciseIndex(prev => prev + 1);
                                    }
                                }}
                                className="mt-3 btn-primary"
                            >
                                {isLast
                                    ? 'Завершить урок'
                                    : 'Следующее упражнение →'}
                            </button>
                        </div>
                    ) : (
                        <div
                            className={`transition-all duration-300 ${feedbackClass}`}
                        >
                            <ExerciseRenderer
                                exercise={currentExercise}
                                onAnswer={handleAnswer}
                            />
                            {feedback && (
                                <div
                                    className={`mt-3 text-center font-semibold ${feedback.type === 'correct' ? 'text-olive' : 'text-terracotta'}`}
                                >
                                    {feedback.message}
                                </div>
                            )}
                        </div>
                    )}
                </AnimatedWrapper>
            </div>
        </div>
    );
};

export default LessonView;
