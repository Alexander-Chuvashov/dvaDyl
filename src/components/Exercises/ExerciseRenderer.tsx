import React from 'react';
import type { Exercise } from '../../types/content';
import TranslateExercise from './TranslateExercise';
import ChoiceExercise from './ChoiceExercise';
import OrderExercise from './OrderExercise';
import MatchExercise from './MatchExercise';
import ListenExercise from './ListenExercise';
// Listen и Fill можно добавить позже

interface Props {
    exercise: Exercise;
    onAnswer: (isCorrect: boolean, userAnswer?: string) => void;
}

const ExerciseRenderer: React.FC<Props> = ({ exercise, onAnswer }) => {
    switch (exercise.type) {
        case 'translate':
            return (
                <TranslateExercise exercise={exercise} onAnswer={onAnswer} />
            );
        case 'choice':
            return <ChoiceExercise exercise={exercise} onAnswer={onAnswer} />;
        case 'order':
            return <OrderExercise exercise={exercise} onAnswer={onAnswer} />;
        case 'match':
            return <MatchExercise exercise={exercise} onAnswer={onAnswer} />;
        case 'listen':
            return <ListenExercise exercise={exercise} onAnswer={onAnswer} />;
        default:
            return (
                <div className="p-4 border border-yellow-300 rounded-lg bg-yellow-50">
                    <p>❓ Неизвестный тип упражнения: {exercise.type}</p>
                </div>
            );
    }
};

export default ExerciseRenderer;
