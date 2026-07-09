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
        <div className="flex flex-wrap gap-1 pb-1 mb-6 border-b border-border">
            {levels.map(level => (
                <button
                    key={level}
                    onClick={() => onLevelChange(level)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg ${
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
