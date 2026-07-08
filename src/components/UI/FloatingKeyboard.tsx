import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface FloatingKeyboardProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (char: string) => void;
    targetRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

const TUVAN_LETTERS = ['Ң', 'Ө', 'Ү', 'ң', 'ө', 'ү'];

const FloatingKeyboard: React.FC<FloatingKeyboardProps> = ({
    isOpen,
    onClose,
    onInsert,
    targetRef,
}) => {
    const keyboardRef = useRef<HTMLDivElement>(null);

    // Закрытие по клику вне клавиатуры
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                keyboardRef.current &&
                !keyboardRef.current.contains(event.target as Node) &&
                targetRef.current &&
                !targetRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, targetRef]);

    // Закрытие по Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Позиционируем клавиатуру над полем ввода
    const inputRect = targetRef.current?.getBoundingClientRect();
    const top = inputRect ? inputRect.bottom + 8 : window.innerHeight / 2;
    const left = inputRect ? inputRect.left : window.innerWidth / 2;

    const keyboardContent = (
        <div
            ref={keyboardRef}
            className="fixed z-50 p-4 bg-white border shadow-lg rounded-xl border-cream"
            style={{
                top: Math.min(top, window.innerHeight - 200),
                left: Math.min(left, window.innerWidth - 250),
                minWidth: '200px',
            }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-dark/60">
                    Тувинские буквы
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-sm text-terracotta hover:underline"
                >
                    ✕
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {TUVAN_LETTERS.map(char => (
                    <button
                        key={char}
                        type="button"
                        onClick={() => {
                            onInsert(char);
                            // Не закрываем клавиатуру после вставки, чтобы можно было вводить несколько букв
                        }}
                        className="px-4 py-2 font-medium transition-colors border rounded-lg bg-cream hover:bg-terracotta/20 border-cream text-dark"
                    >
                        {char}
                    </button>
                ))}
            </div>
        </div>
    );

    return ReactDOM.createPortal(keyboardContent, document.body);
};

export default FloatingKeyboard;
