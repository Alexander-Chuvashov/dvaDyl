// src/pages/AchievementsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AchievementService } from '../services/AchievementService';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';

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
                <div className="text-gold animate-pulse">
                    Загрузка достижений...
                </div>
            </div>
        );
    }

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <AnimatedWrapper animation="slideUp">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">
                            🏆 Достижения
                        </h1>
                        <p className="mt-1 text-secondary">
                            {unlockedCount} из {totalCount} разблокировано
                        </p>
                    </div>
                    <div className="px-6 py-3 text-center card">
                        <div className="text-2xl font-bold text-gold">
                            {unlockedCount}
                        </div>
                        <div className="text-xs text-secondary">
                            Разблокировано
                        </div>
                    </div>
                </div>
            </AnimatedWrapper>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {achievements.map((achievement, index) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className={`card text-center transition-all duration-300 ${
                            achievement.unlocked
                                ? 'border-gold/30 bg-gold/5'
                                : 'opacity-50 grayscale'
                        }`}
                    >
                        <div className="mb-2 text-4xl">{achievement.icon}</div>
                        <h3 className="font-bold text-primary">
                            {achievement.name}
                        </h3>
                        <p className="mt-1 text-xs text-secondary">
                            {achievement.description}
                        </p>
                        {achievement.unlocked ? (
                            <span className="block mt-2 text-xs text-success">
                                ✓ Получено
                            </span>
                        ) : (
                            <span className="flex items-center justify-center block gap-1 mt-2 text-xs text-secondary/50">
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
