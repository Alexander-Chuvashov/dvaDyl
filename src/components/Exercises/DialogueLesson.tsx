// src/components/Exercises/DialogueDisplay.tsx
import React from 'react';
import type { Exercise } from '../../types/content';
import ClickableWord from '../UI/ClickableWord';
import { motion } from 'framer-motion';

interface DialogueLine {
    speaker: string;
    text: string;
    translation: string;
}

interface DialogueDisplayProps {
    exercise: Exercise & { lines?: DialogueLine[]; title?: string };
}

const DialogueLesson: React.FC<DialogueDisplayProps> = ({ exercise }) => {
    const lines = exercise.lines || [];

    return (
        <div className="p-4 space-y-3 card sm:p-6 sm:space-y-4">
            {exercise.title && (
                <h3 className="text-base font-bold sm:text-lg text-primary">
                    {exercise.title}
                </h3>
            )}
            <div className="pr-1 space-y-3 overflow-y-auto max-h-80 sm:max-h-96 sm:pr-2">
                {lines.map((line, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl ${
                            line.speaker === 'А'
                                ? 'bg-card-hover border border-gold/10'
                                : 'bg-gold/5 border border-gold/20'
                        }`}
                    >
                        <div className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full sm:w-8 sm:h-8 sm:text-sm bg-gold/20 text-gold shrink-0">
                            {line.speaker}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium break-words sm:text-base text-primary">
                                <ClickableWord word={line.text} />
                            </div>
                            <div className="text-xs sm:text-sm text-secondary mt-0.5 sm:mt-1">
                                {line.translation}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DialogueLesson;
