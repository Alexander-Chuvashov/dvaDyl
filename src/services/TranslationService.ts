// src/services/TranslationService.ts
import { loadVocabulary } from './LessonServices';
import type { VocabularyWord } from '../types/content';

let vocabulary: VocabularyWord[] | null = null;
let loadingPromise: Promise<void> | null = null;

export const TranslationService = {
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

    // Ищет перевод в обоих направлениях
    getTranslation: (
        word: string,
    ): { translation: string; from: 'tuvan' | 'russian' } | null => {
        if (!vocabulary) return null;
        const normalized = word.trim().toLowerCase();

        // Ищем как тувинское слово
        const foundAsTuvan = vocabulary.find(
            item => item.wordTuvan.toLowerCase() === normalized,
        );
        if (foundAsTuvan) {
            return {
                translation: foundAsTuvan.wordRussian,
                from: 'tuvan',
            };
        }

        // Ищем как русское слово
        const foundAsRussian = vocabulary.find(
            item => item.wordRussian.toLowerCase() === normalized,
        );
        if (foundAsRussian) {
            return {
                translation: foundAsRussian.wordTuvan,
                from: 'russian',
            };
        }

        return null;
    },

    // Проверяем, есть ли перевод для слова
    hasTranslation: (word: string): boolean => {
        return !!TranslationService.getTranslation(word);
    },
};
