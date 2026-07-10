import { supabase } from '../lib/supabaseClient';
import type { UserAchievement } from '../types/content';

export interface UserProgress {
    id?: string;
    user_id: string;
    lesson_id: string;
    status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    score: number;
    xp_earned: number;
    started_at?: string;
    completed_at?: string;
    last_attempt?: string;
}

export interface UserWord {
    id?: string;
    user_id: string;
    word_id: string;
    ease_factor: number;
    interval: number;
    repetitions: number;
    next_review: string;
    last_review?: string;
}

export interface Streak {
    current_streak: number;
    longest_streak: number;
    last_active: string;
}

export const DatabaseService = {
    // ====== Пользователь ======
    async getCurrentUser() {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    // ====== Прогресс ======
    async loadProgress(userId: string): Promise<UserProgress[]> {
        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data || [];
    },

    async saveProgress(progress: UserProgress) {
        const { data, error } = await supabase
            .from('user_progress')
            .upsert(
                {
                    user_id: progress.user_id,
                    lesson_id: progress.lesson_id,
                    status: progress.status,
                    score: progress.score,
                    xp_earned: progress.xp_earned,
                    started_at: progress.started_at,
                    completed_at: progress.completed_at,
                    last_attempt: progress.last_attempt,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id, lesson_id' },
            )
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // ====== Ответы ======
    async saveAnswer(
        userId: string,
        exerciseId: string,
        answer: string,
        isCorrect: boolean,
    ) {
        const { data, error } = await supabase.from('user_answers').upsert(
            {
                user_id: userId, // обязательно snake_case
                exercise_id: exerciseId,
                answer,
                is_correct: isCorrect,
                created_at: new Date().toISOString(),
            },
            { onConflict: 'user_id, exercise_id' },
        );
        if (error) throw error;
        return data;
    },

    // ====== SRS ======
    async loadUserWords(userId: string): Promise<UserWord[]> {
        const { data, error } = await supabase
            .from('user_words')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data || [];
    },

    async saveWord(word: UserWord) {
        const { data, error } = await supabase
            .from('user_words')
            .upsert(
                {
                    user_id: word.user_id,
                    word_id: word.word_id,
                    ease_factor: word.ease_factor,
                    interval: word.interval,
                    repetitions: word.repetitions,
                    next_review: word.next_review,
                    last_review: word.last_review,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id, word_id' },
            )
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // ====== Стрики ======
    async loadStreak(userId: string): Promise<Streak | null> {
        const { data, error } = await supabase
            .from('user_streaks')
            .select('current_streak, longest_streak, last_active')
            .eq('user_id', userId)
            .maybeSingle(); // вместо .single()
        if (error) throw error;
        return data;
    },

    async updateStreak(
        userId: string,
        current: number,
        longest: number,
        lastActive: string,
    ) {
        const { data, error } = await supabase
            .from('user_streaks')
            .upsert(
                {
                    user_id: userId,
                    current_streak: current,
                    longest_streak: longest,
                    last_active: lastActive,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' },
            )
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // ====== XP Log ======
    async addXpLog(
        userId: string,
        amount: number,
        source: string,
        description?: string,
    ) {
        const { data, error } = await supabase.from('user_xp_log').insert({
            user_id: userId,
            amount,
            source,
            description,
        });
        if (error) throw error;
        return data;
    },

    async getTodayXp(userId: string): Promise<number> {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('user_xp_log')
            .select('amount')
            .eq('user_id', userId)
            .gte('created_at', today)
            .lt(
                'created_at',
                new Date(
                    new Date().setDate(new Date().getDate() + 1),
                ).toISOString(),
            );
        if (error) throw error;
        return data.reduce((sum, log) => sum + log.amount, 0);
    },

    // ====== Достижения ======

    // Получить все достижения пользователя
    async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        const { data, error } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .eq('user_id', userId);
        if (error) throw error;
        return data.map((item: any) => ({
            achievementId: item.achievement_id,
            unlockedAt: item.unlocked_at,
        }));
    },

    async unlockAchievement(userId: string, achievementId: string) {
        const { data, error } = await supabase
            .from('user_achievements')
            .insert({
                user_id: userId,
                achievement_id: achievementId,
                unlocked_at: new Date().toISOString(),
            });
        if (error) throw error;
        return data;
    },
};
