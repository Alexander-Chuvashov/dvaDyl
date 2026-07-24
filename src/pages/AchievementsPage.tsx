// src/pages/AchievementsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AchievementService } from '../services/AchievementService';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const AchievementsPage: React.FC = () => {
    const { userId } = useAppStore();
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            AchievementService.getAllAchievementsWithStatus(userId)
                .then(setAchievements)
                .finally(() => setLoading(false));
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-sm text-gold animate-pulse sm:text-base">
                    Загрузка достижений...
                </div>
            </div>
        );
    }

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    return (
        <div className="max-w-4xl p-4 mx-auto space-y-6 sm:p-6 sm:space-y-8">
            <AnimatedWrapper animation="slideUp">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl text-primary">
                            🏆 Достижения
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-secondary">
                            {unlockedCount} из {totalCount} разблокировано
                        </p>
                    </div>
                    <div className="px-4 py-2 text-center card sm:px-6 sm:py-3">
                        <div className="text-xl font-bold sm:text-2xl text-gold">
                            {unlockedCount}
                        </div>
                        <div className="text-xs sm:text-sm text-secondary">
                            Разблокировано
                        </div>
                    </div>
                </div>
            </AnimatedWrapper>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 sm:gap-4">
                {achievements.map((achievement, index) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className={`card p-3 sm:p-4 text-center transition-all duration-300 ${
                            achievement.unlocked
                                ? 'border-gold/30 bg-gold/5'
                                : 'opacity-50 grayscale'
                        }`}
                    >
                        <div className="mb-1 text-3xl sm:text-4xl sm:mb-2">
                            {achievement.icon}
                        </div>
                        <h3 className="text-xs font-bold sm:text-sm md:text-base text-primary">
                            {achievement.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-secondary mt-1">
                            {achievement.description}
                        </p>
                        {achievement.unlocked ? (
                            <span className="text-success text-[10px] sm:text-xs mt-2 block">
                                ✓ Получено
                            </span>
                        ) : (
                            <span className="text-secondary/50 text-[10px] sm:text-xs mt-2 block flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" /> Заблокировано
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AchievementsPage;
