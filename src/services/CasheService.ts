// src/services/CacheService.ts
import { loadAllChapters } from './ContentService';
import { loadVocabulary } from './LessonServices';

export class CacheService {
    private static CACHE_KEY_CONTENT = 'dva-dyl-content';
    private static CACHE_KEY_PROGRESS = 'dva-dyl-progress';

    // Сохраняем контент в localStorage
    static cacheContent(): void {
        const content = {
            chapters: loadAllChapters(),
            vocabulary: loadVocabulary(),
        };
        localStorage.setItem(this.CACHE_KEY_CONTENT, JSON.stringify(content));
    }

    // Загружаем контент из кеша
    static getCachedContent() {
        try {
            const data = localStorage.getItem(this.CACHE_KEY_CONTENT);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    // Сохраняем прогресс в localStorage
    static cacheProgress(progress: any): void {
        localStorage.setItem(this.CACHE_KEY_PROGRESS, JSON.stringify(progress));
    }

    // Загружаем прогресс из кеша
    static getCachedProgress() {
        try {
            const data = localStorage.getItem(this.CACHE_KEY_PROGRESS);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    // Очищаем кеш
    static clearCache(): void {
        localStorage.removeItem(this.CACHE_KEY_CONTENT);
        localStorage.removeItem(this.CACHE_KEY_PROGRESS);
    }
}
