import React, { useEffect, useState } from 'react';

interface Props {
    value: number;
    onComplete?: () => void;
}

const FloatingXP: React.FC<Props> = ({ value, onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, 1000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) return null;

    return (
        <div className="fixed text-4xl font-bold -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2 text-gold animate-float-up">
            +{value} XP
        </div>
    );
};

export default FloatingXP;
