// src/services/AudioService.ts

// Создаём аудиоконтекст один раз для всего приложения
const audioCtx = new (
    window.AudioContext || (window as any).webkitAudioContext
)();

// Функция для генерации короткого звука
const playBeep = (
    frequency: number,
    duration: number,
    volume: number = 0.3,
    type: OscillatorType = 'sine',
) => {
    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.value = volume;

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (error) {
        // Игнорируем ошибки (например, если аудио не поддерживается)
        console.debug('Audio error:', error);
    }
};

export const AudioService = {
    // Звук правильного ответа (радостный, высокий)
    correct: () => {
        playBeep(880, 0.15, 0.3);
        setTimeout(() => playBeep(1100, 0.15, 0.3), 150);
    },

    // Звук неправильного ответа (низкий, грустный)
    incorrect: () => {
        playBeep(300, 0.3, 0.4, 'sawtooth');
    },

    // Звук завершения урока (победный)
    victory: () => {
        [523, 659, 784, 1047].forEach((freq, index) => {
            setTimeout(() => playBeep(freq, 0.15, 0.25), index * 150);
        });
    },

    // Звук перехода на следующее упражнение
    next: () => {
        playBeep(660, 0.08, 0.15);
    },

    // Звук при открытии урока (короткий щелчок)
    open: () => {
        playBeep(440, 0.05, 0.1);
    },

    keyPress: () => {
        playBeep(600, 0.03, 0.1);
    },
};
