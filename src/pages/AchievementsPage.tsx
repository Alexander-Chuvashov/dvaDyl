import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AchievementService } from '../services/AchievementService';
import AnimatedWrapper from '../components/UI/AnimatedWrapper';
import type { Achievement } from '../types/content';

const AchievementsPage: React.FC = () => {
    const { userId } = useAppStore();
    const [achievements, setAchievements] = useState<
        Array<Achievement & { unlocked: boolean; unlockedAt: string | null }>
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            AchievementService.getAllAchievementsWithStatus(userId)
                .then(setAchievements)
                .finally(() => setLoading(false));
        }
    }, [userId]);

    if (loading) {
        return <div className="py-10 text-center">Загрузка...</div>;
    }

    return (
        <div className="max-w-4xl p-6 mx-auto">
            <AnimatedWrapper animation="slideUp">
                <h1 className="mb-6 text-3xl font-bold text-dark">
                    🏆 Достижения
                </h1>
            </AnimatedWrapper>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {achievements.map((achievement, index) => (
                    <AnimatedWrapper
                        key={achievement.id}
                        animation="fadeIn"
                        delay={index * 80}
                    >
                        <div
                            className={`card text-center transition-all ${
                                achievement.unlocked
                                    ? 'border-olive/30 bg-olive/5'
                                    : 'opacity-50 grayscale'
                            }`}
                        >
                            <div className="mb-2 text-4xl">
                                {achievement.icon}
                            </div>
                            <h3 className="font-semibold text-dark">
                                {achievement.name}
                            </h3>
                            <p className="text-sm text-dark/60">
                                {achievement.description}
                            </p>
                            {achievement.unlocked && (
                                <span className="block mt-2 text-xs text-olive">
                                    ✓ Получено
                                </span>
                            )}
                        </div>
                    </AnimatedWrapper>
                ))}
            </div>
        </div>
    );
};

export default AchievementsPage;
