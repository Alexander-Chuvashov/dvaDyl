// src/components/LevelTabs.tsx
import React from 'react';

interface LevelTabsProps {
    levels: string[];
    activeLevel: string;
    onLevelChange: (level: string) => void;
}

const LevelTabs: React.FC<LevelTabsProps> = ({
    levels,
    activeLevel,
    onLevelChange,
}) => {
    return (
        <div className="flex flex-wrap gap-1 pb-1 mb-4 overflow-x-auto border-b sm:gap-2 sm:pb-2 sm:mb-6 border-border scrollbar-hide">
            {levels.map(level => (
                <button
                    key={level}
                    onClick={() => onLevelChange(level)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 rounded-t-lg whitespace-nowrap ${
                        activeLevel === level
                            ? 'bg-gold text-primary shadow-gold'
                            : 'bg-transparent text-secondary hover:text-primary hover:bg-card-hover'
                    }`}
                >
                    {level}
                </button>
            ))}
        </div>
    );
};

export default LevelTabs;
