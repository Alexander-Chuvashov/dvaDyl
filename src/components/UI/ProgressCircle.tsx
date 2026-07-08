import React from 'react';

interface ProgressCircleProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    className?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
    progress,
    size = 48,
    strokeWidth = 4,
    color = '#556B4A',
    backgroundColor = '#E8DCC8',
    className = '',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <span
                className="absolute text-xs font-medium text-dark"
                style={{ fontSize: Math.max(10, size / 4) }}
            >
                {Math.round(progress)}%
            </span>
        </div>
    );
};

export default ProgressCircle;
