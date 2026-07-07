export const isSpeechSupported = (): boolean => {
    return 'speechSynthesis' in window;
};

export const getAvailableVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise(resolve => {
        const synth = window.speechSynthesis;

        let voices = synth.getVoices();
        if (voices.length > 0) {
            resolve(voices);
            return;
        }

        synth.onvoiceschanged = () => {
            voices = synth.getVoices();
            resolve(voices);
        };
    });
};

export const findBestVoice = async (
    langPrefix: string = 'ru',
): Promise<SpeechSynthesisVoice | null> => {
    const voices = await getAvailableVoices();

    let found = voices.find(voice => voice.lang.startsWith(langPrefix));
    if (!found) {
        found = voices[0] || null;
    }
    return found;
};

export const speakText = async (
    text: string,
    options?: {
        rate?: number;
        pitch?: number;
        volume?: number;
        lang?: string;
    },
): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!isSpeechSupported()) {
            reject(new Error('SpeechSynthesis не поддерживается'));
            return;
        }

        const synth = window.speechSynthesis;

        if (synth.speaking) {
            synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.rate = options?.rate ?? 0.9;
        utterance.pitch = options?.pitch ?? 1;
        utterance.volume = options?.volume ?? 1;
        utterance.lang = options?.lang ?? 'ru-RU';

        findBestVoice(utterance.lang.split('-')[0]).then(voice => {
            if (voice) {
                utterance.voice = voice;
            }

            utterance.onend = () => resolve();
            utterance.onerror = event => reject(event);
            synth.speak(utterance);
        });
    });
};

export const playAudio = async (text: string, lang: string = 'ru-RU') => {
    try {
        await speakText(text, { lang, rate: 0.9 });
    } catch (error) {
        console.error('Ошибка синтеза речи', error);
    }
};
