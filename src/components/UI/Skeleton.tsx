import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'card' | 'circle' | 'button';
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
}) => {
    const baseClasses = 'animate-pulse bg-cream/60 rounded';

    const variantClasses = {
        text: 'h-4 w-full',
        card: 'h-32 w-full rounded-xl',
        circle: 'h-12 w-12 rounded-fill',
        button: 'h-10 w-24 rounded-lg',
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        ></div>
    );
};

export default Skeleton;
