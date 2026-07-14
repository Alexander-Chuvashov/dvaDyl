import React from 'react';

interface VirtualKeyboardProps {
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    onInsert?: (char: string) => void;
    className?: string;
}

const TUVAN_LETTERS = ['Ң', 'Ө', 'Ү', 'ң', 'ө', 'ү'];

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    inputRef,
    onInsert,
    className = '',
}) => {
    const handleInsert = (char: string) => {
        const input = inputRef.current;
        if (!input) return;

        // Вставляем символ в позицию курсора
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const text = input.value;
        const newText = text.substring(0, start) + char + text.substring(end);
        input.value = newText;

        // Устанавливаем курсор после вставленного символа
        const newCursor = start + char.length;
        input.setSelectionRange(newCursor, newCursor);

        // Вызываем событие input, чтобы React обновил состояние
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);

        if (onInsert) onInsert(char);
    };

    return (
        <div className={`flex flex-wrap gap-2 mt-2 ${className}`}>
            {TUVAN_LETTERS.map(char => (
                <button
                    key={char}
                    type="button"
                    onClick={() => handleInsert(char)}
                    className="px-3 py-2 font-medium transition-colors border rounded-lg bg-cream hover:bg-terracotta/20 border-cream text-dark"
                >
                    {char}
                </button>
            ))}
        </div>
    );
};

export default VirtualKeyboard;
