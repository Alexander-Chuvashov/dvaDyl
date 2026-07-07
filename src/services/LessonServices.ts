// src/services/LessonService.ts
import { z } from 'zod';
import type { VocabularyWord } from '../types/content';
import { VocabularyWordSchema } from '../types/content';
import vocabularyData from '../../content/words/vocabulary.json';

export async function loadVocabulary(): Promise<VocabularyWord[]> {
    try {
        const words = z.array(VocabularyWordSchema).parse(vocabularyData.words);
        return words;
    } catch (error) {
        console.error('Ошибка загрузки словаря:', error);
        throw new Error('Невалидные данные словаря');
    }
}
