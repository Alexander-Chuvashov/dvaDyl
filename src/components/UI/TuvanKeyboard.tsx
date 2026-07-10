// src/components/UI/TuvanKeyboard.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AudioService } from '../../services/AudioService';

interface TuvanKeyboardProps {
    inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
    onKeyPress?: (char: string) => void;
    onInput?: (newValue: string) => void;
    className?: string;
}

// Раскладка
const ROWS = [
    ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ'],
    ['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
    ['Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю'],
];
const TUVAN_EXTRA = ['Ң', 'Ө', 'Ү'];
const LOWER_ROWS = ROWS.map(row => row.map(char => char.toLowerCase()));
const LOWER_EXTRA = TUVAN_EXTRA.map(char => char.toLowerCase());

const TuvanKeyboard: React.FC<TuvanKeyboardProps> = ({
    inputRef,
    onKeyPress,
    onInput,
    className = '',
}) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isShift, setIsShift] = useState(false);
    const keyboardRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const insertChar = useCallback(
        (char: string) => {
            let input = document.activeElement as
                | HTMLInputElement
                | HTMLTextAreaElement
                | null;
            if (
                !input ||
                (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA')
            ) {
                input = inputRef?.current || null;
                if (!input) return;
            }

            const start = input.selectionStart ?? 0;
            const end = input.selectionEnd ?? 0;
            input.setRangeText(char, start, end, 'end');

            input.dispatchEvent(new Event('input', { bubbles: true }));

            if (onInput) {
                onInput(input.value);
            }
            if (onKeyPress) onKeyPress(char);
        },
        [inputRef, onInput, onKeyPress],
    );

    const handleKeyPress = (char: string) => {
        const finalChar = isShift ? char.toUpperCase() : char;
        AudioService.keyPress();
        insertChar(finalChar);
        setIsShift(false);
    };

    const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
            setShouldRender(true);
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
            }
            showTimeoutRef.current = setTimeout(() => {
                setIsVisible(true);
            }, 10);
        }
    };

    const handleBlur = (e: FocusEvent) => {
        const relatedTarget = e.relatedTarget as Node | null;
        if (
            keyboardRef.current &&
            keyboardRef.current.contains(relatedTarget)
        ) {
            return;
        }
        setTimeout(() => {
            const activeElement = document.activeElement;
            if (
                keyboardRef.current &&
                keyboardRef.current.contains(activeElement)
            ) {
                return;
            }
            setIsVisible(false);
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
            hideTimeoutRef.current = setTimeout(() => {
                setShouldRender(false);
                setIsShift(false);
            }, 300);
        }, 150);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    useEffect(() => {
        const inputs = document.querySelectorAll('input, textarea');
        const focusHandler = handleFocus as EventListener;
        const blurHandler = handleBlur as EventListener;
        inputs.forEach(input => {
            input.addEventListener('focus', focusHandler);
            input.addEventListener('blur', blurHandler);
        });

        return () => {
            inputs.forEach(input => {
                input.removeEventListener('focus', focusHandler);
                input.removeEventListener('blur', blurHandler);
            });
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
            if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        };
    }, []);

    if (!shouldRender) return null;

    const currentRows = isShift ? ROWS : LOWER_ROWS;
    const currentExtra = isShift ? TUVAN_EXTRA : LOWER_EXTRA;

    return createPortal(
        <div
            ref={keyboardRef}
            onMouseDown={handleMouseDown}
            className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl p-4 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'} ${className}`}
            style={{ maxHeight: '50vh', overflowY: 'auto' }}
        >
            <div className="flex flex-col gap-1.5 max-w-4xl mx-auto">
                {currentRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1">
                        {row.map(char => (
                            <KeyButton
                                key={char}
                                char={char}
                                isShift={isShift}
                                onClick={() => handleKeyPress(char)}
                                isTuvan={false}
                            />
                        ))}
                    </div>
                ))}
                <div className="flex justify-center gap-1">
                    {currentExtra.map(char => (
                        <KeyButton
                            key={char}
                            char={char}
                            isShift={isShift}
                            onClick={() => handleKeyPress(char)}
                            isTuvan
                        />
                    ))}
                    <button
                        type="button"
                        onClick={() => setIsShift(!isShift)}
                        className={`px-4 py-2 rounded-lg border font-medium transition-colors text-sm flex-1 max-w-[4rem] ${
                            isShift
                                ? 'bg-terracotta text-white border-terracotta'
                                : 'bg-cream hover:bg-terracotta/20 border-cream text-dark'
                        }`}
                    >
                        Shift
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            AudioService.keyPress();
                            insertChar(' ');
                        }}
                        className="px-6 py-2 bg-cream hover:bg-terracotta/20 rounded-lg border border-cream text-dark font-medium transition-colors flex-1 max-w-[8rem]"
                    >
                        Пробел
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const input = document.activeElement as
                                | HTMLInputElement
                                | HTMLTextAreaElement
                                | null;
                            if (
                                !input ||
                                (input.tagName !== 'INPUT' &&
                                    input.tagName !== 'TEXTAREA')
                            )
                                return;
                            AudioService.keyPress();
                            const start = input.selectionStart ?? 0;
                            const end = input.selectionEnd ?? 0;
                            if (start === end && start > 0) {
                                input.setRangeText('', start - 1, start, 'end');
                            } else if (start < end) {
                                input.setRangeText('', start, end, 'start');
                            }
                            input.dispatchEvent(
                                new Event('input', { bubbles: true }),
                            );
                            if (onInput) onInput(input.value);
                        }}
                        className="px-6 py-2 bg-cream hover:bg-terracotta/20 rounded-lg border border-cream text-dark font-medium transition-colors flex-1 max-w-[4rem] text-sm"
                    >
                        ⌫
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

// KeyButton
const KeyButton: React.FC<{
    char: string;
    isShift: boolean;
    onClick: () => void;
    isTuvan: boolean;
}> = ({ char, isShift, onClick, isTuvan }) => {
    const [pressed, setPressed] = useState(false);

    const handleClick = () => {
        setPressed(true);
        setTimeout(() => setPressed(false), 150);
        onClick();
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`px-3 py-2 rounded-lg border font-medium transition-all duration-100 text-sm min-w-[2.5rem] flex-1 max-w-[3rem] ${
                pressed ? 'scale-95' : 'scale-100'
            } ${
                isTuvan
                    ? 'bg-terracotta/10 hover:bg-terracotta/20 border-terracotta/30 text-terracotta'
                    : 'bg-cream hover:bg-terracotta/20 border-cream text-dark'
            }`}
        >
            {isShift ? char.toUpperCase() : char}
        </button>
    );
};

export default TuvanKeyboard;
