// src/types/content.ts
import { z } from 'zod';

export interface Exercise {
    id: string;
    type: ExerciseType;
    order: number;
    question?: string;
    correct?: string | string[];
    options?: string[];
    audioUrl?: string;
    hint?: string;
    imageUrl?: string;
    orderItems?: string[];
    matchPairs?: { left: string; right: string }[];
    correctFill?: string;
    explanation?: string;
    dialogueLines?: { speaker: string; textTuvan: string; textRu: string }[];
    exercises?: Exercise[];
    cards?: { promptRu: string; targetTuvan: string; hint?: string }[];
}

// Типы упражнений
export type ExerciseType =
    | 'translate'
    | 'choice'
    | 'listen'
    | 'order'
    | 'match'
    | 'fill'
    | 'dialogue_lesson'
    | 'speaking_card';

// Схема для упражнения (Zod)
export const ExerciseSchema: z.ZodType<Exercise> = z.object({
    id: z.string(),
    type: z.enum([
        'translate',
        'choice',
        'listen',
        'order',
        'match',
        'fill',
        'dialogue_lesson',
        'speaking_card',
    ]),
    order: z.number().int().nonnegative(),
    question: z.string().optional(),
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
    explanation: z.string().optional(),
    dialogueLines: z
        .array(
            z.object({
                speaker: z.string(),
                textTuvan: z.string(),
                textRu: z.string(),
            }),
        )
        .optional(),
    exercises: z.array(z.lazy(() => ExerciseSchema)).optional(),
    cards: z
        .array(
            z.object({
                promptRu: z.string(),
                targetTuvan: z.string(),
                hint: z.string().optional(),
            }),
        )
        .optional(),
});

// Остальные интерфейсы (без изменений)
export interface Theory {
    type: 'theory';
    id: string;
    chapterId: string;
    title: string;
    titleTuvan?: string;
    content: string;
    order: number;
    tableData?: { headers: string[]; rows: string[][] };
    listItems?: string[];
    audioUrl?: string;
}

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
    difficulty?: 1 | 2 | 3;
    estimatedTime?: number;
    exercises: Exercise[];
}

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

export interface Chapter {
    id: string;
    title: string;
    titleTuvan: string;
    description: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    order: number;
    coverImage?: string;
    lessons?: (Lesson | Theory)[];
}

export const ChapterSchema = z.object({
    id: z.string(),
    title: z.string(),
    titleTuvan: z.string(),
    description: z.string(),
    level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']),
    order: z.number().int(),
    coverImage: z.string().optional(),
    lessons: z.array(z.union([TheorySchema, LessonSchema])).optional(),
});

// Словарное слово
export interface VocabularyWord {
    id: string;
    wordTuvan: string;
    wordRussian: string;
    transcription?: string;
    audioUrl?: string;
    partOfSpeech?:
        | 'noun'
        | 'verb'
        | 'adjective'
        | 'adverb'
        | 'pronoun'
        | 'other';
    difficulty: 1 | 2 | 3 | 4 | 5;
    categories: string[];
    exampleSentence?: string;
    exampleTranslation?: string;
}
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
            'conjunction',
            'preposition',
        ])
        .optional(),
    difficulty: z.number().int().min(1).max(5),
    categories: z.array(z.string()),
    exampleSentence: z.string().optional(),
    exampleTranslation: z.string().optional(),
});

// Конфиг приложения
export interface AppConfig {
    version: string;
    languages: {
        source: string;
        target: string;
    };
    categories: string[];
    skills: string[];
}

export const AppConfigSchema = z.object({
    version: z.string(),
    languages: z.object({
        source: z.string(),
        target: z.string(),
    }),
    categories: z.array(z.string()),
    skills: z.array(z.string()),
});

// Достижения
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: {
        type:
            | 'lessons_completed'
            | 'streak'
            | 'xp'
            | 'chapter_completed'
            | 'perfect_lesson';
        target: number;
        chapterId?: string;
    };
}

export interface UserAchievement {
    achievementId: string;
    unlockedAt: string;
}
