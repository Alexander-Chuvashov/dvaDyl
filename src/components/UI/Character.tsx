// src/components/UI/Character.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

type CharacterState =
    | 'idle'
    | 'happy'
    | 'motive'
    | 'sad'
    | 'celebrate'
    | 'thinking';

interface CharacterProps {
    state?: CharacterState;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Character: React.FC<CharacterProps> = ({
    state = 'idle',
    className = '',
    size = 'md',
}) => {
    const [currentState, setCurrentState] = useState<CharacterState>(state);

    useEffect(() => {
        setCurrentState(state);
    }, [state]);

    const sizeMap = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-40 h-40',
    };

    const images = {
        idle: '/images/characters/idle.png',
        happy: '/images/characters/happy.png',
        motive: '/images/characters/motive.png',
        sad: '/images/characters/sad.png',
        celebrate: '/images/characters/char.png',
        thinking: '/images/characters/think.png',
    };

    // Анимации для разных состояний (через variants для совместимости типов)
    const stateVariants: Variants = {
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
            transition: { duration: 1.2, ease: 'easeInOut' },
        },
        thinking: {
            rotate: [0, -10, 0, 10, 0],
            y: [0, -5, 0],
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        },
        motive: {
            y: [0, -8, 0],
            rotate: [0, 2, -2, 0],
            transition: {
                y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            },
        },
    };

    const imageVariants = {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
    };

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentState}
                    className={`${sizeMap[size]} relative`}
                    variants={stateVariants}
                    animate={currentState}
                    initial="idle"
                >
                    <motion.img
                        src={images[currentState]}
                        alt={currentState}
                        className="object-contain w-full h-full"
                        variants={imageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Баллончики с репликами */}
            <AnimatePresence>
                {currentState === 'happy' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-gold/20 text-primary rounded-lg px-3 py-1.5 text-xs shadow-gold whitespace-nowrap"
                    >
                        Отлично! 👍
                    </motion.div>
                )}
                {currentState === 'sad' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-error/20 text-error rounded-lg px-3 py-1.5 text-xs shadow-gold whitespace-nowrap"
                    >
                        Попробуй ещё! 💪
                    </motion.div>
                )}
                {currentState === 'celebrate' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-gold/20 text-gold rounded-lg px-3 py-1.5 text-xs shadow-gold whitespace-nowrap"
                    >
                        🎉 Ты молодец!
                    </motion.div>
                )}
                {currentState === 'thinking' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-gold/20 text-secondary rounded-lg px-3 py-1.5 text-xs shadow-gold whitespace-nowrap"
                    >
                        🤔 Подумай...
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Character;
