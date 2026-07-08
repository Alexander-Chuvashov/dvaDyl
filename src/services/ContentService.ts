// src/services/ContentService.ts
import type { Chapter, Lesson, Theory } from '../types/content';
import { ChapterSchema, LessonSchema, TheorySchema } from '../types/content';

// Используем один статический glob для всех JSON-файлов в папке chapters
const allModules = import.meta.glob('../../content/chapters/**/*.json', {
    eager: true,
});

export const loadAllChapters = async (): Promise<Chapter[]> => {
    // Временная структура для группировки
    const chapterMap: Record<
        string,
        { chapter?: any; theories: any[]; lessons: any[] }
    > = {};

    // Проходим по всем загруженным файлам
    for (const [path, mod] of Object.entries(allModules)) {
        // Извлекаем имя папки главы: .../chapters/01-introduction/...
        const match = path.match(/chapters\/([^/]+)\//);
        if (!match) continue;
        const chapterId = match[1];

        // Инициализируем группу, если её нет
        if (!chapterMap[chapterId]) {
            chapterMap[chapterId] = { theories: [], lessons: [] };
        }

        const data = (mod as any).default;
        const fileName = path.split('/').pop(); // например, 'chapter.json'

        // Определяем тип файла по имени
        if (fileName === 'chapter.json') {
            chapterMap[chapterId].chapter = data;
        } else if (fileName?.startsWith('theory-')) {
            chapterMap[chapterId].theories.push(data);
        } else if (fileName?.startsWith('lesson-')) {
            chapterMap[chapterId].lessons.push(data);
        }
    }

    // Теперь собираем массив Chapter
    const chapters: Chapter[] = [];

    for (const [id, group] of Object.entries(chapterMap)) {
        if (!group.chapter) {
            console.warn(`Глава ${id} не содержит chapter.json`);
            continue;
        }

        try {
            // Парсим главу
            const chapter = ChapterSchema.parse(group.chapter);

            // Парсим теории и уроки с обработкой ошибок
            const theories: Theory[] = [];
            const lessons: Lesson[] = [];

            for (const t of group.theories) {
                try {
                    theories.push(TheorySchema.parse(t));
                } catch (e) {
                    console.error(`Ошибка в теории файла ${id}:`, e);
                }
            }

            for (const l of group.lessons) {
                try {
                    lessons.push(LessonSchema.parse(l));
                } catch (e) {
                    console.error(`Ошибка в уроке файла ${id}:`, e);
                }
            }

            // Объединяем и сортируем по order
            const items = [...theories, ...lessons].sort(
                (a, b) => a.order - b.order,
            );
            chapter.lessons = items;

            chapters.push(chapter);
        } catch (e) {
            console.error(`Ошибка парсинга главы ${id}:`, e);
        }
    }

    // Сортируем главы по order
    return chapters.sort((a, b) => a.order - b.order);
};
