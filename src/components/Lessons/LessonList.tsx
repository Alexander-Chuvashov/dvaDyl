import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { loadAllLessons } from '../../services/ContentService';
import LessonCard from './LessonCard';
import AnimatedWrapper from '../UI/AnimatedWrapper';

const LessonList: React.FC = () => {
    const { lessons, setLessons } = useAppStore();

    useEffect(() => {
        loadAllLessons()
            .then(data => setLessons(data))
            .catch(console.error);
    }, [setLessons]);

    return (
        <div className="max-w-4xl p-6 mx-auto">
            <AnimatedWrapper animation="slideUp">
                <h1 className="mb-6 text-3xl font-bold text-dark">
                    📚 Уроки тувинского
                </h1>
            </AnimatedWrapper>
            <div className="grid gap-4">
                {lessons.map((lesson, index) => (
                    <AnimatedWrapper
                        key={lesson.id}
                        animation="fadeIn"
                        delay={index * 80}
                    >
                        <LessonCard lesson={lesson} />
                    </AnimatedWrapper>
                ))}
            </div>
        </div>
    );
};

export default LessonList;
