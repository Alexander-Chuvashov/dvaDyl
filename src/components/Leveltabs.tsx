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
        <div className="flex flex-wrap gap-2 mb-6">
            {levels.map(level => (
                <button
                    key={level}
                    onClick={() => onLevelChange(level)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                        activeLevel === level
                            ? 'bg-terracotta text-white shadow-button'
                            : 'bg-cream text-dark/60 hover:bg-cream/80'
                    }`}
                >
                    {level}
                </button>
            ))}
        </div>
    );
};

export default LevelTabs;
