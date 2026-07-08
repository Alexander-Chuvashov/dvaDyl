// src/services/TranslationService.ts
import { loadVocabulary } from './LessonServices';
import type { VocabularyWord } from '../types/content';

let vocabulary: VocabularyWord[] | null = null;
let loadingPromise: Promise<void> | null = null;

export const TranslationService = {
    // Загружаем словарь один раз
    loadVocabulary: async (): Promise<void> => {
        if (vocabulary) return;
        if (loadingPromise) return loadingPromise;
        loadingPromise = loadVocabulary()
            .then(data => {
                vocabulary = data;
            })
            .finally(() => {
                loadingPromise = null;
            });
        return loadingPromise;
    },

    // Получить перевод для слова (игнорируем регистр)
    getTranslation: (word: string): string | null => {
        if (!vocabulary) return null;
        const normalized = word.trim().toLowerCase();
        const found = vocabulary.find(
            item => item.wordTuvan.toLowerCase() === normalized,
        );
        return found?.wordRussian || null;
    },

    // Проверить, есть ли перевод
    hasTranslation: (word: string): boolean => {
        return !!TranslationService.getTranslation(word);
    },
};
