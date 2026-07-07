import React, { useState } from 'react';
import { playAudio, isSpeechSupported } from '../../services/SpeechService';
import { Volume2, VolumeX } from 'lucide-react';

interface Props {
    text: string;
    lang?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const AudioButton: React.FC<Props> = ({
    text,
    lang = 'ru-RU',
    className = '',
    size = 'md',
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePlay = async () => {
        if (!isSpeechSupported()) {
            setError('Аудио не поддерживается в вашем браузере');
            return;
        }

        setIsPlaying(true);
        setError(null);

        try {
            await playAudio(text, lang);
        } catch (err) {
            setError('Не удалось воспроизвести аудио');
            console.error(err);
        } finally {
            setIsPlaying(false);
        }
    };

    const sizeClasses = {
        sm: 'w-6 h-6 p-1',
        md: 'w-8 h-8 p-1.5',
        lg: 'w-10 h-10 p-2',
    };

    return (
        <span className="inline-flex items-center gap-2">
            <button
                onClick={handlePlay}
                disabled={isPlaying}
                className={`rounded-full bg-terracotta/10 text-terracotta hover:bg-terracotta/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
                title="Прослушать"
                aria-label="Прослушать произношение"
            >
                {isPlaying ? (
                    <VolumeX className="w-full h-full animate-pulse-sort" />
                ) : (
                    <Volume2 className="w-full h-full" />
                )}
            </button>
            {error && <span className="text-xs text-terracotta">{error}</span>}
        </span>
    );
};

export default AudioButton;
