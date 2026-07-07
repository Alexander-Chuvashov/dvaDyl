import React, { useState, useEffect } from 'react';
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

    // Все ли упражнения выполнены правильно?
    const allCompleted = exercises.every(
        ex => completedExercises[ex.id] === true,
    );

    // Логи для отладки
    console.log('📊 completedExercises:', completedExercises);
    console.log('📊 allCompleted:', allCompleted);

    // Эффект завершения урока
    useEffect(() => {
        console.log(
            '🔄 useEffect triggered, allCompleted:',
            allCompleted,
            'userId:',
            userId,
            'lesson.id:',
            lesson.id,
            'already completed:',
            completedLessonIds.includes(lesson.id),
        );
        if (!userId) return;
        if (!allCompleted) return;
        if (completedLessonIds.includes(lesson.id)) return;

        const completeLesson = async () => {
            console.log('🚀 Завершаем урок!');
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
                console.log('✅ Урок завершён, вызываем onComplete');
                onComplete?.();
            } catch (error) {
                console.error('❌ Ошибка завершения урока:', error);
                alert('Ошибка сохранения прогресса. Попробуйте ещё раз.');
            }
        };

        completeLesson();
    }, [allCompleted, userId, lesson.id, completedLessonIds, onComplete]);

    const handleAnswer = async (isCorrect: boolean, userAnswer?: string) => {
        const exerciseId = currentExercise.id;
        console.log(
            '📝 Ответ на упражнение',
            exerciseId,
            'правильный?',
            isCorrect,
            'ответ пользователя:',
            userAnswer,
        );

        // Сохраняем ответ в БД
        if (userId && userAnswer !== undefined) {
            try {
                await syncAnswer(userId, exerciseId, userAnswer, isCorrect);
            } catch (err) {
                console.error('Ошибка сохранения ответа:', err);
            }
        }

        // Обновляем локальный прогресс
        answerExercise(exerciseId, isCorrect, lesson);

        if (isCorrect) {
            setCompletedExercises(prev => ({ ...prev, [exerciseId]: true }));
            if (!isLast) {
                setTimeout(() => setExerciseIndex(prev => prev + 1), 300);
            }
            // если последнее — ничего не делаем, ждём useEffect
        } else {
            // Неправильно — остаёмся
        }
    };

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
                                        // Если последнее — завершение произойдёт через useEffect
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
                        <ExerciseRenderer
                            exercise={currentExercise}
                            onAnswer={handleAnswer}
                        />
                    )}
                </AnimatedWrapper>
            </div>
        </div>
    );
};

export default LessonView;
