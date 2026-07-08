// src/components/UI/WordPopover.tsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface WordPopoverProps {
    word: string;
    translation: string;
    from: 'tuvan' | 'russian';
    position: { x: number; y: number };
    onClose: () => void;
}

const WordPopover: React.FC<WordPopoverProps> = ({
    word,
    translation,
    from,
    position,
    onClose,
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const directionLabel = from === 'tuvan' ? 'тув → рус' : 'рус → тув';

    return createPortal(
        <div
            ref={popoverRef}
            className="fixed z-50 max-w-xs p-3 border rounded-lg shadow-xl bg-surface border-cream"
            style={{
                left: position.x,
                top: position.y - 10,
                transform: 'translateY(-100%)',
                pointerEvents: 'auto',
            }}
        >
            <div className="text-sm font-medium text-dark">{word}</div>
            <div className="text-sm text-terracotta">{translation}</div>
            <div className="mt-1 text-xs text-dark/50">{directionLabel}</div>
            <div className="absolute w-2 h-2 rotate-45 border-b border-r -bottom-1 left-4 bg-surface border-cream" />
        </div>,
        document.body,
    );
};

export default WordPopover;
