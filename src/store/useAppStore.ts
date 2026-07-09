// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lesson, Achievement, UserAchievement } from '../types/content';
import {
    DatabaseService,
    type UserProgress,
    type UserWord,
    type Streak,
} from '../services/DatabaseService';
import { updateSRS } from '../utils/srs';
import { AchievementService } from '../services/AchievementService';
import { supabase } from '../lib/supabaseClient';

// Локальный тип для SRS (без БД)
interface LocalUserWordProgress {
    wordId: string;
    ease: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
}

interface AppState {
    // === Локальные данные сессии (без БД) ===
    lessons: Lesson[];
    currentLesson: Lesson | null;
    currentExerciseIndex: number;
    currentAnswers: Record<string, boolean>;
    completedLessonIds: string[];
    completedExerciseIds: string[];
    xp: number;
    streak: number;
    lastActivityDate: string | null;
    userWords: LocalUserWordProgress[];
    dailyGoal: number;
    username: string;
    errorExercises: string[];
    theme: 'dark' | 'light';

    // === Данные из БД ===
    userId: string | null;
    isAuthenticated: boolean;
    dbProgress: Record<string, UserProgress>;
    dbUserWords: Record<string, UserWord>;
    dbStreak: Streak | null;
    dbXp: number;

    // === Достижения ===
    userAchievements: UserAchievement[];

    // === Действия ===
    setLessons: (lessons: Lesson[]) => void;
    selectLesson: (lesson: Lesson) => void;
    answerExercise: (
        exerciseId: string,
        isCorrect: boolean,
        lesson: Lesson,
    ) => void;
    nextExercise: () => void;
    resetProgress: () => void;
    resetCurrentLesson: () => void;
    updateLocalWordProgress: (wordId: string, isCorrect: boolean) => void;
    setDailyGoal: (goal: number) => void;
    setUsername: (username: string) => void;
    addErrorExercise: (exerciseId: string) => void;
    clearErrorExercises: () => void;
    toggleTheme: () => void;

    // === Действия для БД ===
    setUserId: (id: string | null) => void;
    loadUserData: (userId: string) => Promise<void>;
    syncProgress: (
        userId: string,
        lessonId: string,
        status: string,
        score: number,
        xp: number,
    ) => Promise<void>;
    syncAnswer: (
        userId: string,
        exerciseId: string,
        answer: string,
        isCorrect: boolean,
    ) => Promise<void>;
    syncWordProgress: (
        userId: string,
        wordId: string,
        isCorrect: boolean,
    ) => Promise<void>;
    syncStreak: (userId: string) => Promise<void>;
    loadUserSettings: (userId: string) => Promise<void>;
    saveUserSettings: (userId: string) => Promise<void>;
    resetAll: () => void;

    // === Достижения ===
    unlockAchievement: (achievementId: string) => void;
    checkAndUnlockAchievements: (
        userId: string,
        stats: { lessonsCompleted: number; streak: number; xp: number },
    ) => Promise<Achievement[]>;
}

const initialState = {
    lessons: [],
    currentLesson: null,
    currentExerciseIndex: 0,
    currentAnswers: {},
    completedLessonIds: [],
    completedExerciseIds: [],
    xp: 0,
    streak: 0,
    lastActivityDate: null,
    userWords: [],
    dailyGoal: 20,
    username: '',
    errorExercises: [],
    theme: 'dark' as 'dark',
    userId: null,
    isAuthenticated: false,
    dbProgress: {},
    dbUserWords: {},
    dbStreak: null,
    dbXp: 0,
    userAchievements: [],
};

const updateStreak = (
    lastDate: string | null,
): { streak: number; today: string } => {
    const today = new Date().toISOString().split('T')[0];
    if (!lastDate) return { streak: 1, today };
    const last = new Date(lastDate);
    const now = new Date();
    const diffDays = Math.floor(
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return { streak: 0, today };
    if (diffDays === 1) return { streak: 1, today };
    return { streak: -999, today };
};

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // === Локальные действия ===
            setLessons: lessons => set({ lessons }),
            selectLesson: lesson =>
                set({
                    currentLesson: lesson,
                    currentExerciseIndex: 0,
                    currentAnswers: {},
                }),

            answerExercise: (exerciseId, isCorrect, lesson) => {
                set(state => ({
                    currentAnswers: {
                        ...state.currentAnswers,
                        [exerciseId]: isCorrect,
                    },
                }));
                if (isCorrect) {
                    const state = get();
                    if (!state.completedExerciseIds.includes(exerciseId)) {
                        const { streak: streakDelta, today } = updateStreak(
                            state.lastActivityDate,
                        );
                        let newStreak = state.streak;
                        if (streakDelta === 1) newStreak += 1;
                        else if (streakDelta === -999) newStreak = 1;
                        const xpGain = 10;
                        const newXp = state.xp + xpGain;
                        const newCompletedExercises = [
                            ...state.completedExerciseIds,
                            exerciseId,
                        ];
                        const allExercises = lesson.exercises;
                        const allCompleted = allExercises.every(ex =>
                            newCompletedExercises.includes(ex.id),
                        );
                        let newCompletedLessons = [...state.completedLessonIds];
                        let bonusXp = 0;
                        if (
                            allCompleted &&
                            !newCompletedLessons.includes(lesson.id)
                        ) {
                            newCompletedLessons = [
                                ...newCompletedLessons,
                                lesson.id,
                            ];
                            bonusXp = 50;
                        }
                        set({
                            completedExerciseIds: newCompletedExercises,
                            completedLessonIds: newCompletedLessons,
                            xp: newXp + bonusXp,
                            streak: newStreak,
                            lastActivityDate: today,
                        });
                    }
                }
            },

            nextExercise: () =>
                set(state => ({
                    currentExerciseIndex: state.currentExerciseIndex + 1,
                })),

            resetProgress: () => {
                set({
                    completedLessonIds: [],
                    completedExerciseIds: [],
                    xp: 0,
                    streak: 0,
                    lastActivityDate: null,
                    userWords: [],
                    userAchievements: [],
                    errorExercises: [],
                });
            },

            resetCurrentLesson: () =>
                set({
                    currentLesson: null,
                    currentExerciseIndex: 0,
                    currentAnswers: {},
                }),

            updateLocalWordProgress: (wordId, isCorrect) => {
                set(state => {
                    const existing = state.userWords.find(
                        w => w.wordId === wordId,
                    );
                    const updated = existing
                        ? updateSRS(existing, isCorrect)
                        : {
                              wordId,
                              ease: 2.5,
                              interval: 1,
                              repetitions: 0,
                              nextReviewDate: new Date()
                                  .toISOString()
                                  .split('T')[0],
                          };
                    const filtered = state.userWords.filter(
                        w => w.wordId !== wordId,
                    );
                    return { userWords: [...filtered, updated] };
                });
            },

            setDailyGoal: goal => set({ dailyGoal: goal }),
            setUsername: username => set({ username }),
            addErrorExercise: exerciseId => {
                set(state => {
                    if (state.errorExercises.includes(exerciseId)) return state;
                    return {
                        errorExercises: [...state.errorExercises, exerciseId],
                    };
                });
            },
            clearErrorExercises: () => set({ errorExercises: [] }),

            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark';
                set({ theme: newTheme });
                if (newTheme === 'light') {
                    document.documentElement.classList.add('light');
                } else {
                    document.documentElement.classList.remove('light');
                }
                localStorage.setItem('theme', newTheme);
            },

            // === Действия для БД ===
            setUserId: id => set({ userId: id, isAuthenticated: !!id }),

            loadUserData: async userId => {
                try {
                    const [progress, userWords, streak, achievements] =
                        await Promise.all([
                            DatabaseService.loadProgress(userId),
                            DatabaseService.loadUserWords(userId),
                            DatabaseService.loadStreak(userId),
                            DatabaseService.getUserAchievements(userId),
                        ]);
                    const progressMap = progress.reduce(
                        (acc, p) => ({ ...acc, [p.lesson_id]: p }),
                        {} as Record<string, UserProgress>,
                    );
                    const wordsMap = userWords.reduce(
                        (acc, w) => ({ ...acc, [w.word_id]: w }),
                        {} as Record<string, UserWord>,
                    );
                    const totalXp = progress.reduce(
                        (sum, p) => sum + (p.xp_earned || 0),
                        0,
                    );
                    set({
                        dbProgress: progressMap,
                        dbUserWords: wordsMap,
                        dbStreak: streak,
                        dbXp: totalXp,
                        userAchievements: achievements,
                        xp: totalXp,
                        streak: streak?.current_streak || 0,
                    });
                } catch (error) {
                    console.error(
                        'Ошибка загрузки данных пользователя:',
                        error,
                    );
                }
            },

            syncProgress: async (userId, lessonId, status, score, xp) => {
                try {
                    const progress = {
                        user_id: userId,
                        lesson_id: lessonId,
                        status: status as any,
                        score,
                        xp_earned: xp,
                        last_attempt: new Date().toISOString(),
                    };
                    const saved = await DatabaseService.saveProgress(progress);
                    set(state => ({
                        dbProgress: { ...state.dbProgress, [lessonId]: saved },
                        dbXp: state.dbXp + xp,
                        xp: state.xp + xp,
                    }));
                } catch (error) {
                    console.error('Ошибка сохранения прогресса:', error);
                }
            },

            syncAnswer: async (userId, exerciseId, answer, isCorrect) => {
                try {
                    await DatabaseService.saveAnswer(
                        userId,
                        exerciseId,
                        answer,
                        isCorrect,
                    );
                } catch (error) {
                    console.error('Ошибка сохранения ответа:', error);
                }
            },

            syncWordProgress: async (userId, wordId, isCorrect) => {
                try {
                    const current = get().dbUserWords[wordId];
                    let ease = current?.ease_factor || 2.5;
                    let interval = current?.interval || 1;
                    let repetitions = current?.repetitions || 0;
                    if (isCorrect) {
                        if (repetitions === 0) interval = 1;
                        else if (repetitions === 1) interval = 3;
                        else interval = Math.round(interval * ease);
                        repetitions += 1;
                        ease = Math.min(2.5, ease + 0.1);
                    } else {
                        repetitions = 0;
                        interval = 1;
                        ease = Math.max(1.3, ease - 0.2);
                    }
                    const nextReview = new Date();
                    nextReview.setDate(nextReview.getDate() + interval);
                    const wordData = {
                        user_id: userId,
                        word_id: wordId,
                        ease_factor: ease,
                        interval,
                        repetitions,
                        next_review: nextReview.toISOString().split('T')[0],
                        last_review: new Date().toISOString().split('T')[0],
                    };
                    const saved = await DatabaseService.saveWord(wordData);
                    set(state => ({
                        dbUserWords: { ...state.dbUserWords, [wordId]: saved },
                    }));
                } catch (error) {
                    console.error('Ошибка сохранения SRS:', error);
                }
            },

            syncStreak: async userId => {
                try {
                    const today = new Date().toISOString().split('T')[0];
                    const current = get().dbStreak;
                    let newCurrent = current?.current_streak || 0;
                    let newLongest = current?.longest_streak || 0;
                    if (current?.last_active === today) return;
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    if (current?.last_active === yesterdayStr) {
                        newCurrent += 1;
                    } else if (current?.last_active !== today) {
                        newCurrent = 1;
                    }
                    newLongest = Math.max(newLongest, newCurrent);
                    const updated = await DatabaseService.updateStreak(
                        userId,
                        newCurrent,
                        newLongest,
                        today,
                    );
                    set({
                        dbStreak: updated,
                        streak: newCurrent,
                    });
                } catch (error) {
                    console.error('Ошибка обновления стрика:', error);
                }
            },

            loadUserSettings: async userId => {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username')
                        .eq('id', userId)
                        .single();
                    if (error) throw error;
                    if (data) set({ username: data.username || '' });
                } catch (error) {
                    console.error('Ошибка загрузки настроек:', error);
                }
            },

            saveUserSettings: async userId => {
                const state = get();
                try {
                    const { error } = await supabase
                        .from('users')
                        .update({ username: state.username })
                        .eq('id', userId);
                    if (error) throw error;
                } catch (error) {
                    console.error('Ошибка сохранения настроек:', error);
                    throw error;
                }
            },

            resetAll: () => {
                set({
                    userId: null,
                    isAuthenticated: false,
                    dbProgress: {},
                    dbUserWords: {},
                    dbStreak: null,
                    dbXp: 0,
                    userAchievements: [],
                    xp: 0,
                    streak: 0,
                    completedLessonIds: [],
                    completedExerciseIds: [],
                    userWords: [],
                    username: '',
                    dailyGoal: 20,
                    errorExercises: [],
                    theme: 'dark' as 'dark',
                });
            },

            // === Достижения ===
            unlockAchievement: achievementId => {
                set(state => {
                    if (
                        state.userAchievements.some(
                            a => a.achievementId === achievementId,
                        )
                    ) {
                        return state;
                    }
                    return {
                        userAchievements: [
                            ...state.userAchievements,
                            {
                                achievementId,
                                unlockedAt: new Date().toISOString(),
                            },
                        ],
                    };
                });
            },

            checkAndUnlockAchievements: async (userId, stats) => {
                try {
                    const newAchievements =
                        await AchievementService.checkAchievements(
                            userId,
                            stats,
                        );
                    if (newAchievements.length > 0) {
                        set(state => ({
                            userAchievements: [
                                ...state.userAchievements,
                                ...newAchievements.map(a => ({
                                    achievementId: a.id,
                                    unlockedAt: new Date().toISOString(),
                                })),
                            ],
                        }));
                    }
                    return newAchievements;
                } catch (error) {
                    console.error('Ошибка проверки достижений:', error);
                    return [];
                }
            },
        }),
        {
            name: 'tuvan-app-storage',
            partialize: state => ({
                completedLessonIds: state.completedLessonIds,
                completedExerciseIds: state.completedExerciseIds,
                xp: state.xp,
                streak: state.streak,
                lastActivityDate: state.lastActivityDate,
                userWords: state.userWords,
                userId: state.userId,
                isAuthenticated: state.isAuthenticated,
                dailyGoal: state.dailyGoal,
                username: state.username,
                userAchievements: state.userAchievements,
                errorExercises: state.errorExercises,
                theme: state.theme,
            }),
        },
    ),
);
