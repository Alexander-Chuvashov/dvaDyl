// src/components/UI/Mascot.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MascotState = 'idle' | 'happy' | 'sad' | 'celebrate' | 'thinking';

interface MascotProps {
    state?: MascotState;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Mascot: React.FC<MascotProps> = ({
    state = 'idle',
    className = '',
    size = 'md',
}) => {
    const [currentState, setCurrentState] = useState<MascotState>(state);

    useEffect(() => {
        setCurrentState(state);
    }, [state]);

    const sizeMap = {
        sm: 'w-12 h-12 text-4xl',
        md: 'w-20 h-20 text-6xl',
        lg: 'w-32 h-32 text-8xl',
    };

    // Анимации для каждого состояния
    const variants = {
        idle: {
            y: [0, -8, 0],
            rotate: [0, 2, -2, 0],
            transition: {
                y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            },
        },
        happy: {
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.6, repeat: 2, ease: 'easeInOut' },
        },
        sad: {
            scale: [1, 0.9, 1],
            y: [0, 10, 0],
            rotate: [0, 3, -3, 0],
            transition: { duration: 0.6, ease: 'easeInOut' },
        },
        celebrate: {
            scale: [1, 1.3, 1, 1.2, 1],
            y: [0, -30, 0, -15, 0],
            rotate: [0, -10, 10, -5, 0],
            transition: { duration: 1.2, repeat: 1, ease: 'easeInOut' },
        },
        thinking: {
            rotate: [0, -10, 0, 10, 0],
            y: [0, -5, 0],
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        },
    };

    // Эмодзи для персонажа (можно заменить на SVG)
    const getEmoji = () => {
        switch (currentState) {
            case 'happy':
                return '🐴✨';
            case 'sad':
                return '🐴😢';
            case 'celebrate':
                return '🐴🎉';
            case 'thinking':
                return '🐴🤔';
            default:
                return '🐴';
        }
    };

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
        >
            <motion.div
                className={`${sizeMap[size]} select-none`}
                variants={variants}
                animate={currentState}
                initial="idle"
                key={currentState}
            >
                {getEmoji()}
            </motion.div>
            {/* Баллончик с репликой (опционально) */}
            {currentState === 'happy' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute px-2 py-1 text-xs -translate-x-1/2 bg-white rounded-lg shadow-md -top-8 left-1/2 whitespace-nowrap"
                >
                    Отлично! 👍
                </motion.div>
            )}
            {currentState === 'sad' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute px-2 py-1 text-xs -translate-x-1/2 bg-white rounded-lg shadow-md -top-8 left-1/2 whitespace-nowrap"
                >
                    Попробуй ещё! 💪
                </motion.div>
            )}
            {currentState === 'celebrate' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute px-2 py-1 text-xs -translate-x-1/2 bg-white rounded-lg shadow-md -top-8 left-1/2 whitespace-nowrap"
                >
                    🎉 Ты молодец!
                </motion.div>
            )}
        </div>
    );
};

export default Mascot;
