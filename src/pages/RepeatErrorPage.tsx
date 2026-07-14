import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { loadAllChapters } from '../services/ContentService';
import type { Lesson } from '../types/content';
import ExerciseRenderer from '../components/Exercises/ExerciseRenderer';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import Skeleton from '../components/UI/Skeleton';
import { useNavigate } from 'react-router-dom';

const RepeatErrorsPage: React.FC = () => {
    const navigate = useNavigate();
    const { errorExercises, clearErrorExercises } = useAppStore();
    const [errorLessons, setErrorLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

    useEffect(() => {
        const loadErrors = async () => {
            if (errorExercises.length === 0) {
                setLoading(false);
                return;
            }
            try {
                const chapters = await loadAllChapters();
                const allLessons: Lesson[] = [];
                chapters.forEach(chapter => {
                    const lessons =
                        (chapter.lessons?.filter(
                            item => item.type === 'lesson',
                        ) as Lesson[]) || [];
                    allLessons.push(...lessons);
                });
                // Фильтруем уроки, которые содержат хотя бы одно ошибочное упражнение
                const filtered = allLessons.filter(lesson =>
                    lesson.exercises.some(ex => errorExercises.includes(ex.id)),
                );
                setErrorLessons(filtered);
            } catch (error) {
                console.error('Ошибка загрузки:', error);
            } finally {
                setLoading(false);
            }
        };
        loadErrors();
    }, [errorExercises]);

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            // Если правильно, удаляем упражнение из ошибок
            // Но пока просто переходим к следующему
        }
        // Переход к следующему упражнению
        const currentLesson = errorLessons[currentLessonIndex];
        const exercises = currentLesson.exercises;
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
        } else if (currentLessonIndex < errorLessons.length - 1) {
            setCurrentLessonIndex(currentLessonIndex + 1);
            setCurrentExerciseIndex(0);
        } else {
            // Все ошибки повторены
            clearErrorExercises();
            alert('🎉 Все ошибки повторены!');
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl p-6 mx-auto">
                <Skeleton variant="text" className="w-3/4 h-10 mb-4" />
                <Skeleton variant="card" className="h-96" />
            </div>
        );
    }

    if (errorExercises.length === 0) {
        return (
            <div className="max-w-2xl p-6 mx-auto text-center">
                <h2 className="mb-4 text-2xl font-bold text-dark">
                    🎉 Ошибок нет!
                </h2>
                <p className="text-dark/70">
                    Ты молодец! Продолжай в том же духе.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 btn-primary"
                >
                    На главную
                </button>
            </div>
        );
    }

    const currentLesson = errorLessons[currentLessonIndex];
    const currentExercise = currentLesson?.exercises[currentExerciseIndex];

    if (!currentExercise) {
        return <div className="py-10 text-center">Упражнение не найдено</div>;
    }

    return (
        <div className="max-w-2xl p-6 mx-auto">
            <AnimatedWrapper animation="slideUp">
                <h2 className="mb-2 text-2xl font-bold text-dark">
                    Повторение ошибок
                </h2>
                <p className="mb-4 text-dark/70">
                    Урок {currentLessonIndex + 1} из {errorLessons.length} •
                    Упражнение {currentExerciseIndex + 1} из{' '}
                    {currentLesson.exercises.length}
                </p>
            </AnimatedWrapper>
            <div className="card">
                <ExerciseRenderer
                    exercise={currentExercise}
                    onAnswer={handleAnswer}
                />
            </div>
        </div>
    );
};

export default RepeatErrorsPage;
