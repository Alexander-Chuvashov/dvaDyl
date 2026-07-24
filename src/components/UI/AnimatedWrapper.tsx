// src/components/UI/AnimatedWrapper.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedWrapperProps {
    children: React.ReactNode;
    animation?: 'fadeIn' | 'slideUp' | 'scaleIn';
    delay?: number;
    className?: string;
}

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
    children,
    animation = 'fadeIn',
    delay = 0,
    className = '',
}) => {
    const animations = {
        fadeIn: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.4, delay },
        },
        slideUp: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay },
        },
        scaleIn: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.3, delay },
        },
    };

    const selected = animations[animation];

    return (
        <motion.div
            initial={selected.initial}
            animate={selected.animate}
            transition={selected.transition}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedWrapper;
