import { ACHIEVEMENTS } from '../data/achievements';
import { DatabaseService } from './DatabaseService';
import type { Achievement, UserAchievement } from '../types/content';

export const AchievementService = {
    // Проверяем, какие достижения можно разблокировать
    checkAchievements: async (
        userId: string,
        stats: {
            lessonsCompleted: number;
            streak: number;
            xp: number;
            chapterCompleted?: string;
        },
    ): Promise<Achievement[]> => {
        const unlocked = await AchievementService.getUserAchievements(userId);
        const unlockedIds = new Set(unlocked.map(a => a.achievementId));

        const newAchievements: Achievement[] = [];

        for (const achievement of ACHIEVEMENTS) {
            // Пропускаем уже разблокированные
            if (unlockedIds.has(achievement.id)) continue;

            let isUnlocked = false;

            switch (achievement.condition.type) {
                case 'lessons_completed':
                    isUnlocked =
                        stats.lessonsCompleted >= achievement.condition.target;
                    break;
                case 'streak':
                    isUnlocked = stats.streak >= achievement.condition.target;
                    break;
                case 'xp':
                    isUnlocked = stats.xp >= achievement.condition.target;
                    break;
                case 'chapter_completed':
                    isUnlocked =
                        stats.chapterCompleted ===
                        achievement.condition.chapterId;
                    break;
                case 'perfect_lesson':
                    // Пока не реализовано
                    break;
            }

            if (isUnlocked) {
                newAchievements.push(achievement);
                // Сохраняем в БД
                await DatabaseService.unlockAchievement(userId, achievement.id);
            }
        }

        return newAchievements;
    },

    // Получаем все разблокированные достижения пользователя
    getUserAchievements: async (userId: string): Promise<UserAchievement[]> => {
        return await DatabaseService.getUserAchievements(userId);
    },

    // Получаем все достижения с информацией о разблокировке
    getAllAchievementsWithStatus: async (userId: string) => {
        const unlocked = await AchievementService.getUserAchievements(userId);
        const unlockedIds = new Set(unlocked.map(a => a.achievementId));

        return ACHIEVEMENTS.map(achievement => ({
            ...achievement,
            unlocked: unlockedIds.has(achievement.id),
            unlockedAt:
                unlocked.find(a => a.achievementId === achievement.id)
                    ?.unlockedAt || null,
        }));
    },
};
