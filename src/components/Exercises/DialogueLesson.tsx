// src/components/Exercises/DialogueLesson.tsx
import React from 'react';
import type { Exercise } from '../../types/content';
import ClickableWord from '../UI/ClickableWord';
import ExerciseRenderer from './ExerciseRenderer';
import { motion } from 'framer-motion';

interface DialogueLine {
    speaker: string;
    textTuvan: string;
    textRu: string;
}

interface DialogueLessonProps {
    exercise: Exercise & {
        dialogueLines?: DialogueLine[];
        exercises?: Exercise[];
    };
    onAnswer: (
        isCorrect: boolean,
        userAnswer?: string,
        correctAnswer?: string,
    ) => void;
}

const DialogueLesson: React.FC<DialogueLessonProps> = ({
    exercise,
    onAnswer,
}) => {
    const lines = exercise.dialogueLines || [];
    const subExercises = exercise.exercises || [];

    return (
        <div className="space-y-6">
            {/* Диалог */}
            <div className="space-y-4 card">
                <h3 className="text-lg font-bold text-primary">💬 Диалог</h3>
                <div className="pr-2 space-y-3 overflow-y-auto max-h-96">
                    {lines.map((line, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-start gap-3 p-3 rounded-xl ${
                                line.speaker === 'Айлан'
                                    ? 'bg-card-hover border border-gold/10'
                                    : 'bg-gold/5 border border-gold/20'
                            }`}
                        >
                            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full bg-gold/20 text-gold shrink-0">
                                {line.speaker[0]}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-primary">
                                    <ClickableWord word={line.textTuvan} />
                                </div>
                                <div className="mt-1 text-sm text-secondary">
                                    {line.textRu}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Упражнения по диалогу */}
            {subExercises.map((subExercise, index) => (
                <div key={subExercise.id} className="card">
                    <h4 className="mb-3 font-semibold text-md text-primary">
                        Упражнение {index + 1}
                    </h4>
                    <ExerciseRenderer
                        exercise={subExercise}
                        onAnswer={onAnswer}
                    />
                </div>
            ))}
        </div>
    );
};

export default DialogueLesson;
