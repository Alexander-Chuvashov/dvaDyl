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

    async getWeeklyXp(userId: string): Promise<{ date: string; xp: number }[]> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
            .from('user_xp_log')
            .select('amount, created_at')
            .eq('user_id', userId)
            .gte('created_at', sevenDaysAgo.toISOString());

        if (error) throw error;

        // Группируем по дням
        const dailyMap: Record<string, number> = {};
        data?.forEach(log => {
            const date = new Date(log.created_at).toISOString().split('T')[0];
            dailyMap[date] = (dailyMap[date] || 0) + log.amount;
        });

        // Заполняем пропущенные дни нулями
        const result: { date: string; xp: number }[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            result.push({ date: dateStr, xp: dailyMap[dateStr] || 0 });
        }
        return result;
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
    // ====== Экспорт/Импорт ======
    async exportUserData(userId: string) {
        const [
            progressRes,
            answersRes,
            wordsRes,
            streakRes,
            achievementsRes,
            xpLogRes,
        ] = await Promise.all([
            supabase.from('user_progress').select('*').eq('user_id', userId),
            supabase.from('user_answers').select('*').eq('user_id', userId),
            supabase.from('user_words').select('*').eq('user_id', userId),
            supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle(),
            supabase
                .from('user_achievements')
                .select('*')
                .eq('user_id', userId),
            supabase.from('user_xp_log').select('*').eq('user_id', userId),
        ]);
        if (progressRes.error) throw progressRes.error;
        if (answersRes.error) throw answersRes.error;
        if (wordsRes.error) throw wordsRes.error;
        if (streakRes.error) throw streakRes.error;
        if (achievementsRes.error) throw achievementsRes.error;
        if (xpLogRes.error) throw xpLogRes.error;

        return {
            progress: progressRes.data,
            answers: answersRes.data,
            words: wordsRes.data,
            streak: streakRes.data,
            achievements: achievementsRes.data,
            xpLog: xpLogRes.data,
        };
    },

    async importUserData(userId: string, data: any) {
        // Очищаем существующие данные
        await supabase.from('user_xp_log').delete().eq('user_id', userId);
        await supabase.from('user_achievements').delete().eq('user_id', userId);
        await supabase.from('user_words').delete().eq('user_id', userId);
        await supabase.from('user_answers').delete().eq('user_id', userId);
        await supabase.from('user_progress').delete().eq('user_id', userId);
        await supabase.from('user_streaks').delete().eq('user_id', userId);

        // Вставляем новые данные
        if (data.progress?.length) {
            const { error } = await supabase
                .from('user_progress')
                .insert(data.progress);
            if (error) throw error;
        }
        if (data.answers?.length) {
            const { error } = await supabase
                .from('user_answers')
                .insert(data.answers);
            if (error) throw error;
        }
        if (data.words?.length) {
            const { error } = await supabase
                .from('user_words')
                .insert(data.words);
            if (error) throw error;
        }
        if (data.streak) {
            const { error } = await supabase
                .from('user_streaks')
                .insert({ ...data.streak, user_id: userId });
            if (error) throw error;
        }
        if (data.achievements?.length) {
            const { error } = await supabase
                .from('user_achievements')
                .insert(data.achievements);
            if (error) throw error;
        }
        if (data.xpLog?.length) {
            const { error } = await supabase
                .from('user_xp_log')
                .insert(data.xpLog);
            if (error) throw error;
        }
    },
};
