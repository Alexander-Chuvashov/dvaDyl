// src/types/content.ts
import { z } from 'zod';

// Схема для упражнения
export const ExerciseSchema = z.object({
    id: z.string(),
    type: z.enum(['translate', 'choice', 'listen', 'order', 'match', 'fill']),
    order: z.number().int().nonnegative(),
    question: z.string(),
    correct: z.union([z.string(), z.array(z.string())]).optional(),
    options: z.array(z.string()).optional(),
    audioUrl: z.string().optional(),
    hint: z.string().optional(),
    imageUrl: z.string().optional(),
    orderItems: z.array(z.string()).optional(),
    matchPairs: z
        .array(
            z.object({
                left: z.string(),
                right: z.string(),
            }),
        )
        .optional(),
    correctFill: z.string().optional(),
});

// // Схема для урока
// export const LessonSchema = z.object({
//     id: z.string(),
//     title: z.string(),
//     titleTuvan: z.string(),
//     description: z.string().optional(),
//     skill: z.string(),
//     order: z.number().int(),
//     isPublished: z.boolean().default(true),
//     difficulty: z.number().int().min(1).max(3).optional(),
//     estimatedTime: z.number().int().optional(),
//     tags: z.array(z.string()).optional(),
//     exercises: z.array(ExerciseSchema),
// });

// Схема для словарного слова
export const VocabularyWordSchema = z.object({
    id: z.string(),
    wordTuvan: z.string(),
    wordRussian: z.string(),
    transcription: z.string().optional(),
    audioUrl: z.string().optional(),
    partOfSpeech: z
        .enum([
            'noun',
            'verb',
            'adjective',
            'adverb',
            'pronoun',
            'other',
            'interjection',
            'numeral',
            'phrase',
        ])
        .optional(),
    difficulty: z.number().int().min(1).max(5),
    categories: z.array(z.string()),
    exampleSentence: z.string().optional(),
    exampleTranslation: z.string().optional(),
});

// Схема для конфига
export const AppConfigSchema = z.object({
    version: z.string(),
    languages: z.object({
        source: z.string(),
        target: z.string(),
    }),
    categories: z.array(z.string()),
    skills: z.array(z.string()),
});

// src/types/content.ts

// ─── Теоретический блок ───────────────────────────────────────────────────────
export const TheorySchema = z.object({
    type: z.literal('theory'),
    id: z.string(),
    chapterId: z.string(),
    title: z.string(),
    titleTuvan: z.string().optional(),
    content: z.string(),
    order: z.number().int(),
    tableData: z
        .object({
            headers: z.array(z.string()),
            rows: z.array(z.array(z.string())),
        })
        .optional(),
    listItems: z.array(z.string()).optional(),
    audioUrl: z.string().optional(),
});

export const LessonSchema = z.object({
    type: z.literal('lesson'),
    id: z.string(),
    chapterId: z.string(),
    title: z.string(),
    titleTuvan: z.string(),
    description: z.string().optional(),
    skill: z.string(),
    order: z.number().int(),
    isPublished: z.boolean().default(true),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
    estimatedTime: z.number().int().optional(),
    exercises: z.array(ExerciseSchema),
});

// ─── Глава (модуль) ───────────────────────────────────────────────────────────
export const ChapterSchema = z.object({
    id: z.string(),
    title: z.string(),
    titleTuvan: z.string(),
    description: z.string(),
    level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']),
    order: z.number().int(),
    coverImage: z.string().optional(),
    lessons: z.array(z.union([TheorySchema, LessonSchema])).optional(), // <-- делаем optional
});

// ─── Урок
export interface Lesson {
    type: 'lesson';
    id: string;
    chapterId: string;
    title: string;
    titleTuvan: string;
    description?: string;
    skill: string;
    order: number;
    isPublished: boolean;
    difficulty?: number;
    estimatedTime?: number;
    exercises: Exercise[];
}

// Достижение
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string; // emoji или путь к иконке
    condition: {
        type:
            | 'lessons_completed'
            | 'streak'
            | 'xp'
            | 'chapter_completed'
            | 'perfect_lesson';
        target: number;
        chapterId?: string; // для chapter_completed
    };
}

// Выданное достижение пользователю
export interface UserAchievement {
    achievementId: string;
    unlockedAt: string;
}
// ─────────────────────────────────────────────────────────────────────

export type Theory = z.infer<typeof TheorySchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
// Типы (выводятся автоматически из схем)
export type Exercise = z.infer<typeof ExerciseSchema>;
// export type Lesson = z.infer<typeof LessonSchema>;
export type VocabularyWord = z.infer<typeof VocabularyWordSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
