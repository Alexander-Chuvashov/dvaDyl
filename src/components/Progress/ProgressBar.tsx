// src/components/Progress/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
    correctCount: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    total,
    correctCount,
}) => {
    const percentage = total > 0 ? ((current - 1) / total) * 100 : 0;

    return (
        <div className="w-full">
            <div className="flex justify-between mb-1 text-sm text-text-secondary">
                <span>Прогресс</span>
                <span>
                    {correctCount} / {total} верно
                </span>
            </div>
            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
