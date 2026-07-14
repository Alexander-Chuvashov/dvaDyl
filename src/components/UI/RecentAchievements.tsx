import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ACHIEVEMENTS } from '../../data/achievements';

const RecentAchievements: React.FC = () => {
    const { userAchievements } = useAppStore();
    const recent = userAchievements.slice(-3).reverse();

    if (recent.length === 0) return null;

    return (
        <div className="card">
            <h3 className="mb-3 text-lg font-semibold text-primary">
                🏆 Последние достижения
            </h3>
            <div className="flex flex-wrap gap-4">
                {recent.map(ua => {
                    const ach = ACHIEVEMENTS.find(
                        a => a.id === ua.achievementId,
                    );
                    if (!ach) return null;
                    return (
                        <div
                            key={ua.achievementId}
                            className="flex items-center gap-2 px-3 py-2 border bg-gold/5 rounded-xl border-gold/10"
                        >
                            <span className="text-2xl">{ach.icon}</span>
                            <div>
                                <div className="text-sm font-semibold text-primary">
                                    {ach.name}
                                </div>
                                <div className="text-xs text-secondary">
                                    {new Date(
                                        ua.unlockedAt,
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentAchievements;
