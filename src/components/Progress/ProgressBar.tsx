// src/components/Progress/ProgressBar.tsx
import React from 'react';

interface Props {
    current: number;
    total: number;
    correctCount: number;
}

const ProgressBar: React.FC<Props> = ({ current, total, correctCount }) => {
    const percentage = ((current - 1) / total) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between mb-1 text-sm text-dark/70">
                <span>Прогресс</span>
                <span>
                    {correctCount} / {total} верно
                </span>
            </div>
            <div className="w-full h-3 rounded-full bg-cream">
                <div
                    className="h-3 transition-all duration-300 rounded-full bg-olive"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
