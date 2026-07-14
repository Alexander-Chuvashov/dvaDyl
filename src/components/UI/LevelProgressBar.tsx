import React from 'react';
import { getLevelInfo } from '../../utils/levels';

interface LevelProgressBarProps {
    xp: number;
    className?: string;
    showLevel?: boolean;
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
    xp,
    className = '',
    showLevel = true,
}) => {
    const { level, progress, xpInLevel, xpToNext } =
        getLevelInfo(xp);

    return (
        <div className={`w-full ${className}`}>
            {showLevel && (
                <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="font-semibold text-dark">
                        Уровень {level}
                    </span>
                    <span className="text-xs text-dark/60">
                        {xpInLevel} / {xpToNext} XP
                    </span>
                </div>
            )}
            <div className="w-full h-3 overflow-hidden rounded-full shadow-inner bg-cream">
                <div
                    className="h-full transition-all duration-700 ease-out rounded-full bg-olive"
                    style={{ width: `${progress}%` }}
                >
                    <div className="w-full h-full bg-gradient-to-r from-olive/70 to-olive animate-pulse-soft" />
                </div>
            </div>
        </div>
    );
};

export default LevelProgressBar;
