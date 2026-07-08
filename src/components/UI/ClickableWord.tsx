// src/components/UI/ClickableWord.tsx
import React, { useState } from 'react';
import { TranslationService } from '../../services/TranslationService';
import WordPopover from './WordPopover';

interface ClickableWordProps {
    word: string;
    children?: React.ReactNode;
    className?: string;
}

const ClickableWord: React.FC<ClickableWordProps> = ({
    word,
    children,
    className = '',
}) => {
    const [popover, setPopover] = useState<{
        word: string;
        translation: string;
        from: 'tuvan' | 'russian';
        x: number;
        y: number;
    } | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const result = TranslationService.getTranslation(word);
        if (result) {
            setPopover({
                word,
                translation: result.translation,
                from: result.from,
                x: rect.left + rect.width / 2,
                y: rect.top,
            });
        }
    };

    return (
        <>
            <span
                onClick={handleClick}
                className={`cursor-pointer border-b border-dashed border-terracotta/40 hover:border-terracotta transition-colors ${className}`}
                title="Нажми для перевода"
            >
                {children || word}
            </span>
            {popover && (
                <WordPopover
                    word={popover.word}
                    translation={popover.translation}
                    from={popover.from}
                    position={{ x: popover.x, y: popover.y }}
                    onClose={() => setPopover(null)}
                />
            )}
        </>
    );
};

export default ClickableWord;
