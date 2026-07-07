import React, { useEffect, useState } from 'react';

interface Props {
    children: React.ReactNode;
    animation?: 'fadeIn' | 'slideUp' | 'scaleIn';
    delay?: number;
    className?: string;
}

const AnimatedWrapper: React.FC<Props> = ({
    children,
    animation = 'fadeIn',
    delay = 0,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    const animationClass = {
        fadeIn: 'animate-[fadeIn_0.4s_ease-out_forwards]',
        slideUp: 'animate-[slideUp_0.5s_ease-out_forwards]',
        scaleIn: 'animate-[scaleIn_0.3s_ease-out_forwards]',
    }[animation];

    return (
        <div
            className={`${isVisible ? animationClass : 'opacity-0'} ${className}`}
        >
            {children}
        </div>
    );
};

export default AnimatedWrapper;
