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
        <div className="flex flex-wrap gap-2 pb-2 mb-6 border-b border-cream">
            {levels.map(level => (
                <button
                    key={level}
                    onClick={() => onLevelChange(level)}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                        activeLevel === level
                            ? 'bg-terracotta text-white shadow-button'
                            : 'bg-transparent text-dark/60 hover:text-dark hover:bg-cream/50'
                    }`}
                >
                    {level}
                </button>
            ))}
        </div>
    );
};

export default LevelTabs;
